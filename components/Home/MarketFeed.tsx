
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ShieldCheck } from 'lucide-react';

const MOCK_EVENTS = [
  { user: 'xX_Shadow_Xx', action: 'purchased', item: 'Neon Ronin', time: '2m ago' },
  { user: 'VaporKing', action: 'liked', item: 'Plasma Core', time: '5m ago' },
  { user: 'SteamElite', action: 'listed', item: 'Ghost Shell', time: '8m ago' },
  { user: 'CyberPunker', action: 'purchased', item: 'Static Void', time: '12m ago' },
  { user: 'ArtistAlpha', action: 'verified', item: 'Profile Set #4', time: '15m ago' },
];

const MarketFeed: React.FC = () => {
  return (
    <div className="w-full bg-white/5 border-y border-white/10 py-3 overflow-hidden whitespace-nowrap">
      <motion.div 
        className="inline-block"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <div className="flex gap-12 items-center px-4">
          {[...MOCK_EVENTS, ...MOCK_EVENTS].map((event, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <span className="text-white/40 flex items-center gap-1">
                {event.action === 'purchased' ? <ShoppingCart className="w-3 h-3 text-[#00f2ff]" /> : 
                 event.action === 'liked' ? <Heart className="w-3 h-3 text-red-500" /> : 
                 <ShieldCheck className="w-3 h-3 text-green-500" />}
                {event.time}
              </span>
              <span className="font-bold text-[#00f2ff]">{event.user}</span>
              <span className="text-white/60">{event.action}</span>
              <span className="text-white font-medium italic underline decoration-[#7000ff]/50 underline-offset-4">{event.item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketFeed;
