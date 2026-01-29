
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  Heart,
  Share2,
  Coins,
  ShieldCheck,
  Download,
  MonitorPlay,
  Activity,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';
import { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';
import FollowButton from '../components/Social/FollowButton';

interface ItemDetailProps {
  artwork: Artwork;
  onBack: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ artwork, onBack }) => {
  const { user, refreshUser } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const isOwned = user?.purchases?.includes(artwork.id);

  const handlePurchase = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setIsPurchasing(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/items/purchase/${artwork.id}`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setPurchaseSuccess(true);
        await refreshUser(); // Update balance and purchases list

        // @ts-ignore - canvas-confetti loaded in index.html
        if ((window as any).confetti) {
          (window as any).confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f2ff', '#7000ff', '#FFD700']
          });
        }
      } else {
        setErrorMsg(data.error || "Purchase failed");
        // alert(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase Error:", error);
      setErrorMsg("Failed to connect to server");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const targetUrl = `${apiUrl}/api/items/download/${artwork.id}?t=${Date.now()}`;

    try {
      console.log("Attempting download from:", targetUrl);
      const response = await fetch(targetUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        // Handle 401 specifically
        if (response.status === 401) {
          throw new Error("Session expired. Please refresh the page and login again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        // Trigger download via hidden link
        const link = document.createElement('a');
        link.href = data.url;
        link.download = `${artwork.title.replace(/\s+/g, '_')}_assets.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Download URL not found in response");
      }
    } catch (error: any) {
      console.error("Download failed:", error);
      alert(error.message || "Failed to download assets. Please try again later.");
    } finally {
      setIsDownloading(false);
    }
  };

  const previewSrc = artwork.showcaseUrl || artwork.imageUrl;
  const isVideo = previewSrc.toLowerCase().endsWith('.mp4') || previewSrc.toLowerCase().endsWith('.webm');

  return (
    <div className="pt-28 pb-20 container mx-auto px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Cinematic Showcase */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#00f2ff]" />
                <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.4em]">Master Collection</span>
              </div>
              <h1 className="text-5xl font-display font-black mb-4 uppercase tracking-tighter leading-none">{artwork.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                    <img src={artwork.artistAvatar} alt={artwork.artist} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white font-bold text-sm tracking-tight">@{artwork.artist}</span>
                  <ShieldCheck className="w-4 h-4 text-[#00f2ff]" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{artwork.category}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="p-4 glass rounded-2xl hover:bg-[#7000ff]/10 hover:border-[#7000ff]/30 transition-all group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-4 glass rounded-2xl hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/30 transition-all group">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* New Cinematic Showcase Preview */}
          <div className="relative w-full aspect-video rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white/5 bg-[#050505]">
            {/* Background Blur Glow */}
            <div className="absolute inset-0 opacity-20 blur-[100px] scale-150 pointer-events-none overflow-hidden">
              <img src={artwork.imageUrl} className="w-full h-full object-cover" />
            </div>

            <div className="relative w-full h-full z-10">
              {isVideo ? (
                <video src={previewSrc} className="w-full h-full object-cover" autoPlay loop muted playsInline controls={false} />
              ) : (
                <img src={previewSrc} className="w-full h-full object-cover" alt="Full Profile Showcase" />
              )}

              {/* Luxe Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />

              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 255, 0, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

              {/* HUD Decoration */}
              <div className="absolute top-8 left-8 z-20 pointer-events-none flex flex-col gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00f2ff] shadow-[0_0_15px_#00f2ff] animate-pulse" />
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em]">SIGNAL_LOCK</p>
                  <p className="text-[8px] font-black text-[#00f2ff] uppercase tracking-[0.3em]">VIBE_SIGNATURE_OK</p>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 z-20 pointer-events-none flex flex-col items-end gap-1 text-right">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Master ID</p>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">SC-{artwork.id}-AETHER</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[2.5rem] space-y-4 border border-white/5">
              <h3 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3">
                <Info className="w-5 h-5 text-[#00f2ff]" /> Atomic Data
              </h3>
              <p className="text-white/50 text-sm leading-relaxed italic">
                "{artwork.description}"
              </p>
              <div className="flex flex-wrap gap-2 pt-4">
                {['1920x1080', 'High Bitrate', 'Seamless Loop', 'Artist Verified'].map(tag => (
                  <div key={tag} className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-widest">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <h3 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#7000ff]" /> Telemetry
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <span>Performance Rating</span>
                  <span className="text-[#00f2ff]">OPTIMIZED</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]" />
                </div>
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest leading-relaxed">
                  This asset is compatible with all Steam client versions. Optimized for high-DPI displays.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-4 sticky top-32 space-y-6">
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[40px] rounded-full" />

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Exchange Rate</p>
                <h4 className="text-sm font-bold text-white uppercase">Vault Listing</h4>
              </div>
              <div className="flex items-center gap-2 text-[#FFD700] text-4xl font-display font-black">
                <Coins className="w-8 h-8" />
                {artwork.price}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              {isOwned || purchaseSuccess ? (
                <div className="space-y-4">
                  <motion.button
                    disabled={true}
                    className="w-full py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl bg-green-500/10 text-green-500 border border-green-500/30 cursor-default"
                  >
                    OWNED <ShieldCheck className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-5 glass text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-[#00f2ff] border-t-transparent rounded-full"
                      />
                    ) : (
                      <>Download Assets <Download className="w-5 h-5" /></>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  disabled={isPurchasing}
                  onClick={handlePurchase}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl bg-[#00f2ff] text-black hover:shadow-[0_0_50px_rgba(242,255,0.4)]"
                >
                  {isPurchasing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-7 h-7 border-4 border-black border-t-transparent rounded-full"
                    />
                  ) : (
                    <>UNLOCK NOW <ArrowLeft className="w-6 h-6 rotate-180" /></>
                  )}
                </motion.button>
              )}
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                  <img src={artwork.artistAvatar} alt={artwork.artist} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Artist Transmission</h4>
                  <p className="text-[10px] text-white/30 uppercase font-black">Follow for New Drops</p>
                </div>
                <div className="ml-auto">
                  <FollowButton artistName={artwork.artist} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#00f2ff]/10 to-[#7000ff]/10 p-10 rounded-[3rem] border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-5 h-5 text-[#00f2ff]" />
              </div>
              <h4 className="font-display font-black text-white uppercase tracking-tight">Vault Protocol</h4>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed uppercase font-bold tracking-widest">
              Your purchase is protected by the SteamCanvas Guarantee. Incompatible assets qualify for automatic credit restoration within 72 cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
