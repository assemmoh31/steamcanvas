
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Sparkles, TrendingUp, Search } from 'lucide-react';
import { MOCK_COLLECTIONS } from '../constants';
import { Collection } from '../types';
import CollectionCard from '../components/Collections/CollectionCard';

interface CollectionsProps {
  onSelectCollection: (collection: Collection) => void;
}

const Collections: React.FC<CollectionsProps> = ({ onSelectCollection }) => {
  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
      <header className="mb-16 space-y-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <Layers className="w-8 h-8 text-[#00f2ff]" />
          <h1 className="text-5xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter">
            Community <span className="text-white/40">Collections</span>
          </h1>
        </div>
        <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
          Discover complete profile aesthetics curated by top artists and the community's most creative designers.
        </p>
        
        <div className="flex justify-center pt-8">
           <div className="relative w-full max-w-xl group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-[#00f2ff] transition-colors">
                 <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search thematic kits (e.g. Neon, Dark, Anime)..." 
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 outline-none focus:border-[#00f2ff] transition-all font-bold text-white shadow-2xl"
              />
           </div>
        </div>
      </header>

      {/* Featured Collections Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-[#7000ff]/10 border border-[#7000ff]/30 rounded-full">
              <TrendingUp size={14} className="text-[#7000ff]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Trending Kits</span>
           </div>
           <div className="flex-grow h-px bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_COLLECTIONS.map((col) => (
            <CollectionCard 
              key={col.id} 
              collection={col} 
              onClick={() => onSelectCollection(col)} 
            />
          ))}
          
          {/* Create New Prompt Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-[#00f2ff]/30 transition-all"
          >
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#00f2ff]/10 transition-colors mb-6">
                <Sparkles className="w-8 h-8 text-white/20 group-hover:text-[#00f2ff]" />
             </div>
             <h3 className="text-xl font-bold text-white/40 group-hover:text-white uppercase tracking-tight">Curate a Look</h3>
             <p className="text-xs text-white/20 mt-2 uppercase tracking-widest font-black group-hover:text-white/40">Build your own neural kit</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Collections;
