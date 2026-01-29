
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Coins,
  ShieldCheck,
  X,
  AlertCircle,
  Tag,
  Gift,
  Check,
  FolderArchive,
  Scale,
  Info,
  Clock,
  ExternalLink,
  MonitorPlay,
  Maximize2,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

const PLATFORM_FEE = 0.15;

const Studio: React.FC = () => {
  const [showAgreement, setShowAgreement] = useState(true);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Asset File (The technical file)
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Showcase File (The full profile look GIF/Video)
  const [showcaseFile, setShowcaseFile] = useState<File | null>(null);
  const [showcaseUrl, setShowcaseUrl] = useState<string | null>(null);

  // Source Archive
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState<'asset' | 'showcase' | 'source' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Artwork' as Category,
    price: 500,
    isFree: false,
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');
  const assetInputRef = useRef<HTMLInputElement>(null);
  const showcaseInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const artistEarnings = formData.isFree ? 0 : Math.floor(formData.price * (1 - PLATFORM_FEE));

  const handleAssetFile = useCallback((selectedFile: File) => {
    if (selectedFile.size > 15 * 1024 * 1024) {
      (window as any).alert("Asset size exceeds 15MB limit.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleShowcaseFile = useCallback((selectedFile: File) => {
    // 10MB Limit for GIF/MP4
    if (selectedFile.size > 10 * 1024 * 1024) {
      (window as any).alert("Showcase (GIF/Video/WebM) size exceeds 10MB limit.");
      return;
    }
    setShowcaseFile(selectedFile);
    setShowcaseUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleSourceFile = useCallback((selectedFile: File) => {
    // 25MB Limit for ZIP
    if (selectedFile.size > 25 * 1024 * 1024) {
      (window as any).alert("Source (ZIP) size exceeds 25MB limit.");
      return;
    }
    const isArchive = selectedFile.name.endsWith('.zip') || selectedFile.name.endsWith('.rar') || selectedFile.name.endsWith('.7z');
    if (!isArchive) {
      (window as any).alert("Please upload source files in .zip, .rar, or .7z format.");
      return;
    }
    setSourceFile(selectedFile);
  }, []);

  const uploadToR2 = async (file: File, isPrivate: boolean): Promise<{ key: string; url: string }> => {
    // 1. Get Presigned URL
    const res = await fetch(`/api/upload/url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&usePrivate=${isPrivate}`);
    if (!res.ok) throw new Error('Failed to get upload URL');
    const { url, key } = await res.json();

    // 2. Upload File (PUT) with XHR for Progress (Fetch doesn't support progress yet)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          // Simple local calculation: 
          // If Public (Showcase) -> 0-50%
          // If Private (Source) -> 50-100%
          // This is a rough estimation for the single progress bar
          if (!isPrivate) {
            setUploadProgress(Math.round(percentComplete / 2));
          } else {
            setUploadProgress(50 + Math.round(percentComplete / 2));
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({ key, url });
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseFile || !sourceFile) {
      (window as any).alert("Please ensure both Showcase (GIF) and Source (ZIP) files are uploaded.");
      return;
    }

    if (!showcaseFile.name.toLowerCase().endsWith('.gif') && !showcaseFile.name.toLowerCase().endsWith('.webp') && !showcaseFile.name.toLowerCase().endsWith('.webm')) {
      (window as any).alert("Showcase file must be a GIF, WEBP, or WEBM for the marketplace.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Upload Showcase (Public)
      const showcaseUpload = await uploadToR2(showcaseFile, false);
      setUploadProgress(50);

      // 2. Upload Source (Private)
      const sourceUpload = await uploadToR2(sourceFile, true);
      setUploadProgress(80);

      // 3. Create Record
      const res = await fetch('/api/artworks/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2Key: showcaseUpload.key,
          zipKey: sourceUpload.key,
          title: formData.title,
          description: formData.description,
          price: formData.isFree ? 0 : formData.price,
          fileSize: showcaseFile.size
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish');
      }

      setUploadProgress(100);
      setIsUploading(false);
      setShowSuccess(true);
      // @ts-ignore
      (window as any).confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2ff', '#7000ff', '#ffffff']
      });

      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      (window as any).alert("Upload Failed: " + (error as Error).message);
    }
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-screen-2xl">
      <AnimatePresence>
        {showAgreement && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass max-w-2xl w-full rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00f2ff] to-[#7000ff]" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#00f2ff]/10 rounded-2xl flex items-center justify-center border border-[#00f2ff]/30">
                  <Scale className="text-[#00f2ff] w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase tracking-tight">Listing Protocols</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Mandatory Agreement</p>
                </div>
              </div>
              <div className="space-y-6 mb-10 text-white/50 text-sm leading-relaxed max-h-80 overflow-y-auto pr-4 scrollbar-hide">
                <p><span className="text-white font-bold">1. Showcase Fidelity:</span> You must provide a "Full Profile Showcase" (GIF/WEBM). This is what buyers see as the primary preview. It must accurately represent how the artwork looks on a Steam profile.</p>
                <p><span className="text-white font-bold">2. Technical Delivery:</span> The "Marketplace Asset" you upload must be the exact file the customer receives. No watermarks allowed on final assets.</p>
                <p><span className="text-white font-bold">3. Review Window:</span> Our team manually verifies the "Source Archive" matches the output. This takes ~72 hours.</p>
              </div>
              <label className="flex items-center gap-4 cursor-pointer group mb-8">
                {/* Use any cast to access checked */}
                <input type="checkbox" className="peer hidden" checked={agreementAccepted} onChange={(e) => setAgreementAccepted((e.target as any).checked)} />
                <div className="w-6 h-6 border-2 border-white/10 rounded-lg transition-all peer-checked:bg-[#00f2ff] peer-checked:border-[#00f2ff] flex items-center justify-center">
                  <Check className={`w-4 h-4 text-black transition-opacity ${agreementAccepted ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">I acknowledge the listing terms.</span>
              </label>
              <button disabled={!agreementAccepted} onClick={() => setShowAgreement(false)} className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${agreementAccepted ? 'bg-[#00f2ff] text-black shadow-[0_0_40px_rgba(242,255,0.4)]' : 'bg-white/5 text-white/20 border border-white/10'}`}>INITIATE STUDIO</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Form and Uploads */}
        <div className="lg:col-span-5 space-y-10">
          <header>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-[#00f2ff]" />
              <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.4em]">Designer Terminal</span>
            </div>
            <h1 className="text-5xl font-display font-black uppercase tracking-tight leading-none mb-4">Forge <span className="text-white/40">Listing</span></h1>
            <p className="text-white/30 text-sm max-w-sm">Broadcast your digital alchemy to the SteamCanvas network.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Multi-File Upload Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Required Archives</h3>

              <div className="grid grid-cols-1 gap-4">
                {/* 1. Cinematic Showcase Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging('showcase'); }}
                  onDragLeave={() => setIsDragging(null)}
                  // Cast to any to access dataTransfer safely
                  onDrop={(e) => { e.preventDefault(); setIsDragging(null); const files = (e as any).dataTransfer.files; if (files && files[0]) handleShowcaseFile(files[0]); }}
                  // Cast ref to any to call click
                  onClick={() => !showcaseFile && (showcaseInputRef.current as any)?.click()}
                  className={`relative p-8 rounded-[2.5rem] glass border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group h-44 ${isDragging === 'showcase' ? 'border-[#00f2ff] bg-[#00f2ff]/5 scale-[0.98]' : showcaseFile ? 'border-green-500/30' : 'border-white/5 hover:border-white/20'
                    }`}
                >
                  {/* Cast to any to access files */}
                  <input type="file" className="hidden" ref={showcaseInputRef} onChange={(e) => { const files = (e.target as any).files; if (files && files[0]) handleShowcaseFile(files[0]); }} accept=".gif,.mp4,.webp,.webm" />
                  {!showcaseFile ? (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#00f2ff]/10">
                        <MonitorPlay className="w-6 h-6 text-white/20 group-hover:text-[#00f2ff]" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Full Profile Showcase</p>
                      <p className="text-[8px] text-white/20">GIF/MP4 showing whole profile look (Max 25MB)</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-24 h-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                        {(showcaseFile.type.includes('video') || showcaseFile.name.endsWith('.webm')) ? <video src={showcaseUrl!} className="w-full h-full object-cover" muted autoPlay loop playsInline /> : <img src={showcaseUrl!} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-black truncate">{showcaseFile.name}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5"><Check className="w-3 h-3" /> Showcase Ready</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setShowcaseFile(null); setShowcaseUrl(null); }} className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 2. Base Asset Upload */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging('asset'); }}
                    onDragLeave={() => setIsDragging(null)}
                    // Cast to any to access dataTransfer safely
                    onDrop={(e) => { e.preventDefault(); setIsDragging(null); const files = (e as any).dataTransfer.files; if (files && files[0]) handleAssetFile(files[0]); }}
                    // Cast ref to any to call click
                    onClick={() => !file && (assetInputRef.current as any)?.click()}
                    className={`relative p-6 rounded-[2.5rem] glass border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group h-44 ${isDragging === 'asset' ? 'border-[#7000ff] bg-[#7000ff]/5 scale-[0.98]' : file ? 'border-[#7000ff]/30' : 'border-white/5 hover:border-white/20'
                      }`}
                  >
                    {/* Cast to any to access files */}
                    <input type="file" className="hidden" ref={assetInputRef} onChange={(e) => { const files = (e.target as any).files; if (files && files[0]) handleAssetFile(files[0]); }} accept=".png,.gif,.mp4" />
                    {!file ? (
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-6 h-6 text-white/20 mx-auto group-hover:text-[#7000ff]" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Master Asset</p>
                        <p className="text-[8px] text-white/20">The actual file (15MB)</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 w-full px-2">
                        <div className="w-12 h-12 bg-[#7000ff]/10 rounded-xl flex items-center justify-center mx-auto"><Check className="text-[#7000ff] w-6 h-6" /></div>
                        <p className="text-[9px] font-black truncate max-w-full">{file.name}</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }} className="text-[8px] text-red-500 font-bold uppercase">Reset Asset</button>
                      </div>
                    )}
                  </div>

                  {/* 3. Source Archive Upload */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging('source'); }}
                    onDragLeave={() => setIsDragging(null)}
                    // Cast to any to access dataTransfer safely
                    onDrop={(e) => { e.preventDefault(); setIsDragging(null); const files = (e as any).dataTransfer.files; if (files && files[0]) handleSourceFile(files[0]); }}
                    // Cast ref to any to call click
                    onClick={() => !sourceFile && (sourceInputRef.current as any)?.click()}
                    className={`relative p-6 rounded-[2.5rem] glass border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group h-44 ${isDragging === 'source' ? 'border-orange-500 bg-orange-500/5 scale-[0.98]' : sourceFile ? 'border-orange-500/30' : 'border-white/5 hover:border-white/20'
                      }`}
                  >
                    {/* Cast to any to access files */}
                    <input type="file" className="hidden" ref={sourceInputRef} onChange={(e) => { const files = (e.target as any).files; if (files && files[0]) handleSourceFile(files[0]); }} accept=".zip,.rar,.7z" />
                    {!sourceFile ? (
                      <div className="text-center space-y-2">
                        <FolderArchive className="w-6 h-6 text-white/20 mx-auto group-hover:text-orange-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Source ZIP</p>
                        <p className="text-[8px] text-white/20">Project Verification</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 w-full px-2">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto"><Check className="text-orange-500 w-6 h-6" /></div>
                        <p className="text-[9px] font-black truncate max-w-full">{sourceFile.name}</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSourceFile(null); }} className="text-[8px] text-red-500 font-bold uppercase">Reset Source</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Marketplace Form Details */}
            <div className="glass rounded-[3.5rem] p-10 border border-white/5 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Broadcast Title</label>
                  {/* Use any cast to access value */}
                  <input type="text" placeholder="e.g. Protocol_Spiral" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00f2ff] transition-all font-bold text-white shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: (e.target as any).value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Market Classification</label>
                  <div className="relative">
                    {/* Use any cast to access value */}
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00f2ff] transition-all font-bold text-white appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: (e.target as any).value as Category })}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-[#121212] text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Atomic Description</label>
                {/* Use any cast to access value */}
                <textarea rows={3} placeholder="Describe the aesthetic vision..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00f2ff] transition-all font-medium text-white resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: (e.target as any).value })} required />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Canvas Credits Reward</label>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button type="button" onClick={() => setFormData({ ...formData, isFree: false })} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${!formData.isFree ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40'}`}>PAID</button>
                    <button type="button" onClick={() => setFormData({ ...formData, isFree: true, price: 0 })} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${formData.isFree ? 'bg-green-500 text-white shadow-lg' : 'text-white/40'}`}>GIFT</button>
                  </div>
                </div>
                {!formData.isFree ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><Coins className="w-4 h-4 text-[#FFD700]" /></div>
                    {/* Use any cast to access value */}
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-[#00f2ff] transition-all font-black text-xl text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt((e.target as any).value) || 0 })} required />
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl py-5 text-center">
                    <p className="text-green-500 font-black text-xs uppercase tracking-[0.4em]">Community Gift Mode Active</p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {isUploading ? (
                  <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#00f2ff]/5 animate-pulse" />
                    <div className="flex justify-between items-center mb-2 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff] animate-pulse">Transmitting Data...</span>
                      <span className="text-xs font-bold font-mono text-white">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden relative z-10">
                      <motion.div
                        className="h-full bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button type="submit" disabled={isUploading || !showcaseFile} className="w-full py-6 rounded-[2rem] font-black text-xl bg-[#00f2ff] text-black shadow-[0_0_50px_rgba(242,255,0.3)] hover:shadow-[0_0_70px_rgba(242,255,0.5)] transition-all disabled:opacity-30 flex items-center justify-center gap-3">
                    <ShieldCheck className="w-6 h-6" />
                    PUBLISH TO NETWORK
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Cinematic Showcase Preview */}
        <div className="lg:col-span-7 sticky top-32 space-y-8">
          <header className="flex justify-between items-end px-4">
            <div>
              <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
                <MonitorPlay className="w-6 h-6 text-[#00f2ff]" /> Cinematic Showcase
              </h2>
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">High-Fidelity Visual Impression</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">FPS: 60</div>
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">RES: 4K OPTIMIZED</div>
            </div>
          </header>

          {/* Immersive Showcase Container */}
          <div className="relative w-full aspect-[21/9] lg:aspect-video rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white/5 bg-[#050505]">
            <AnimatePresence mode="wait">
              {showcaseUrl ? (
                <motion.div
                  key="showcase-content"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative"
                >
                  {showcaseFile?.type.includes('video') ? (
                    <video src={showcaseUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  ) : (
                    <img src={showcaseUrl} className="w-full h-full object-cover" />
                  )}

                  {/* Visual Overlays for "Luxe" feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

                  {/* Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

                  {/* Interactive Mock UI Label */}
                  <div className="absolute bottom-10 left-10 flex items-center gap-4 z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-[#00f2ff] p-1 bg-black/40 backdrop-blur-md">
                      <img src="https://picsum.photos/seed/sage/100/100" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-black text-white shadow-lg uppercase tracking-tighter">@{formData.title || "CREATOR_UNNAMED"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black bg-[#00f2ff] text-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">Prototype View</span>
                        <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-widest backdrop-blur-md">LVL 42</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="showcase-empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6"
                >
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative">
                    <MonitorPlay className="w-12 h-12 text-white/5" />
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="absolute inset-0 border border-dashed border-white/10 rounded-[2.5rem]" />
                  </div>
                  <div>
                    <h3 className="text-white/20 font-black uppercase tracking-[0.4em] text-sm">Waiting for Visual Data</h3>
                    <p className="text-white/10 text-[10px] uppercase font-bold mt-2">Upload a showcase GIF or Video of the full profile look</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HUD Elements */}
            <div className="absolute top-8 left-8 z-20 pointer-events-none flex flex-col gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] rotate-90 origin-left translate-y-10">LIVE_SIGNAL</p>
            </div>
          </div>

          {/* Metadata HUD Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-xl flex items-center justify-center border border-[#00f2ff]/30">
                <Maximize2 className="w-6 h-6 text-[#00f2ff]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Aspect Ratio</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Cinematic Wide</p>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#7000ff]/10 rounded-xl flex items-center justify-center border border-[#7000ff]/30">
                <Layers className="w-6 h-6 text-[#7000ff]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Composite</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Multi-Layer Alpha</p>
              </div>
            </div>
          </div>

          <div className="p-8 glass rounded-[2.5rem] border border-[#00f2ff]/20 bg-[#00f2ff]/5 flex items-start gap-4">
            <Info className="w-5 h-5 text-[#00f2ff] shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-[#00f2ff] uppercase tracking-widest">Showcase Strategy</h4>
              <p className="text-[10px] text-white/40 leading-relaxed italic uppercase font-medium">The "Cinematic Showcase" is your primary sales tool. Use a screen recorder to capture your profile with the artwork active. This provides the ultimate "Hype" factor for potential buyers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;