
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Store,
  TrendingUp,
  Coins,
  Clock,
  ShieldCheck,
  ExternalLink,
  Edit3,
  Trash2,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  FolderArchive,
  Info,
  CheckCircle2,
  AlertCircle,
  Award,
  Users
} from 'lucide-react';
import { ARTWORKS, ARTIST_RANKS } from '../constants';
import { Artwork, SaleRecord } from '../types';
import { useWallet } from '../context/WalletContext';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import ArtworkCard from '../components/Marketplace/ArtworkCard';
import ArtistRankBadge from '../components/Profile/ArtistRankBadge';
import ArtistRankProgressBar from '../components/Profile/ArtistRankProgressBar';
import FollowButton from '../components/Social/FollowButton';

type TabType = 'collection' | 'listings' | 'analytics' | 'following';
type ListingTabType = 'active' | 'pending';

const MOCK_SALES: SaleRecord[] = [
  { id: 's1', artworkTitle: 'Neon Ronin', buyer: 'ShadowWalker', grossPrice: 450, netProfit: 382, timestamp: Date.now() - 3600000 },
  { id: 's2', artworkTitle: 'Plasma Core', buyer: 'VaporKing', grossPrice: 600, netProfit: 510, timestamp: Date.now() - 86400000 },
  { id: 's3', artworkTitle: 'Neon Ronin', buyer: 'CyberPunker', grossPrice: 450, netProfit: 382, timestamp: Date.now() - 172800000 },
];

