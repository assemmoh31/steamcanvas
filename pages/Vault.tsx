
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, ShieldCheck, Heart, Share2, Layers, ExternalLink } from 'lucide-react';
import { Artwork } from '../types';

const Vault: React.FC = () => {
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/vault`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend data if needed, similar to Marketplace
          const mappedItems = data.vault.map((art: any) => ({
            ...art,
            artist: art.artist || 'Unknown',
            artistAvatar: art.artistAvatar || 'https://picsum.photos/100',
            likes: art.likes || 0,
            isAnimated: art.fileType === 'image/gif' || art.r2Key?.endsWith('.gif') || false
          }));
          setItems(mappedItems);
        }
      } catch (error) {
        console.error("Vault Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-6 h-6 text-[#00f2ff]" />
            <span className="text-xs font-black text-[#00f2ff] uppercase tracking-[0.3em]">Secure Storage</span>
          </div>
          <h1 className="text-4xl font-display font-bold">My Vault</h1>
          <p className="text-white/50 mt-2">Access and manage your premium collection.</p>
        </div>

        <div className="relative group max-w-md w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/30 group-focus-within:text-[#00f2ff] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search your collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all neon-border-cyan font-medium text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-3xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-40 glass rounded-3xl border border-dashed border-white/10">
          <ShieldCheck className="w-16 h-16 text-white/10 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white/40 mb-2">Your vault is empty</h3>
          <p className="text-white/30 mb-8 max-w-md mx-auto">Purchase items from the marketplace to build your collection.</p>
          <a href="#" className="px-8 py-4 bg-[#00f2ff]/10 text-[#00f2ff] font-bold rounded-xl border border-[#00f2ff]/30 hover:bg-[#00f2ff] hover:text-black transition-all">
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="glass p-6 rounded-[2.5rem] border border-white/5 group hover:border-[#00f2ff]/30 transition-all">
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-black/50">
                <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                {item.isAnimated && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
                    Animated
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-white/50">@{item.artist}</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#00f2ff]" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="col-span-2 py-3 bg-[#00f2ff] text-black rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                    <Download className="w-4 h-4" /> Download Assets
                  </button>
                  <button className="py-3 glass border border-white/10 rounded-xl font-bold text-[10px] uppercase text-white/70 hover:bg-white/5 flex items-center justify-center gap-2 pointer-events-none opacity-50">
                    Steam Login <ExternalLink className="w-3 h-3" />
                  </button>
                  <button className="py-3 glass border border-white/10 rounded-xl font-bold text-[10px] uppercase text-white/70 hover:bg-white/5 flex items-center justify-center gap-2">
                    Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vault;
