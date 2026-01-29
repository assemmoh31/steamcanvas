
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Coins, Plus, FolderPlus, Bookmark, CheckCircle2, Gift, ShieldCheck } from 'lucide-react';
import { Artwork } from '../../types';
import ArtistRankBadge from '../Profile/ArtistRankBadge';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
  index: number;
  isOwned?: boolean;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onClick, index, isOwned }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Reduced tilt effect for a cleaner landscape look
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const isPending = artwork.status === 'pending';
  const url = artwork.imageUrl?.toLowerCase() || '';
  const isVideo = url.endsWith('.webm') || url.endsWith('.mp4');
  const isGif = url.endsWith('.gif');
  // If explicitly animated but not a video file, treat as GIF/Image
  const isAnimatedImage = isGif || (artwork.isAnimated && !isVideo);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isHovered) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented
          });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isVideo]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || showAddMenu) return;
    const rect = (ref.current as any).getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
      onClick={(e) => {
        if (!showAddMenu) onClick();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`glass rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 ${isPending
          ? 'border-orange-500/20 grayscale-[0.3]'
          : 'border-white/5 group-hover:border-[#00f2ff]/30 group-hover:shadow-[0_0_30px_rgba(0,242,255,0.1)]'
          }`}
      >
        {/* Preview Container: Aspect Video (16:9) */}
        <div className="relative aspect-video overflow-hidden bg-black/40">

          {isVideo ? (
            <video
              ref={videoRef}
              src={artwork.imageUrl}
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
              style={{ imageRendering: '-webkit-optimize-contrast' } as any}
            />
          ) : (
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              onError={(e) => {
                // Fallback for failed images
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/000000/FFF?text=Preview+Unavailable&font=montserrat';
              }}
              className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
              style={{ imageRendering: '-webkit-optimize-contrast' } as any}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />



          {/* Top Right: Animated Badge */}
          {artwork.isAnimated && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white/80 border border-white/10">
              {isVideo ? 'Video' : 'GIF'}
            </div>
          )}

          {/* Curation Action Button (Top Left) */}
          <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMenu(!showAddMenu);
              }}
              className={`p-1.5 rounded-lg border border-white/10 backdrop-blur-xl transition-all ${showAddMenu ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white'
                }`}
            >
              <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${showAddMenu ? 'rotate-45' : ''}`} />
            </button>

            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  className="absolute top-0 left-10 glass border-white/10 p-1.5 rounded-lg shadow-2xl w-40 overflow-hidden z-30"
                >
                  <button className="w-full flex items-center gap-2 p-2 hover:bg-[#00f2ff]/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-[#00f2ff] transition-all">
                    <Bookmark size={12} /> Add to Existing
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 hover:bg-[#00f2ff]/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-[#00f2ff] transition-all mt-0.5">
                    <FolderPlus size={12} /> Create New
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info - Glassmorphism applied */}
        <div className="p-3 bg-white/[0.02] backdrop-blur-sm border-t border-white/5 relative z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate text-white/90 group-hover:text-[#00f2ff] transition-colors leading-tight">
                {artwork.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-4 h-4 rounded-full overflow-hidden bg-white/10 shrink-0">
                  <img src={artwork.artistAvatar} alt={artwork.artist} className="w-full h-full object-cover" />
                </div>
                <p className="text-white/40 text-[11px] truncate hover:text-white/70 transition-colors">
                  @{artwork.artist}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end">
              {isOwned ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 10 }}
                  className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/30 px-2 py-0.5 rounded-md overflow-hidden"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span className="font-bold text-[9px] uppercase tracking-widest">IN VAULT</span>
                </motion.div>
              ) : artwork.price === 0 ? (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/20 border border-emerald-500/50 px-1.5 py-0.5 rounded overflow-hidden transition-all duration-300 group-hover:brightness-125 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Gift className="w-3 h-3" />
                  <span className="font-bold text-xs tracking-widest">FREE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[#FFD700] bg-[#FFD700]/10 px-1.5 py-0.5 rounded overflow-hidden">
                  <Coins className="w-3 h-3" />
                  <span className="font-bold text-xs">{artwork.price}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-white/30 mt-1">
                <Heart className="w-3 h-3" />
                <span className="text-[10px]">{artwork.likes > 999 ? (artwork.likes / 1000).toFixed(1) + 'k' : artwork.likes}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArtworkCard;