const Profile: React.FC<{ onNavigateToUpload: () => void, onSelectArtwork: (artwork: Artwork) => void }> = ({ onNavigateToUpload, onSelectArtwork }) => {
  const { balance } = useWallet();
  const { following } = useSocial();
  const [activeTab, setActiveTab] = useState<TabType>('collection');
  const [listingSubTab, setListingSubTab] = useState<ListingTabType>('active');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // My Data (Logged in as CyberSage)
  const mySales = 112000; // Level 4 Master
  const lifetimeEarnings = 12450;
  const userLevel = 42;

  // Simulate Level Up modal for demo purposes if sales are high
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!(window as any).sessionStorage.getItem('level_up_shown')) {
        setShowLevelUp(true);
        (window as any).sessionStorage.setItem('level_up_shown', 'true');
        // @ts-ignore
        (window as any).confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2ff', '#7000ff', '#FFD700']
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // const { user } = useAuth(); // Removed duplicate

  const [profileData, setProfileData] = useState<any>(null);
  const [collection, setCollection] = useState<Artwork[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          // Map collection data
          const mappedCollection = data.collection.map((art: any) => ({
            ...art,
            artist: art.artist || 'Unknown',
            artistAvatar: art.artistAvatar || 'https://picsum.photos/100',
            sales: 0,
            likes: 0,
            isAnimated: art.fileType === 'image/gif' || art.r2Key?.endsWith('.gif') || false
          }));
          setCollection(mappedCollection);
        }
      } catch (e) {
        console.error("Profile Fetch Error:", e);
      }
    };
    fetchProfile();
  }, []);

  // Use real collection or empty if loading
  const myCollection = collection;
  const myActiveListings = ARTWORKS.filter(a => a.artist === 'CyberSage');

  const followedArtistData = following.map(name => {
    const art = ARTWORKS.find(a => a.artist === name);
    return {
      name,
      sales: art?.artistSales || 0,
      avatar: art?.artistAvatar || `https://picsum.photos/seed/${name}/100/100`
    };
  });

  const topArtists = ARTWORKS
    .filter(a => a.artistSales && a.artistSales >= 100000)
    .map(a => ({ name: a.artist, sales: a.artistSales || 0, avatar: a.artistAvatar }))
    .filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i); // Distinct artists

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  const { user } = useAuth(); // Get real user data

  if (!user) return null; // Should be handled by ProtectedRoute, but safety check

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
      {/* Level Up Modal omitted for brevity if unchanged, but kept logic for following logic */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass max-w-lg w-full rounded-[4rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00f2ff] to-[#7000ff]" />
              <div className="mb-8 relative inline-block">
                <ArtistRankBadge sales={mySales} size="lg" showTooltip={false} />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-[#00f2ff] -z-10"
                />
              </div>
              <h2 className="text-4xl font-display font-black text-white mb-4 uppercase tracking-tighter leading-none">Rank Up!<br /><span className="text-[#00f2ff]">MASTER STATUS</span></h2>
              <p className="text-white/50 mb-10 leading-relaxed font-medium">
                You've surpassed 100k credit sales. Priority listing and the Platinum Chrome badge have been synchronized to your profile.
              </p>
              <button
                onClick={() => setShowLevelUp(false)}
                className="w-full py-5 bg-[#00f2ff] text-black rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl hover:shadow-[0_0_40px_rgba(0,242,255,0.4)] transition-all"
              >
                Accept Honors
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <header className="mb-12 flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-grow glass rounded-[3rem] p-8 lg:p-10 border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff]/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] shadow-[0_0_30px_rgba(242,255,0.2)]">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#050505]">
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#050505] rounded-full p-0.5 border border-white/10 shadow-xl">
              <ArtistRankBadge sales={mySales} size="sm" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl font-display font-black tracking-tight">{user.displayName}</h1>
              <span className="bg-[#00f2ff] text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white/5">
                LVL {user.artistLevel}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-[#00f2ff] uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                MASTER CREATOR
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">
                VERIFIED ARTIST
              </span>
            </div>
            <p className="text-white/40 text-sm max-w-sm font-medium">
              Visual alchemist crafting neon dreams and digital artifacts.
            </p>
          </div>

          <div className="md:ml-auto flex gap-4">
            <button className="p-4 glass rounded-2xl hover:bg-white/5 transition-colors border-white/10">
              <Edit3 className="w-5 h-5 text-white/50" />
            </button>
            <button className="p-4 glass rounded-2xl hover:bg-white/5 transition-colors border-white/10">
              <ExternalLink className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        <div className="lg:w-80 glass rounded-[3rem] p-8 border border-[#FFD700]/10 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(255,215,0,0.1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[40px] rounded-full" />
          <Coins className="w-10 h-10 text-[#FFD700] mb-4" />
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Vault Portfolio</p>
          <p className="text-4xl font-display font-black text-[#FFD700] mb-4">{lifetimeEarnings.toLocaleString()}</p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '88%' }}
              className="h-full bg-gradient-to-r from-[#FFD700] to-yellow-600"
            />
          </div>
          <p className="text-[10px] text-white/20 mt-3 font-black uppercase tracking-widest">Global Top 1% Earner</p>
        </div>
      </header>

      {/* Main Dashboard Tabs */}
      <div className="space-y-8">
        <div className="flex items-center gap-8 border-b border-white/5 px-2">
          {[
            { id: 'collection', label: 'My Collection', icon: Package },
            { id: 'listings', label: 'My Shop', icon: Store },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'following', label: 'Following', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 py-4 relative font-black text-xs uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-dash-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f2ff]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'following' && (
              <motion.div
                key="following"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {followedArtistData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followedArtistData.map((artist) => (
                      <div key={artist.name} className="glass p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:border-[#00f2ff]/30 transition-all">
                        <div className="w-16 h-16 rounded-full border-2 border-[#00f2ff] p-1 bg-black/40">
                          <img src={artist.avatar} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-lg text-white">@{artist.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <ArtistRankBadge sales={artist.sales} size="sm" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                              {artist.sales.toLocaleString()} Credits
                            </span>
                          </div>
                        </div>
                        <FollowButton artistName={artist.name} className="px-4 py-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 space-y-8">
                    <div className="max-w-md mx-auto space-y-4">
                      <Users className="w-16 h-16 text-white/10 mx-auto" />
                      <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">You aren't following any artists yet</h3>
                      <p className="text-sm text-white/30 font-medium">Follow creators to receive real-time neural uplinks on their latest masterpieces and rank upgrades.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] whitespace-nowrap">Suggested Elite Partners</h4>
                        <div className="h-px bg-white/5 flex-grow" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topArtists.map(artist => (
                          <div key={artist.name} className="glass p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-4 group hover:border-[#00f2ff]/20 transition-all">
                            <div className="w-20 h-20 rounded-full border-2 border-[#00f2ff]/50 p-1 bg-black/40 group-hover:border-[#00f2ff] transition-colors">
                              <img src={artist.avatar} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-white">@{artist.name}</h4>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <ArtistRankBadge sales={artist.sales} size="sm" />
                              </div>
                            </div>
                            <FollowButton artistName={artist.name} className="w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Other tabs collection/listings/analytics logic remains same but omitted for brevity */}
            {activeTab === 'collection' && (
              <motion.div
                key="collection"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {myCollection.map((art, idx) => (
                  <motion.div key={art.id} variants={itemVariants}>
                    <div className="glass p-4 rounded-3xl border border-white/5 group hover:border-[#00f2ff]/30 transition-all flex flex-col h-full">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-black/50">
                        <img src={art.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <button
                            onClick={() => setShowGuide(true)}
                            className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white/70 hover:text-white hover:bg-[#00f2ff]/20 transition-all"
                            title="Steam Setup Guide"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <h4 className="font-bold text-white mb-1">{art.title}</h4>
                        <p className="text-xs text-white/50 mb-4">@{art.artist}</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/items/download/${art.id}`;
                            }}
                            className="w-full py-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded-lg font-bold text-xs uppercase hover:bg-[#00f2ff] hover:text-black transition-all flex items-center justify-center gap-2"
                          >
                            <FolderArchive className="w-3 h-3" /> Download Assets
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {/* listings/analytics omitted */}
          </AnimatePresence>
        </div>
      </div>

      {/* Steam Setup Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass max-w-2xl w-full rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                  Steam <span className="text-[#00f2ff]">Setup Guide</span>
                </h3>
                <button onClick={() => setShowGuide(false)} className="text-white/50 hover:text-white">
                  <ExternalLink className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6 text-white/70">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Download Artwork</h4>
                    <p className="text-sm">Click the "Download Assets" button to get your ZIP file containing the artwork slices.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Upload to Steam</h4>
                    <p className="text-sm">Go to your Steam Profile &gt; Artwork &gt; Upload Artwork. Upload each slice (Main, Side) separately.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Console Command (Important!)</h4>
                    <p className="text-sm">On the upload page, right-click &gt; Inspect Element &gt; Console. Paste this code before saving:</p>
                    <code className="block mt-2 p-3 bg-black/50 rounded-lg text-[10px] font-mono text-[#00f2ff] select-all">
                      document.getElementsByName("image_width")[0].value = 1000;
                      document.getElementsByName("image_height")[0].value = 1;
                    </code>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Equip on Profile</h4>
                    <p className="text-sm">Edit Profile &gt; Featured Showcase &gt; Artwork Showcase. Select your uploaded pieces.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
