
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Grid, 
  Layout, 
  Check, 
  X, 
  Loader2, 
  Zap,
  Info,
  Monitor,
  Scissors,
  Layers,
  Archive,
  ArrowRight,
  Eye,
  Settings,
  ShieldCheck,
  Activity,
  Trash2,
  Coins,
  AlertTriangle,
  CreditCard,
  History,
  Maximize2,
  Minimize2,
  Palette,
  Gauge,
  Video,
  Clapperboard,
  Clock,
  Play,
  Pause,
  Split,
  ChevronRight,
  Cpu,
  Waves
} from 'lucide-react';
import JSZip from 'jszip';
// @ts-ignore
import gifshot from 'gifshot';
import { useWallet } from '../context/WalletContext';

// Lazy load FFmpeg
let FFmpeg: any = null;
let fetchFile: any = null;

type ToolType = 'splitter' | 'optimizer' | 'converter';
type SplitMode = 'artwork' | 'workshop' | 'background';

interface SlicedImage {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

interface GiftFrame {
  id: string;
  dataUrl: string;
}

const TOOL_CREDIT_COST = 10;

const Tools: React.FC = () => {
  const { balance, deductCredits } = useWallet();
  const [currentTool, setCurrentTool] = useState<ToolType>('splitter');
  
  // Shared Source State
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceFileSize, setSourceFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Splitter State
  const [splitterMode, setSplitterMode] = useState<SplitMode>('artwork');
  const [slices, setSlices] = useState<SlicedImage[]>([]);
  
  // Optimizer State
  const [optCompression, setOptCompression] = useState(10);
  const [optColors, setOptColors] = useState(256);
  const [optDropFrames, setOptDropFrames] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [optimizedPreviewUrl, setOptimizedPreviewUrl] = useState<string | null>(null);

  // Video Converter State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [targetWidth, setTargetWidth] = useState(506);
  const [fps, setFps] = useState(15);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Common Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<GiftFrame[]>([]);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingProgress, setEncodingProgress] = useState({ current: 0, total: 100, message: '' });
  
