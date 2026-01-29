
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Zap, ArrowRight, Star } from 'lucide-react';
import MarketFeed from '../components/Home/MarketFeed';
import ArtworkCard from '../components/Marketplace/ArtworkCard';
import { ARTWORKS } from '../constants';

interface HomeProps {
  onNavigateToMarket: () => void;
  onSelectArtwork: (artwork: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToMarket, onSelectArtwork }) => {
  const featured = ARTWORKS.slice(0, 3);

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f2ff]/10 blur-[120px] rounded-full -z-10"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00f2ff] text-sm font-bold mb-6">
            <Star className="w-4 h-4 fill-[#00f2ff]" />
            CURATED STEAM ARTWORKS
          </span>
          
          <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-8 leading-tight">
            ELEVATE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#7000ff] to-[#00f2ff] bg-[length:200%_auto] animate-shimmer">STEAM PROFILE</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            The world's premium marketplace for custom animated backgrounds, workshop showcases, and unique artist creations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button 
              onClick={onNavigateToMarket}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-[#00f2ff] text-black font-bold rounded-2xl flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-shadow"
            >
              Explore Gallery <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 glass text-white font-bold rounded-2xl border border-white/10 hover:bg-white/5"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </section>

      <MarketFeed />

      {/* Featured Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold mb-2">Editor's Choice</h2>
            <p className="text-white/40">Hand-picked masterpieces from our top verified artists.</p>
          </div>
          <button 
            onClick={onNavigateToMarket}
            className="text-[#00f2ff] font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((artwork, idx) => (
            <ArtworkCard 
              key={artwork.id} 
              artwork={artwork} 
              index={idx} 
              onClick={() => onSelectArtwork(artwork)}
            />
          ))}
        </div>
      </section>

      {/* Features List */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 glass rounded-3xl border border-white/5 hover:border-[#00f2ff]/20 transition-colors">
            <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-xl flex items-center justify-center">
              <Zap className="text-[#00f2ff] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Instant Integration</h3>
            <p className="text-white/50">One-click download with perfect dimensions for easy Steam profile setup.</p>
          </div>
          <div className="space-y-4 p-8 glass rounded-3xl border border-white/5 hover:border-[#7000ff]/20 transition-colors">
            <div className="w-12 h-12 bg-[#7000ff]/10 rounded-xl flex items-center justify-center">
              <Shield className="text-[#7000ff] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Safe Transactions</h3>
            <p className="text-white/50">Secure vault system powered by the most reliable virtual currency infrastructure.</p>
          </div>
          <div className="space-y-4 p-8 glass rounded-3xl border border-white/5 hover:border-[#FFD700]/20 transition-colors">
            <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center">
              <Rocket className="text-[#FFD700] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Verified Artists</h3>
            <p className="text-white/50">Every piece is vetted for quality and originality by our curation team.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
