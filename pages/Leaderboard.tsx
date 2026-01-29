
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Coins, Star, Crown, TrendingUp, Medal, ChevronRight } from 'lucide-react';
import { ARTWORKS } from '../constants';
import ArtistRankBadge from '../components/Profile/ArtistRankBadge';
import FollowButton from '../components/Social/FollowButton';

interface ArtistStat {
  name: string;
  sales: number;
  followers: number;
  avatar: string;
  level: number;
}

const Leaderboard: React.FC = () => {
  // Aggregate artist data from mock artworks
  const artists: ArtistStat[] = useMemo(() => {
    const artistMap = new Map<string, ArtistStat>();
    
    ARTWORKS.forEach(art => {
      if (!artistMap.has(art.artist)) {
        artistMap.set(art.artist, {
          name: art.artist,
          sales: art.artistSales || 0,
          // Randomize followers for visual variety in the leaderboard
          followers: Math.floor((art.artistSales || 0) * 0.15 + Math.random() * 5000),
          avatar: art.artistAvatar,
          level: (art.artistSales || 0) > 200000 ? 5 : (art.artistSales || 0) > 100000 ? 4 : 3
        });
      }
    });

    // Add some extra mock artists to fill the leaderboard
    const extraArtists = [
      { name: 'VaporKing', sales: 320000, followers: 45200, avatar: 'https://picsum.photos/seed/vapor/100/100', level: 5 },
      { name: 'GlowRunner', sales: 95000, followers: 12100, avatar: 'https://picsum.photos/seed/glow/100/100', level: 3 },
      { name: 'NeonPulse', sales: 185000, followers: 28400, avatar: 'https://picsum.photos/seed/neon/100/100', level: 4 },
      { name: 'StaticVoid', sales: 62000, followers: 8500, avatar: 'https://picsum.photos/seed/static/100/100', level: 2 },
      { name: 'PixelMancer', sales: 410000, followers: 58900, avatar: 'https://picsum.photos/seed/mancer/100/100', level: 5 },
    ];

    extraArtists.forEach(a => {
      if (!artistMap.has(a.name)) artistMap.set(a.name, a);
    });

    return Array.from(artistMap.values()).sort((a, b) => b.sales - a.sales);
  }, []);

  const top3 = artists.slice(0, 3);
  const remainingArtists = artists.slice(3);

  // Cast containerVariants to any to avoid complex framer-motion type errors
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
      <header className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7000ff]/10 blur-[120px] -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00f2ff] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Trophy className="w-3.5 h-3.5" /> Global Artist Hall of Fame
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 uppercase">
            Leader<span className="text-[#7000ff]">board</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold text-[10px]">
            The most elite creators in the Steam network, ranked by neural engagement.
          </p>
        </motion.div>
      </header>

      {/* Top 3 Podium Section */}
      <section className="mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 md:order-1 h-full"
          >
            <div className="glass p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden group hover:border-[#7000ff]/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7000ff]/30 to-transparent" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 relative z-10">
                  <img src={top3[1].avatar} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center font-black text-[#A0A0A0] shadow-xl z-20">
                  #2
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">@{top3[1].name}</h3>
                <ArtistRankBadge sales={top3[1].sales} size="md" />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Sales</p>
                  <p className="text-xs font-bold text-[#FFD700] flex items-center justify-center gap-1">
                    <Coins size={10} /> {top3[1].sales.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Followers</p>
                  <p className="text-xs font-bold text-[#00f2ff] flex items-center justify-center gap-1">
                    <Users size={10} /> {top3[1].followers.toLocaleString()}
                  </p>
                </div>
              </div>
              <FollowButton artistName={top3[1].name} className="w-full" />
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 md:order-2 h-full z-10"
          >
            <div className="glass p-10 rounded-[4rem] border-[#00f2ff]/30 bg-gradient-to-b from-[#00f2ff]/5 to-transparent flex flex-col items-center text-center space-y-8 relative overflow-hidden group shadow-[0_0_50px_rgba(0,242,255,0.1)]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent" />
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#00f2ff] p-1.5 relative z-10 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                  <img src={top3[0].avatar} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-3 -right-3 w-14 h-14 bg-[#00f2ff] backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center font-black text-black shadow-2xl z-20 animate-pulse">
                  <Crown size={28} />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter">@{top3[0].name}</h3>
                <ArtistRankBadge sales={top3[0].sales} size="lg" />
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-xl font-display font-black text-[#FFD700] flex items-center justify-center gap-2">
                    <Coins size={16} /> {top3[0].sales.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Fan Base</p>
                  <p className="text-xl font-display font-black text-[#00f2ff] flex items-center justify-center gap-2">
                    <Users size={16} /> {top3[0].followers.toLocaleString()}
                  </p>
                </div>
              </div>
              <FollowButton artistName={top3[0].name} className="w-full py-4 text-sm" />
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="order-3 h-full"
          >
            <div className="glass p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden group hover:border-[#7000ff]/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 relative z-10">
                  <img src={top3[2].avatar} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center font-black text-[#CD7F32] shadow-xl z-20">
                  #3
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">@{top3[2].name}</h3>
                <ArtistRankBadge sales={top3[2].sales} size="md" />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Sales</p>
                  <p className="text-xs font-bold text-[#FFD700] flex items-center justify-center gap-1">
                    <Coins size={10} /> {top3[2].sales.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Followers</p>
                  <p className="text-xs font-bold text-[#00f2ff] flex items-center justify-center gap-1">
                    <Users size={10} /> {top3[2].followers.toLocaleString()}
                  </p>
                </div>
              </div>
              <FollowButton artistName={top3[2].name} className="w-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Ranking Table/List */}
      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <TrendingUp size={14} className="text-[#00f2ff]" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Ascending Talent</span>
          </div>
          <div className="flex-grow h-px bg-white/5" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {remainingArtists.map((artist, index) => (
            <motion.div 
              key={artist.name}
              variants={itemVariants}
              className="glass p-6 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:bg-white/[0.02] hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-6 md:w-1/3">
                <span className="text-2xl font-display font-black text-white/10 group-hover:text-[#00f2ff]/20 transition-colors w-8">
                  {index + 4}
                </span>
                <div className="w-16 h-16 rounded-full border border-white/10 p-0.5 bg-black/40 relative">
                  <img src={artist.avatar} className="w-full h-full rounded-full object-cover" />
                  <div className="absolute -bottom-1 -right-1">
                    <ArtistRankBadge sales={artist.sales} size="sm" showTooltip={false} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display font-black text-white uppercase tracking-tight">@{artist.name}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest">
                    <Star className="w-2.5 h-2.5 text-[#FFD700]" /> Verified Artist
                  </div>
                </div>
              </div>

              <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto items-center">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Total Volume</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#FFD700]" />
                    <span className="font-bold text-white tabular-nums">{artist.sales.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Social Reach</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00f2ff]" />
                    <span className="font-bold text-white tabular-nums">{artist.followers.toLocaleString()}</span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Active Stream</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <FollowButton artistName={artist.name} className="flex-grow md:flex-none" />
                <button className="p-4 glass rounded-2xl text-white/20 hover:text-white transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Hall of Fame Stats Footer */}
      <footer className="mt-32 p-12 glass rounded-[3rem] border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center">
        <div className="space-y-2">
          <p className="text-4xl font-display font-black text-white leading-none">524</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Verified Artists</p>
        </div>
        <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0 px-8">
          <p className="text-4xl font-display font-black text-[#00f2ff] leading-none">1.2M+</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Market Transactions</p>
        </div>
        <div className="space-y-2">
          <p className="text-4xl font-display font-black text-[#7000ff] leading-none">12.5k</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">New Follows / Day</p>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
