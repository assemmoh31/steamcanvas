
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Layout/Navbar';
import GridBackground from './components/Layout/GridBackground';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ItemDetail from './pages/ItemDetail';
import Vault from './pages/Vault';
import Studio from './pages/Studio';
import Profile from './pages/Profile';
import Tools from './pages/Tools';
import ThemeFinder from './pages/ThemeFinder';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import AdminPanel from './pages/Admin/AdminPanel';
import Leaderboard from './pages/Leaderboard';
import ReferralDashboard from './pages/ReferralDashboard';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import { WalletProvider } from './context/WalletContext';
import { SocialProvider } from './context/SocialContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Artwork, Collection } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'market' | 'vault' | 'detail' | 'studio' | 'profile' | 'tools' | 'finder' | 'collections' | 'collection_detail' | 'admin' | 'leaderboard' | 'referral' | 'dashboard' | 'shop'>('home');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const handleNavigate = (page: 'home' | 'market' | 'vault' | 'studio' | 'profile' | 'tools' | 'finder' | 'collections' | 'admin' | 'leaderboard' | 'referral' | 'dashboard' | 'shop') => {
    setCurrentPage(page);
    (window as any).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setCurrentPage('detail');
    (window as any).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setCurrentPage('collection_detail');
    (window as any).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMarket = () => {
    setCurrentPage('market');
    (window as any).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCollections = () => {
    setCurrentPage('collections');
    (window as any).scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return <AdminPanel onExit={() => handleNavigate('home')} />;
  }

  return (
    <div className="min-h-screen text-white relative">
      <GridBackground />

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Home
                onNavigateToMarket={() => handleNavigate('market')}
                onSelectArtwork={handleSelectArtwork}
              />
            </motion.div>
          )}

          {currentPage === 'market' && (
            <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Marketplace onSelectArtwork={handleSelectArtwork} />
            </motion.div>
          )}

          {currentPage === 'collections' && (
            <motion.div key="collections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Collections onSelectCollection={handleSelectCollection} />
            </motion.div>
          )}

          {currentPage === 'collection_detail' && selectedCollection && (
            <motion.div key="collection_detail">
              <CollectionDetail
                collection={selectedCollection}
                onBack={handleBackToCollections}
                onSelectArtwork={handleSelectArtwork}
              />
            </motion.div>
          )}

          {currentPage === 'finder' && (
            <motion.div key="finder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ThemeFinder />
            </motion.div>
          )}

          {currentPage === 'detail' && selectedArtwork && (
            <motion.div key="detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <ItemDetail artwork={selectedArtwork} onBack={handleBackToMarket} />
            </motion.div>
          )}

          {currentPage === 'vault' && (
            <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProtectedRoute>
                <Vault />
              </ProtectedRoute>
            </motion.div>
          )}

          {currentPage === 'studio' && (
            <motion.div key="studio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProtectedRoute>
                <Studio />
              </ProtectedRoute>
            </motion.div>
          )}

          {currentPage === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProtectedRoute>
                <Profile onNavigateToUpload={() => handleNavigate('studio')} onSelectArtwork={handleSelectArtwork} />
              </ProtectedRoute>
            </motion.div>
          )}

          {currentPage === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Tools />
            </motion.div>
          )}

          {currentPage === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Leaderboard />
            </motion.div>
          )}

          {currentPage === 'referral' && (
            <motion.div key="referral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ReferralDashboard />
            </motion.div>
          )}

          {currentPage === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </motion.div>
          )}

          {currentPage === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Shop />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 border-t border-white/5 relative z-10 glass mt-20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">SC</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                STEAM<span className="text-[#00f2ff]">CANVAS</span>
              </span>
            </div>
            <p className="text-white/40 max-sm">
              SteamCanvas is the leading marketplace for high-fidelity Steam profile customization. Founded in 2025, we empower creators and elevate profile aesthetics.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Marketplace</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li onClick={() => handleNavigate('collections')} className="hover:text-[#00f2ff] cursor-pointer">Community Collections</li>
              <li className="hover:text-[#00f2ff] cursor-pointer">Workshop Showcases</li>
              <li className="hover:text-[#00f2ff] cursor-pointer">Avatar Frames</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Support</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li onClick={() => handleNavigate('referral')} className="hover:text-[#FFD700] cursor-pointer">Referral Program 🪙</li>
              <li className="hover:text-[#00f2ff] cursor-pointer">Artist Center</li>
              <li className="hover:text-[#00f2ff] cursor-pointer">Community Guidelines</li>
              {/* Secret Admin Entry in Footer for testers */}
              <li onClick={() => handleNavigate('admin')} className="hover:text-[#7000ff] cursor-pointer font-black text-[10px] opacity-10">ADMIN_CMD</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>© 2025 SteamCanvas Marketplace. Not affiliated with Valve Corporation.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocialProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </SocialProvider>
    </AuthProvider>
  );
};

export default App;
