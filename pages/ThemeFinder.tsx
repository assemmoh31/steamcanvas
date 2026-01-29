
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Monitor, 
  Sparkles, 
  ChevronRight, 
  X, 
  ShoppingCart,
  Layout,
  Palette,
  Eye,
  ArrowRight,
  Info,
  RefreshCcw,
  Zap,
  Activity
} from 'lucide-react';
import { STEAM_BACKGROUNDS, ARTWORKS } from '../constants';
import { SteamBackground, Artwork } from '../types';
import SteamSimulator from '../components/ItemDetail/SteamSimulator';

const ThemeFinder: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState<SteamBackground['color'] | 'all'>('all');
  const [selectedMood, setSelectedMood] = useState<string | 'all'>('all');
  const [simulatedBg, setSimulatedBg] = useState<SteamBackground | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const moods = ['Cyberpunk', 'Anime', 'Nature', 'Minimalist', 'Space'];
  const colors = [
    { id: 'cyan', hex: '#00f2ff' },
    { id: 'purple', hex: '#7000ff' },
    { id: 'crimson', hex: '#ff0055' },
    { id: 'gold', hex: '#FFD700' },
    { id: 'emerald', hex: '#10b981' },
    { id: 'sunset', hex: '#f59e0b' },
    { id: 'rose', hex: '#f472b6' },
    { id: 'cobalt', hex: '#2563eb' }
  ];

  const filteredBackgrounds = useMemo(() => {
    return STEAM_BACKGROUNDS.filter(bg => {
      const matchesSearch = bg.name.toLowerCase().includes(search.toLowerCase()) || 
                            bg.game.toLowerCase().includes(search.toLowerCase());
      const matchesColor = selectedColor === 'all' || bg.color === selectedColor;
      const matchesMood = selectedMood === 'all' || bg.tags.includes(selectedMood);
      return matchesSearch && matchesColor && matchesMood;
    });
  }, [search, selectedColor, selectedMood]);

  // Infinite Scroll logic using (window as any)
  useEffect(() => {
    const handleScroll = () => {
      const win = window as any;
      if (win.innerHeight + win.scrollY >= (win.document.body.offsetHeight - 500)) {
        setVisibleCount(prev => Math.min(prev + 3, filteredBackgrounds.length));
      }
    };
    (window as any).addEventListener('scroll', handleScroll);
    return () => (window as any).removeEventListener('scroll', handleScroll);
  }, [filteredBackgrounds.length]);

  const matchingArtworks = useMemo(() => {
    if (!simulatedBg) return [];
    return ARTWORKS.filter(art => 
      art.tags?.some(tag => simulatedBg.tags.includes(tag))
    ).slice(0, 3);
  }, [simulatedBg]);

  const handleReset = () => {
    setSearch('');
    setSelectedColor('all');
    setSelectedMood('all');
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
      {/* Search Header */}
      <section className="text-center mb-16 space-y-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00f2ff]/5 blur-[120px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00f2ff] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Monitor className="w-3.5 h-3.5" /> Background Search Terminal
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 uppercase">
            Theme <span className="text-white/40">Finder</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold text-[10px]">
            Quantum search 10,000+ official Steam backdrops
          </p>
        </motion.div>

        {/* New Consolidated Filter Terminal */}
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-white/20 group-focus-within:text-[#00f2ff] transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Broadcast query to the network (e.g. Neon, Forest, Minimalism)..."
              value={search}
              // Cast to any to access value property
              onChange={(e) => setSearch((e.target as any).value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-7 pl-16 pr-8 outline-none transition-all neon-border-cyan font-bold text-white shadow-2xl text-xl"
            />
          </div>

          <div className="glass rounded-[3.5rem] p-10 lg:p-12 border border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12 relative overflow-hidden text-left">
            {/* Background Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/5 via-transparent to-[#7000ff]/5 pointer-events-none" />
            
            {/* Left Section: Spectrum Analysis */}
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-[#00f2ff]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Spectrum Analysis</h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-[#00f2ff]/30 to-transparent" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setSelectedColor('all')}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${selectedColor === 'all' ? 'border-[#00f2ff] bg-[#00f2ff]/20 text-white shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'border-white/10 bg-white/5 text-white/20 hover:border-white/40'}`}
                  title="All Colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <div className="w-px h-10 bg-white/5 mx-1" />
                <div className="flex flex-wrap gap-2.5">
                  {colors.map(color => (
                    <button 
                      key={color.id}
                      onClick={() => setSelectedColor(color.id as any)}
                      className={`w-10 h-10 rounded-xl transition-all border-2 relative group/color ${selectedColor === color.id ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.id && (
                        <div className="absolute inset-0 rounded-xl blur-lg opacity-60" style={{ backgroundColor: color.hex }} />
                      )}
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-[8px] px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/10 pointer-events-none uppercase font-black">
                        {color.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section: Mood Calibration */}
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#7000ff]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Mood Calibration</h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-[#7000ff]/30 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  onClick={() => setSelectedMood('all')}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${selectedMood === 'all' ? 'bg-[#7000ff] text-white border-[#7000ff] shadow-[0_0_20px_rgba(112,0,255,0.3)]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}
                >
                  <Activity className="w-3 h-3" /> All Moods
                </button>
                {moods.map(mood => (
                  <button 
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedMood === mood ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20 hover:text-white'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="lg:col-span-2 pt-10 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4 text-white/20 text-[9px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Neural Link Active
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span>Found: {filteredBackgrounds.length} Units</span>
               </div>
               <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-[#00f2ff] transition-colors uppercase tracking-[0.2em]"
               >
                 <RefreshCcw className="w-3.5 h-3.5" /> Reset Neural Link
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredBackgrounds.slice(0, visibleCount).map((bg, idx) => (
            <motion.div
              key={bg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#00f2ff]/30 transition-all shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  <button 
                    onClick={() => setSimulatedBg(bg)}
                    className="px-6 py-2.5 bg-[#00f2ff] text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-2xl flex items-center gap-2 hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Try Simulator
                  </button>
                </div>
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-[#00f2ff] transition-colors">{bg.name}</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{bg.game}</p>
                </div>
                <a 
                  href={bg.marketUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredBackgrounds.length === 0 && (
        <div className="text-center py-40 glass rounded-[3rem] border border-dashed border-white/10">
          <Info className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">No backgrounds found in the current temporal stream.</p>
          <button onClick={handleReset} className="text-[#00f2ff] text-xs font-black uppercase mt-4 underline underline-offset-8">Reset Matrix</button>
        </div>
      )}

      {/* Simulator Modal */}
      <AnimatePresence>
        {simulatedBg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 lg:p-12 overflow-y-auto"
          >
            <div className="container mx-auto max-w-7xl min-h-screen py-12">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-2xl flex items-center justify-center border border-[#00f2ff]/30">
                    <Layout className="w-6 h-6 text-[#00f2ff]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-white">Theme Simulation</h2>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Viewing: {simulatedBg.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSimulatedBg(null)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 text-white/40 hover:text-red-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-8">
                  <div className="sticky top-12">
                     <SteamSimulator artwork={{ title: "Simulated Content" }} previewImageUrl={simulatedBg.imageUrl} />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8 text-left">
                  <div className="glass p-8 rounded-[3rem] border border-[#00f2ff]/20 bg-[#00f2ff]/5 space-y-6">
                    <h3 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#00f2ff]" /> Perfect Match
                    </h3>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                      Our algorithm suggests these marketplace artworks based on visual telemetry and tags.
                    </p>
                    
                    <div className="space-y-4">
                      {matchingArtworks.map(art => (
                        <div key={art.id} className="group relative glass p-4 rounded-2xl border border-white/5 hover:border-[#00f2ff]/30 transition-all flex items-center gap-4 cursor-pointer">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <img src={art.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-sm truncate">{art.title}</h4>
                            <p className="text-[10px] text-white/30">@{art.artist}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                               <span className="text-[9px] font-black text-white/40 uppercase">Aesthetic Synced</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#00f2ff] transition-colors" />
                        </div>
                      ))}
                      {matchingArtworks.length === 0 && (
                        <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No direct matches found</p>
                        </div>
                      )}
                    </div>

                    <button className="w-full py-4 bg-[#00f2ff] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all">
                      Browse Similar Artworks
                    </button>
                  </div>

                  <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-6">
                    <h3 className="text-xl font-display font-black uppercase tracking-tight">Technical Spec</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Source Resolution</p>
                          <p className="text-xs font-bold">1920 x 1080</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Asset Complexity</p>
                          <p className="text-xs font-bold text-green-500">OPTIMIZED</p>
                       </div>
                    </div>
                    <a 
                      href={simulatedBg.marketUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-5 glass border border-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                    >
                      Buy on Steam Community <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeFinder;