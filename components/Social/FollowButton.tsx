
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

interface FollowButtonProps {
  artistName: string;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ artistName, className = "" }) => {
  const { following, toggleFollow } = useSocial();
  const isFollowing = following.includes(artistName);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow(artistName);
      }}
      className={`relative px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${
        isFollowing 
        ? 'bg-[#7000ff] text-white border border-[#7000ff] shadow-[0_0_20px_rgba(112,0,255,0.4)]' 
        : 'bg-transparent text-[#00f2ff] border border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-[#00f2ff]/10'
      } ${className}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          Follow
        </>
      )}
      
      {/* Glow aura for the non-following state */}
      {!isFollowing && (
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl bg-[#00f2ff]/5 -z-10"
        />
      )}
    </motion.button>
  );
};

export default FollowButton;
