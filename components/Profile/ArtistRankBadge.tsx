
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, Zap, Gem, Sparkles } from 'lucide-react';
import { ARTIST_RANKS } from '../../constants';

interface ArtistRankBadgeProps {
  sales: number;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ArtistRankBadge: React.FC<ArtistRankBadgeProps> = ({ sales, showTooltip = true, size = 'md' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const currentRank = [...ARTIST_RANKS]
    .reverse()
    .find(r => sales >= r.milestone) || {
    level: 0,
    name: 'Recruit',
    milestone: 0,
    color: '#ffffff',
    perk: 'Start selling to rank up',
    visualTheme: 'Recruit Matte'
  };

  const isMaster = currentRank.level >= 4;
  const isElite = currentRank.level === 5;
  const isPro = currentRank.level >= 3;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1 rounded-lg',
    md: 'w-12 h-12 p-2 rounded-xl',
    lg: 'w-16 h-16 p-3 rounded-2xl'
  };

  const iconSizes = {
    sm: 14,
    md: 22,
    lg: 28
  };

  const getGradient = () => {
    switch (currentRank.level) {
      case 1: return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      case 2: return 'linear-gradient(135deg, #E8E8E8 0%, #A9A9A9 100%)';
      case 3: return 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
      case 4: return 'linear-gradient(135deg, #E5E4E2 0%, #78909C 100%)';
      case 5: return 'linear-gradient(135deg, #b9f2ff 0%, #00f2ff 50%, #7000ff 100%)';
      default: return 'linear-gradient(135deg, #333 0%, #111 100%)';
    }
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-40 z-0"
        animate={{
          scale: isHovered ? [1, 1.4, 1.2] : [1, 1.2, 1],
          opacity: isHovered ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundColor: currentRank.color }}
      />

      <motion.div
        className={`relative flex items-center justify-center overflow-hidden border-2 z-10 ${sizeClasses[size]}`}
        style={{
          background: getGradient(),
          borderColor: isHovered ? '#ffffffaa' : `${currentRank.color}88`,
          boxShadow: isHovered
            ? `0 0 30px ${currentRank.color}aa, inset 0 0 15px rgba(255,255,255,0.5)`
            : `0 0 15px ${currentRank.color}44`
        }}
        initial={false}
        animate={{
          scale: isHovered ? 1.15 : 1,
          rotate: isHovered ? [0, -5, 5, 0] : 0
        }}
        transition={isHovered ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : { type: 'spring', stiffness: 300, damping: 15 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/10 pointer-events-none" />

        {isElite && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                animate={{
                  top: ['20%', '80%', '20%'],
                  left: [`${20 + i * 20}%`, `${80 - i * 20}%`, `${20 + i * 20}%`],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5]
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </div>
        )}

        {isMaster && (
          <motion.div
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 z-10"
            animate={{
              left: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "linear"
            }}
          />
        )}

        <div className="relative z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {currentRank.level === 0 && <Award size={iconSizes[size]} className="text-white/60" />}
          {currentRank.level === 1 && <Award size={iconSizes[size]} className="text-white fill-orange-200/20" />}
          {currentRank.level === 2 && <ShieldCheck size={iconSizes[size]} className="text-white fill-blue-100/20" />}
          {currentRank.level === 3 && <Zap size={iconSizes[size]} className="text-white fill-yellow-200/40" />}
          {currentRank.level === 4 && <Sparkles size={iconSizes[size]} className="text-white animate-pulse" />}
          {currentRank.level === 5 && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Gem size={iconSizes[size]} className="text-white fill-cyan-100/30" />
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isHovered && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full mb-4 z-50 w-56 p-5 glass rounded-[2rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none overflow-hidden"
          >
            <div
              className="absolute -top-10 -right-10 w-24 h-24 blur-2xl opacity-20 rounded-full"
              style={{ backgroundColor: currentRank.color }}
            />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: currentRank.color }}>
                  Level {currentRank.level || 0} Artist
                </p>
                {isPro && <Sparkles size={10} className="text-white/40" />}
              </div>
              <h4 className="text-lg font-display font-black text-white uppercase tracking-tight leading-none">
                {currentRank.name}
              </h4>
              <div className="h-px bg-white/5 my-2" />
              <div className="space-y-1">
                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Global Status</p>
                <p className="text-xs text-white/80 font-medium italic">
                  Over {currentRank.milestone.toLocaleString()} Credits Sold
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck size={12} className="text-green-500" />
                </div>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.1em]">Identity Verified</span>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistRankBadge;
