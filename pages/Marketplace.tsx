
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ArtworkCard from '../components/Marketplace/ArtworkCard';
import { Category, Artwork } from '../types';
import { useAuth } from '../context/AuthContext';

interface MarketplaceProps {
  onSelectArtwork: (artwork: Artwork) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onSelectArtwork }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // Fetch real artworks from API
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/artworks`);
        if (res.ok) {
          const data = await res.json();
          const mappedArtworks = data.artworks.map((art: any) => ({
            ...art,
            artist: art.artist?.displayName || 'Unknown',
            artistAvatar: art.artist?.avatarUrl || 'https://picsum.photos/100',
            artistSales: (art.artist?.artistLevel || 1) * 10000,
            likes: art.likes || 0,
            isAnimated: art.fileType === 'image/gif' || art.r2Key?.endsWith('.gif') || false
          }));
          setArtworks(mappedArtworks);
        }
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.artist.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory || (selectedCategory === 'Featured' && !art.category);
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, artworks]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="max-w-xl flex-grow">
          <h1 className="text-4xl font-display font-bold mb-4">The Gallery</h1>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/30 group-focus-within:text-[#00f2ff] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search artworks, artists, styles..."
              value={search}
              // Cast to any to access value property
              onChange={(e) => setSearch((e.target as any).value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all neon-border-cyan font-medium text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedCategory === 'All' ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}`}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedCategory === cat ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass rounded-2xl aspect-video animate-pulse overflow-hidden relative border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredArtworks.map((artwork, idx) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    index={idx}
                    onClick={() => onSelectArtwork(artwork)}
                    isOwned={user?.purchases?.includes(artwork.id) || false}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40 glass rounded-3xl border border-dashed border-white/10">
              <SlidersHorizontal className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white/40">No artworks found matching your criteria</h3>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                className="mt-6 text-[#00f2ff] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marketplace;