  // Daily Usage State
  const [hasUsedFreeToday, setHasUsedFreeToday] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const isSteamReady = estimatedSize < 8 * 1024 * 1024;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lastUsed = (window as any).localStorage.getItem('last_tool_use');
    const today = new Date().toDateString();
    if (lastUsed === today) setHasUsedFreeToday(true);
  }, []);

  const loadFFmpeg = async () => {
    if (isFFmpegLoaded) return;
    try {
      const { FFmpeg: F } = await import('@ffmpeg/ffmpeg');
      const { fetchFile: FF } = await import('@ffmpeg/util');
      FFmpeg = new F();
      fetchFile = FF;
      await FFmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      });
      setIsFFmpegLoaded(true);
    } catch (err) {
      console.error("FFmpeg loading failed", err);
    }
  };

  useEffect(() => {
    if (currentTool === 'converter') loadFFmpeg();
  }, [currentTool]);

  useEffect(() => {
    if (sourceFileSize > 0 && currentTool === 'optimizer') {
      let reduction = (optCompression / 20) * 0.4;
      if (optColors < 256) reduction += 0.2;
      if (optDropFrames) reduction += 0.35;
      const newSize = sourceFileSize * (1 - Math.min(reduction, 0.85));
      setEstimatedSize(newSize);
    } else if (currentTool === 'converter' && videoFile) {
      const duration = endTime - startTime;
      const base = (targetWidth * targetWidth * 0.5) * fps * duration * 0.001; 
      setEstimatedSize(base);
    } else if (currentTool === 'splitter' && sourceFileSize > 0) {
      setEstimatedSize(sourceFileSize);
    }
  }, [optCompression, optColors, optDropFrames, sourceFileSize, currentTool, startTime, endTime, targetWidth, fps]);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith('video/')) {
      setCurrentTool('converter');
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setFileType(file.type);
      setSourceFileSize(file.size);
      return;
    }

    if (!file.type.startsWith('image/')) {
      (window as any).alert("Invalid format.");
      return;
    }

    setFileType(file.type);
    setSourceFileSize(file.size);
    const isGif = file.type === 'image/gif';

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        setSourceImage(img);
        setSourceUrl(e.target?.result as string);
        setOptimizedPreviewUrl(e.target?.result as string);
        
        if (isGif) {
           const canvas = (window as any).document.createElement('canvas');
           const ctx = canvas.getContext('2d');
           if (ctx) {
             canvas.width = 200;
             canvas.height = 200;
             const frames = Array.from({ length: 24 }).map((_, i) => {
               ctx.clearRect(0, 0, 200, 200);
               ctx.drawImage(img, 0, 0, 200, 200);
               return { id: `frame-${i}`, dataUrl: canvas.toDataURL('image/jpeg', 0.7) };
             });
             setExtractedFrames(frames);
           }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const generateSlices = useCallback(() => {
    if (!sourceImage || currentTool !== 'splitter') return;
    setIsProcessing(true);
    const newSlices: SlicedImage[] = [];
    const canvas = (window as any).document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setTimeout(() => {
      const imgWidth = (sourceImage as any).width;
      const imgHeight = (sourceImage as any).height;
      if (splitterMode === 'artwork') {
        const mainW = 506;
        const sideW = 100;
        const gap = 5;
        canvas.width = mainW;
        canvas.height = imgHeight;
        ctx.drawImage(sourceImage, 0, 0, mainW, imgHeight, 0, 0, mainW, imgHeight);
        newSlices.push({ id: 'main', name: fileType === 'image/gif' ? 'artwork_main.gif' : 'artwork_main.png', dataUrl: canvas.toDataURL(), width: mainW, height: imgHeight });
        canvas.width = sideW;
        ctx.clearRect(0, 0, sideW, imgHeight);
        ctx.drawImage(sourceImage, mainW + gap, 0, sideW, imgHeight, 0, 0, sideW, imgHeight);
        newSlices.push({ id: 'side', name: fileType === 'image/gif' ? 'artwork_side.gif' : 'artwork_side.png', dataUrl: canvas.toDataURL(), width: sideW, height: imgHeight });
      } else if (splitterMode === 'workshop') {
        const stripW = Math.floor(imgWidth / 5);
        canvas.width = stripW;
        canvas.height = imgHeight;
        for (let i = 0; i < 5; i++) {
          ctx.clearRect(0, 0, stripW, imgHeight);
          ctx.drawImage(sourceImage, i * stripW, 0, stripW, imgHeight, 0, 0, stripW, imgHeight);
          newSlices.push({ id: `workshop-${i}`, name: fileType === 'image/gif' ? `workshop_${i + 1}.gif` : `workshop_${i + 1}.png`, dataUrl: canvas.toDataURL(), width: stripW, height: imgHeight });
        }
      } else {
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        ctx.drawImage(sourceImage, 0, 0);
        newSlices.push({ id: 'bg', name: fileType === 'image/gif' ? 'background.gif' : 'background.png', dataUrl: canvas.toDataURL(), width: imgWidth, height: imgHeight });
      }
      setSlices(newSlices);
      setIsProcessing(false);
    }, 600);
  }, [sourceImage, splitterMode, fileType, currentTool]);

  useEffect(() => {
    if (sourceImage) generateSlices();
  }, [sourceImage, splitterMode, generateSlices]);

  const convertVideoToGif = async (): Promise<Blob> => {
    if (!videoFile || !isFFmpegLoaded) throw new Error("Not ready");
    setEncodingProgress({ current: 0, total: 100, message: "Ingesting Video Buffer..." });
    await FFmpeg.writeFile('input.mp4', await fetchFile(videoFile));
    const duration = endTime - startTime;
    const command = [
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', 'input.mp4',
      '-vf', `fps=${fps},scale=${targetWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      'output.gif'
    ];
    FFmpeg.on('progress', ({ progress }: { progress: number }) => {
      setEncodingProgress({ current: Math.round(progress * 100), total: 100, message: "Transcoding Neural Stream..." });
    });
    await FFmpeg.exec(command);
    const data = await FFmpeg.readFile('output.gif');
    return new Blob([data], { type: 'image/gif' });
  };

  const generateAnimatedGif = async (sliceId: string, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const framesToEncode: string[] = [];
      const canvas = (window as any).document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = width;
      canvas.height = height;
      let startX = 0;
      if (sliceId === 'side') startX = 511; 
      else if (sliceId.startsWith('workshop')) {
        const idx = parseInt(sliceId.split('-')[1]);
        startX = idx * ((sourceImage as any).width / 5);
      }
      let framesToUse = extractedFrames;
      if (optDropFrames && currentTool === 'optimizer') {
        framesToUse = extractedFrames.filter((_, i) => i % 2 === 0);
      }
      framesToUse.forEach((_, idx) => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(sourceImage!, startX, 0, width, (sourceImage as any).height, 0, 0, width, height);
        framesToEncode.push(canvas.toDataURL('image/png'));
      });
      gifshot.createGIF({
        images: framesToEncode,
        gifWidth: width,
        gifHeight: height,
        interval: optDropFrames && currentTool === 'optimizer' ? 0.2 : 0.1,
        numFrames: framesToUse.length,
        sampleInterval: optCompression,
        numWorkers: 2,
        loop: 0,
      }, (obj: any) => {
        if (!obj.error) {
          const binaryStr = atob(obj.image.split(',')[1]);
          const arr = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) arr[i] = binaryStr.charCodeAt(i);
          resolve(new Blob([arr], { type: 'image/gif' }));
        } else {
          reject(new Error(obj.error));
        }
      });
    });
  };

  const handleExport = async () => {
    if (currentTool === 'converter' && !videoFile) return;
    if (currentTool !== 'converter' && !sourceUrl) return;
    if (currentTool === 'splitter' && slices.length === 0) return;
    if (hasUsedFreeToday) {
      setShowLimitModal(true);
      return;
    }
    await performExport(true);
  };

  const performExport = async (isFree: boolean) => {
    setIsEncoding(true);
    const zip = new JSZip();
    try {
      if (currentTool === 'splitter') {
        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i];
          setEncodingProgress({ current: i + 1, total: slices.length, message: `Re-encoding Component: ${slice.name}` });
          if (fileType === 'image/gif') {
            const blob = await generateAnimatedGif(slice.id, slice.width, slice.height);
            zip.file(slice.name, blob);
          } else {
            const base64 = slice.dataUrl.split(',')[1];
            zip.file(slice.name, base64, { base64: true });
          }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = (window as any).document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `SteamCanvas_${splitterMode}_bundle.zip`;
        link.click();
      } else if (currentTool === 'optimizer') {
        setEncodingProgress({ current: 1, total: 1, message: `Optimizing Atlas...` });
        const blob = await generateAnimatedGif('full', (sourceImage as any).width, (sourceImage as any).height);
        const link = (window as any).document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Optimized_Asset.gif`;
        link.click();
      } else {
        const gifBlob = await convertVideoToGif();
        const url = URL.createObjectURL(gifBlob);
        const link = (window as any).document.createElement('a');
        link.href = url;
        link.download = `Converted_${videoFile!.name.split('.')[0]}.gif`;
        link.click();
      }
      if (isFree) {
        setHasUsedFreeToday(true);
        (window as any).localStorage.setItem('last_tool_use', new Date().toDateString());
      }
      // @ts-ignore
      (window as any).confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#FFD700'] });
    } catch (err) {
      console.error(err);
      (window as any).alert("Failed.");
    } finally {
      setIsEncoding(false);
      setShowLimitModal(false);
    }
  };

  const handlePayAndExport = async () => {
    setIsPaying(true);
    const success = deductCredits(TOOL_CREDIT_COST, `${currentTool.toUpperCase()} Export Credit`);
    if (success) {
      setTimeout(async () => {
        await performExport(false);
        setIsPaying(false);
      }, 1000);
    } else {
      setIsPaying(false);
      (window as any).alert("Insufficient balance!");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCanvas = () => {
    setSourceImage(null);
    setSourceUrl(null);
    setSourceFileSize(0);
    setSlices([]);
    setExtractedFrames([]);
    setFileType('');
    setVideoFile(null);
    setVideoUrl(null);
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-[1600px]">
      <header className="mb-12 flex flex-col xl:flex-row justify-between items-end gap-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-[#00f2ff] animate-pulse" />
            <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.5em]">CREATOR ENGINE V4.2</span>
          </div>
          <h1 className="text-6xl font-display font-black tracking-tight mb-2 uppercase">
            Work<span className="text-[#7000ff]">station</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl font-medium">
            Professional suite for <span className="text-white">atomic-precision</span> Steam profile optimization.
          </p>
        </motion.div>

        <div className="flex flex-col items-end gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-6 glass p-2 rounded-3xl border border-white/5 w-full xl:w-auto">
            {[
              { id: 'splitter', label: 'Splitter', icon: Scissors, color: '#00f2ff' },
              { id: 'optimizer', label: 'Optimizer', icon: Gauge, color: '#7000ff' },
              { id: 'converter', label: 'Transcoder', icon: Video, color: '#FFD700' }
            ].map((tool) => (
              <button 
                key={tool.id}
                onClick={() => setCurrentTool(tool.id as ToolType)}
                className={`flex-grow xl:flex-none px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
                  currentTool === tool.id 
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                <tool.icon className="w-4 h-4" style={{ color: currentTool === tool.id ? '#000' : tool.color }} /> 
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start h-full">
        {/* Left Column: Rack-Mount Controls */}
        <div className="lg:col-span-4 space-y-8 h-full sticky top-32">
          <AnimatePresence mode="wait">
            {!sourceUrl && !videoUrl ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if ((e as any).dataTransfer.files[0]) handleFile((e as any).dataTransfer.files[0]); }}
                onClick={() => (fileInputRef.current as any)?.click()}
                className={`relative h-[700px] rounded-[4rem] glass border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden ${
                  isDragging ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/10 hover:border-[#00f2ff]/30'
                }`}
              >
                {/* Decorative rotating scan grid */}
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => (e.target as any).files?.[0] && handleFile((e.target as any).files[0])} />
                <div className="relative z-10 text-center space-y-10 px-12">
                  <div className="relative">
                    <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#00f2ff]/10 transition-all border border-white/5 group-hover:border-[#00f2ff]/20">
                      <Upload className="w-16 h-16 text-white/20 group-hover:text-[#00f2ff] group-hover:scale-110 transition-transform" />
                    </div>
                    {/* Pulsing ring */}
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-[#00f2ff] pointer-events-none" 
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Neural Ingestion</h3>
                    <p className="text-[10px] text-white/20 leading-relaxed uppercase tracking-[0.4em] font-black">DROP GIF / IMAGE / MP4 TO BEGIN</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="active-panel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Active Asset Info Module */}
                <div className="glass rounded-[3rem] p-8 border border-white/5 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/5 blur-[60px] rounded-full" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                      {videoUrl ? <video src={videoUrl} className="w-full h-full object-cover" muted /> : <img src={sourceUrl!} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-[#00f2ff]" />
                        <span className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest">Active Buffer</span>
                      </div>
                      <h3 className="font-bold truncate text-xl uppercase tracking-tighter text-white">
                        {videoUrl ? 'STREAM_SOURCE' : 'ATOMIC_MAP'}.{fileType.split('/')[1]}
                      </h3>
                      <p className="text-xs text-white/40 font-bold mt-1 uppercase tracking-widest">{formatSize(sourceFileSize)}</p>
                    </div>
                    <button onClick={clearCanvas} className="p-3 bg-red-500/10 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tool Parameter Module */}
                <div className="glass rounded-[3rem] p-10 border border-white/5 space-y-10">
                  {currentTool === 'splitter' && (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                          <Split className="w-4 h-4 text-[#00f2ff]" />
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Geometry Calibration</label>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                          {['artwork', 'workshop', 'background'].map((item) => (
                            <button
                              key={item}
                              onClick={() => setSplitterMode(item as SplitMode)}
                              className={`py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                                splitterMode === item ? 'bg-[#00f2ff] text-black shadow-lg' : 'text-white/30 hover:text-white'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center ml-2">
                           <div className="flex items-center gap-3">
                              <Settings className="w-4 h-4 text-[#00f2ff]" />
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Bitrate Convolute</label>
                           </div>
                           <span className="text-[10px] font-black text-[#00f2ff]">{optCompression === 1 ? 'LOSSLESS' : `${100 - optCompression * 5}%`}</span>
                        </div>
                        <input type="range" min="1" max="20" step="1" value={optCompression} onChange={(e) => setOptCompression(parseInt((e.target as any).value))} className="w-full accent-[#00f2ff] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
                      </div>
                    </div>
                  )}

                  {currentTool === 'optimizer' && (
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center ml-2">
                           <div className="flex items-center gap-3">
                              <Gauge className="w-4 h-4 text-[#7000ff]" />
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Temporal Pressure</label>
                           </div>
                           <span className="text-[10px] font-black text-[#7000ff]">{optCompression * 5}%</span>
                        </div>
                        <input type="range" min="1" max="20" step="1" value={optCompression} onChange={(e) => setOptCompression(parseInt((e.target as any).value))} className="w-full accent-[#7000ff] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                           <Palette className="w-4 h-4 text-[#7000ff]" />
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Color Resolution</label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[256, 128, 64].map(c => (
                            <button key={c} onClick={() => setOptColors(c)} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${optColors === c ? 'bg-[#7000ff] text-white border-[#7000ff]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}>{c}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTool === 'converter' && (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                           <Monitor className="w-4 h-4 text-[#FFD700]" />
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Target Resolution</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <button onClick={() => setTargetWidth(506)} className={`py-4 rounded-2xl text-[10px] font-black border transition-all ${targetWidth === 506 ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}>Main (506px)</button>
                           <button onClick={() => setTargetWidth(100)} className={`py-4 rounded-2xl text-[10px] font-black border transition-all ${targetWidth === 100 ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}>Side (100px)</button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center ml-2">
                           <div className="flex items-center gap-3">
                              <Activity className="w-4 h-4 text-[#FFD700]" />
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Neural FPS</label>
                           </div>
                           <span className="text-[10px] font-black text-[#FFD700]">{fps} FPS</span>
                        </div>
                        <input type="range" min="10" max="30" step="1" value={fps} onChange={(e) => setFps(parseInt((e.target as any).value))} className="w-full accent-[#FFD700] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
                      </div>
                    </div>
                  )}

                  {/* Export Trigger Module */}
                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Est. Output Weight</span>
                        <span className={`text-sm font-black ${isSteamReady ? 'text-green-500' : 'text-red-500'}`}>{formatSize(estimatedSize)}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isSteamReady ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {isSteamReady ? 'STEAM READY' : 'OVER LIMIT'}
                      </div>
                    </div>

                    <button 
                      onClick={handleExport} 
                      disabled={isEncoding || (currentTool === 'converter' && !isFFmpegLoaded)} 
                      className="w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all disabled:opacity-50 bg-[#00f2ff] text-black shadow-[0_0_40px_rgba(0,242,255,0.3)] hover:shadow-[0_0_60px_rgba(0,242,255,0.5)] active:scale-[0.98]"
                    >
                      {isEncoding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Archive className="w-6 h-6" />}
                      {isEncoding ? "CONSTRUCTING..." : (hasUsedFreeToday ? `EXPORT (${TOOL_CREDIT_COST} 🪙)` : "FREE EXPORT")}
                    </button>
                  </div>
                </div>

                <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <History className="w-5 h-5 text-white/30" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Processing Speed</h4>
                    <p className="text-xs font-bold text-white uppercase tracking-tighter">Fast (Browser-Side GPU)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Workstation Viewport */}
        <div className="lg:col-span-8 h-full flex flex-col gap-8">
           <header className="flex items-center justify-between px-6">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
                   <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">Simulation Matrix</h2>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Viewport 01_PRIMARY</span>
             </div>
             <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                   <Activity className="w-3.5 h-3.5" /> Bitrate Stream: {isEncoding ? 'ENCODING' : 'IDLE'}
                </div>
                <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                   <Maximize2 className="w-4 h-4 text-white/40" />
                </button>
             </div>
           </header>

           {/* Central Stage */}
           <div className="flex-grow glass rounded-[4rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center min-h-[750px]">
              {/* Calibration Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
              
              <AnimatePresence mode="wait">
                {sourceUrl || videoUrl ? (
                  currentTool === 'converter' ? (
                    <motion.div key="vid-matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center p-12">
                       <div className="relative w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,215,0,0.1)] border border-white/10 bg-black group">
                          <video ref={videoRef} src={videoUrl!} className="w-full h-full object-contain" onLoadedMetadata={(e) => { setVideoDuration((e.currentTarget as any).duration); setEndTime(Math.min((e.currentTarget as any).duration, 5)); }} onTimeUpdate={(e) => { if ((e.currentTarget as any).currentTime >= endTime) (e.currentTarget as any).currentTime = startTime; }} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                             <button onClick={() => { if (videoRef.current) { isPlaying ? (videoRef.current as any).pause() : (videoRef.current as any).play(); setIsPlaying(!isPlaying); } }} className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                {isPlaying ? <Pause className="w-10 h-10 fill-black" /> : <Play className="w-10 h-10 fill-black ml-1" />}
                             </button>
                          </div>
                          {/* Video HUD readouts */}
                          <div className="absolute top-8 left-8 text-[9px] font-black text-white/40 flex flex-col gap-2">
                             <span className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">TRIM_WINDOW: {startTime.toFixed(1)}s - {endTime.toFixed(1)}s</span>
                             <span className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">SOURCE_FPS: {fps} (VFR)</span>
                          </div>
                       </div>
                       {/* Timeline Scrub */}
                       <div className="w-full max-w-4xl mt-12 space-y-4">
                          <div className="h-1 bg-white/5 rounded-full relative">
                             <div className="absolute h-full bg-[#FFD700] shadow-[0_0_15px_#FFD700]" style={{ left: `${(startTime / videoDuration) * 100}%`, width: `${((endTime - startTime) / videoDuration) * 100}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                             <span>00:00:00</span>
                             <span>{(videoDuration || 0).toFixed(1)}s Total Runtime</span>
                          </div>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div key="sim-matrix" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full h-full flex items-center justify-center p-12">
                       <div className="w-full max-w-3xl bg-[#1b2838] rounded-xl shadow-2xl relative overflow-hidden border border-white/5">
                          {/* Steam Mockup Header */}
                          <div className="bg-[#171a21] p-3 border-b border-black flex items-center gap-6 text-[11px] text-[#8f98a0]">
                             <span className="hover:text-white cursor-pointer uppercase font-bold">Store</span>
                             <span className="text-white border-b-2 border-[#1a9fff] pb-1 uppercase font-bold">Community</span>
                             <span className="hover:text-white cursor-pointer uppercase font-bold">User</span>
                          </div>

                          <div className="p-10 relative">
                             {/* Background blur of source */}
                             <div className="absolute inset-0 opacity-[0.05] blur-[120px] scale-150 pointer-events-none">
                                <img src={sourceUrl!} className="w-full h-full object-cover" />
                             </div>

                             <div className="relative z-10 flex gap-10 mb-10 items-start">
                                <div className="w-40 h-40 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] p-0.5 rounded-sm shadow-2xl">
                                   <div className="w-full h-full bg-[#1b2838] p-1.5"><img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover" /></div>
                                </div>
                                <div className="pt-6">
                                   <h1 className="text-4xl font-display font-black text-white mb-2 uppercase tracking-tighter">CyberExplorer</h1>
                                   <div className="flex items-center gap-4 text-[#8f98a0] text-sm"><span className="text-white font-bold bg-white/5 border border-white/10 px-3 py-0.5 rounded uppercase text-[10px] tracking-widest">Level 88</span><ShieldCheck className="w-6 h-6 text-[#00f2ff]" /></div>
                                </div>
                             </div>

                             <div className="relative z-10 bg-[#161a20]/90 p-5 border-l-4 border-[#1a9fff] mb-10">
                                <span className="text-[#ebebeb] font-black uppercase tracking-[0.4em] text-[10px]">Showcase Pipeline: {splitterMode}</span>
                             </div>

                             <div className="relative z-10 min-h-[500px]">
                                {splitterMode === 'artwork' ? (
                                  <div className="flex gap-2.5 h-[600px] relative group/sim">
                                     {/* Neon Guide Lines */}
                                     <div className="absolute left-[506px] top-0 bottom-0 w-[1px] bg-cyan-400 shadow-[0_0_15px_cyan] z-20 pointer-events-none opacity-30" />
                                     <div className="flex-grow bg-black rounded-sm overflow-hidden border border-white/10 relative">
                                        <div className="absolute inset-0" style={{ backgroundImage: `url(${sourceUrl})`, backgroundSize: '611px auto', backgroundPosition: 'left top', backgroundRepeat: 'no-repeat', filter: currentTool === 'optimizer' ? `contrast(${100 + optCompression * 2}%) saturate(${100 - (256 - optColors) / 3}%)` : 'none' }} />
                                     </div>
                                     <div className="w-24 flex flex-col gap-2.5">
                                        <div className="flex-grow bg-black rounded-sm overflow-hidden border border-white/10 relative">
                                           <div className="absolute inset-0" style={{ backgroundImage: `url(${sourceUrl})`, backgroundSize: '611px auto', backgroundPosition: '-511px top', backgroundRepeat: 'no-repeat', filter: currentTool === 'optimizer' ? `contrast(${100 + optCompression * 2}%) saturate(${100 - (256 - optColors) / 3}%)` : 'none' }} />
                                        </div>
                                        <div className="h-24 bg-black/50 border border-white/5 flex items-center justify-center text-[#8f98a0]"><span className="text-xs font-black">+ 12</span></div>
                                     </div>
                                  </div>
                                ) : splitterMode === 'workshop' ? (
                                  <div className="max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                                     <div 
                                      className="grid grid-cols-5 gap-2" 
                                      style={{ height: sourceImage ? `${((sourceImage as any).height / (sourceImage as any).width) * 611}px` : '600px', minHeight: '400px' }}
                                     >
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <div key={i} className="bg-black rounded-sm overflow-hidden border border-white/10 relative">
                                              <div className="absolute inset-0" style={{ backgroundImage: `url(${sourceUrl})`, backgroundSize: `500% 100%`, backgroundPosition: `${(i / 4) * 100}% top`, backgroundRepeat: 'no-repeat' }} />
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-[600px] bg-black rounded-sm overflow-hidden border border-white/5 relative">
                                     <div className="absolute inset-0" style={{ backgroundImage: `url(${sourceUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )
                ) : (
                  <motion.div key="empty-matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-12">
                     <div className="relative">
                        <Waves className="w-32 h-32 text-white/5 animate-pulse" />
                        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center">
                           <Monitor className="w-16 h-16 text-white/5" />
                        </motion.div>
                     </div>
                     <div className="text-center">
                        <h3 className="text-white/20 font-black uppercase tracking-[0.5em] text-sm">Calibration Required</h3>
                        <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] mt-3 font-bold">Waiting for atomic asset ingestion in Column_01</p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Viewport Tech HUD Readouts */}
              <div className="absolute bottom-10 left-10 flex gap-12 z-20 pointer-events-none">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Temporal Clock</p>
                    <p className="text-xs font-bold text-white uppercase tabular-nums">{new Date().toLocaleTimeString()}</p>
                 </div>
                 {sourceImage && splitterMode === 'workshop' && (
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest">Verticality Index</p>
                      <p className="text-xs font-bold text-white uppercase tabular-nums">{(sourceImage as any).height}px Tall</p>
                   </div>
                 )}
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Encryption</p>
                    <p className="text-xs font-bold text-[#00f2ff] uppercase tabular-nums">AES-256_ACTIVE</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Daily Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass max-w-md w-full rounded-[4rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] to-yellow-600" />
              <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-orange-500/20">
                <AlertTriangle className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-4xl font-display font-black text-[#FFD700] mb-4 uppercase tracking-tighter leading-none">Limit<br/>Reached</h2>
              <p className="text-white/50 mb-10 leading-relaxed font-medium">
                Free daily tool use exceeded. Additional transcode tasks cost <span className="text-[#FFD700] font-bold">{TOOL_CREDIT_COST} Credits</span>.
              </p>
              <div className="space-y-4">
                <button
                  disabled={balance < TOOL_CREDIT_COST || isPaying}
                  onClick={handlePayAndExport}
                  className={`w-full py-6 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-4 ${balance >= TOOL_CREDIT_COST ? 'bg-[#FFD700] text-black shadow-2xl' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}
                >
                  {isPaying ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                  {isPaying ? "PROCESSING..." : `PAY ${TOOL_CREDIT_COST} 🪙`}
                </button>
                <button onClick={() => setShowLimitModal(false)} className="w-full py-4 text-white/30 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">ABORT_TASK</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Encoding Loader */}
      <AnimatePresence>
        {isEncoding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-2xl bg-black/40"
          >
            <div className="max-w-md w-full space-y-8 p-12 glass rounded-[3rem] border border-[#00f2ff]/30 text-center relative overflow-hidden">
               {/* Progress Scanline */}
               <motion.div 
                 animate={{ top: ['0%', '100%', '0%'] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-px bg-[#00f2ff] shadow-[0_0_20px_#00f2ff] opacity-40 z-20 pointer-events-none" 
               />
               
               <div className="relative">
                 <div className="w-24 h-24 bg-[#00f2ff]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00f2ff]/20">
                    <Loader2 className="w-12 h-12 text-[#00f2ff] animate-spin" />
                 </div>
               </div>
               
               <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black text-[#00f2ff] uppercase tracking-tighter">{encodingProgress.message}</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">STAY CONNECTED: DO NOT CLOSE TAB</p>
               </div>

               <div className="space-y-4 pt-4">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(encodingProgress.current / encodingProgress.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                    <span>Task Protocol: {encodingProgress.current}/{encodingProgress.total}</span>
                    <span>{Math.round((encodingProgress.current / encodingProgress.total) * 100)}%</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tools;