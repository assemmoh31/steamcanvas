
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Share2, 
  MessageCircle, 
  Layout, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Collection } from '../types';
import ArtworkCard from '../components/Marketplace/ArtworkCard';
import SteamSimulator from '../components/ItemDetail/SteamSimulator';

interface CollectionDetailProps {
  collection: Collection;
  onBack: () => void;
  onSelectArtwork: (artwork: any) => void;
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({ collection, onBack, onSelectArtwork }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, originY: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pt-28 pb-20 container mx-auto px-6 max-w-7xl"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Community Collections
      </button>

      {/* Hero Header */}
      <header className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-full text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.3em]">Community Showcase</div>
             <div className="flex items-center gap-1.5 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                <Layout size={12} /> {collection.artworks.length} Elements
             </div>
          </div>
          <h1 className="text-6xl lg:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none">
            {collection.title}
          </h1>
          <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed">
            {collection.description}
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
           <button className="w-full py-5 bg-[#00f2ff] text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(0,242,255,0.3)] hover:shadow-[0_0_70px_rgba(0,242,255,0.5)] transition-all">
              <Play className="w-6 h-6 fill-black" /> SIMULATE ALL
           </button>
           <div className="grid grid-cols-2 gap-4">
              <button className="py-4 glass border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[#5865F2] font-black text-xs uppercase tracking-widest hover:bg-[#5865F2]/10 transition-all">
                 <MessageCircle className="w-4 h-4" /> Discord
              </button>
              <button className="py-4 glass border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[#171a21] font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                 <Share2 className="w-4 h-4 text-[#66c0f4]" /> Steam
              </button>
           </div>
        </div>
      </header>

      {/* Simulator Section */}
      <section className="mb-24">
         <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Vibe Simulation</h2>
            <div className="flex-grow h-px bg-white/5" />
         </div>
         <SteamSimulator artwork={collection.artworks[0]} previewImageUrl={collection.backgroundUrl} />
      </section>

      {/* Collection Grid */}
      <section className="space-y-12">
        <div className="flex justify-between items-center">
           <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Collection Contents</h2>
           <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <Zap size={12} className="text-[#FFD700]" /> Curator-Approved Kit
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collection.artworks.map((art, idx) => (
            <ArtworkCard 
              key={art.id} 
              artwork={art} 
              index={idx} 
              onClick={() => onSelectArtwork(art)} 
            />
          ))}
          
          {/* Background Link Card */}
          <div className="glass rounded-2xl border-white/10 p-6 flex flex-col justify-between group hover:border-[#00f2ff]/30 transition-all">
             <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <ExternalLink className="text-white/20 group-hover:text-[#00f2ff] transition-colors" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white uppercase">Profile Backdrop</h3>
                   <p className="text-xs text-white/40">Official Steam Market Item used in this curation.</p>
                </div>
             </div>
             <button className="w-full py-3 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#00f2ff] group-hover:text-black transition-all mt-8">
                View on Steam
             </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="mt-32 p-12 glass rounded-[3rem] border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#00f2ff] p-1 bg-white/5">
               <img src="https://picsum.photos/seed/sage/100/100" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Curated By</p>
               <h4 className="text-2xl font-display font-black text-white uppercase">@{collection.curator}</h4>
            </div>
         </div>
         <div className="space-y-2">
            <h4 className="font-bold flex items-center gap-2">
               <ShieldCheck size={18} className="text-[#00f2ff]" /> Quality Assured
            </h4>
            <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest font-medium">This collection has been verified for client-side performance and layout compatibility.</p>
         </div>
         <div className="flex justify-end">
            <button className="px-8 py-4 glass border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
               Clone Collection
            </button>
         </div>
      </footer>
    </motion.div>
  );
};

export default CollectionDetail;
