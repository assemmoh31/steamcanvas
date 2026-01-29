
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Layers } from 'lucide-react';
import { Collection } from '../../types';
import ArtistRankBadge from '../Profile/ArtistRankBadge';

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="bg-[#0b0e11] rounded-3xl overflow-hidden border border-white/5 group-hover:border-[#00f2ff]/40 group-hover:shadow-[0_0_40px_rgba(0,242,255,0.1)] transition-all duration-500">
        {/* 2x2 Thumbnail Grid */}
        <div className="grid grid-cols-2 aspect-square gap-0.5 p-0.5 bg-white/5">
          {collection.artworks.slice(0, 4).map((art, i) => (
            <div key={art.id} className="relative overflow-hidden">
              <img 
                src={art.imageUrl} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ transitionDelay: `${i * 50}ms` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight group-hover:text-[#00f2ff] transition-colors truncate pr-4">
              {collection.title}
            </h3>
            <div className="flex items-center gap-1.5 text-white/40">
              <Heart size={14} className="group-hover:text-red-500 transition-colors" />
              <span className="text-xs font-bold">{collection.likes}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                <User size={14} className="text-white/40" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Curator</span>
                <span className="text-xs font-bold text-white/70">@{collection.curator}</span>
              </div>
            </div>
            <ArtistRankBadge sales={collection.curatorSales} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CollectionCard;
