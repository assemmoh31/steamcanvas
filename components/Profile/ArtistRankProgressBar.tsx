
import React from 'react';
import { motion } from 'framer-motion';
import { ARTIST_RANKS } from '../../constants';
import { ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

interface ArtistRankProgressBarProps {
  sales: number;
}

const ArtistRankProgressBar: React.FC<ArtistRankProgressBarProps> = ({ sales }) => {
  const currentRankIndex = ARTIST_RANKS.findIndex(r => sales < r.milestone);
  const currentRank = ARTIST_RANKS[currentRankIndex > 0 ? currentRankIndex - 1 : currentRankIndex === -1 ? ARTIST_RANKS.length - 1 : 0];
  const nextRank = ARTIST_RANKS[currentRankIndex === -1 ? ARTIST_RANKS.length - 1 : currentRankIndex];
  
  const isMaxLevel = sales >= ARTIST_RANKS[ARTIST_RANKS.length - 1].milestone;

  // Calculate progress for the current segment
  const getSegmentProgress = () => {
    if (isMaxLevel) return 100;
    const prevMilestone = currentRankIndex > 0 ? ARTIST_RANKS[currentRankIndex - 1].milestone : 0;
    const currentMilestone = nextRank.milestone;
    const range = currentMilestone - prevMilestone;
    const completed = sales - prevMilestone;
    return Math.min(Math.max((completed / range) * 100, 0), 100);
  };

  return (
    <div className="space-y-8 glass p-8 lg:p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7000ff]/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00f2ff]" />
            <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.4em]">Path to Elite</span>
          </div>
          <h2 className="text-3xl font-display font-black uppercase tracking-tight">Artist Progression</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Lifetime Volume</p>
          <p className="text-2xl font-display font-black text-white">{sales.toLocaleString()} <span className="text-sm text-[#FFD700]">Credits</span></p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="h-4 bg-white/5 rounded-full border border-white/10 p-1 flex relative">
          {ARTIST_RANKS.map((rank, idx) => (
            <div 
              key={rank.level} 
              className="flex-grow h-full relative"
              style={{ width: `${100 / ARTIST_RANKS.length}%` }}
            >
              {/* Milestone Marker */}
              <div className="absolute -top-1 right-0 w-px h-4 bg-white/20 z-20" />
              <div className="absolute -bottom-6 right-0 -translate-x-1/2 text-[8px] font-black text-white/20 uppercase">
                {rank.milestone >= 1000 ? `${rank.milestone/1000}k` : rank.milestone}
              </div>
              
              {/* Segment fill logic */}
              {sales >= rank.milestone && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]"
                />
              )}
              {currentRankIndex === idx && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getSegmentProgress()}%` }}
                  className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex items-start gap-4">
             <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                <Sparkles className="w-6 h-6 text-[#FFD700]" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Current Active Perk</p>
                <h4 className="text-sm font-bold text-white uppercase">{currentRank.perk}</h4>
             </div>
          </div>

          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/20 rounded-[2rem] p-6 flex items-center group cursor-pointer hover:bg-[#00f2ff]/10 transition-colors">
             <div className="flex-grow">
                <p className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest mb-1">Unlock Next</p>
                <h4 className="text-sm font-bold text-white uppercase">{isMaxLevel ? "Ultimate Creator" : nextRank.perk}</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-[#00f2ff] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistRankProgressBar;
