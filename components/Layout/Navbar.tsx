
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ShoppingBag, User, PlusCircle, Plus, Wrench, Search, Layers, Trophy, Gift } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import SteamLoginButton from '../Common/SteamLoginButton';

interface NavbarProps {
  onNavigate: (page: 'home' | 'market' | 'vault' | 'studio' | 'profile' | 'tools' | 'finder' | 'collections' | 'leaderboard' | 'referral' | 'dashboard' | 'shop') => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { balance } = useWallet();
  const { user, loading } = useAuth();

  const displayBalance = user ? user.walletBalance : balance;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass border-b border-white/5 mx-4 mt-4 rounded-2xl">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => onNavigate('home')}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-shadow">
          <ShoppingBag className="text-white w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
          STEAM<span className="text-[#00f2ff]">CANVAS</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 font-medium text-white/70">
        {[
          { id: 'home', label: 'Discovery' },
          { id: 'market', label: 'Marketplace' },
          { id: 'vault', label: 'My Vault', icon: Layers },
          { id: 'collections', label: 'Collections', icon: Layers },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'referral', label: 'Referrals', icon: Gift },
          { id: 'finder', label: 'Theme Finder', icon: Search },
          { id: 'tools', label: 'Tools', icon: Wrench },
          // Admin Gate
          // ...(user?.steamId === '76561199401459158' ? [{ id: 'dashboard', label: 'Command Center', icon: Layers }] : [])
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            className={`flex items-center gap-2 hover:text-white transition-colors relative py-1 ${currentPage === item.id || (currentPage === 'collection_detail' && item.id === 'collections') ? 'text-white' : ''}`}
          >
            {item.icon && <item.icon className={`w-4 h-4 ${item.id === 'referral' ? 'text-[#FFD700]' : ''}`} />}
            {item.label}
            {(currentPage === item.id || (currentPage === 'collection_detail' && item.id === 'collections')) && (
              <motion.div
                layoutId="nav-underline"
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${item.id === 'referral' ? 'bg-[#FFD700]' : 'bg-[#00f2ff]'}`}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <motion.div
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl pointer-events-auto cursor-pointer hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Coins className="text-[#FFD700] w-5 h-5" />
          </motion.div>
          <span className="font-bold text-[#FFD700]">{displayBalance.toLocaleString()}</span>
          <PlusCircle className="text-white/40 w-4 h-4" />
        </motion.div>

        <motion.button
          onClick={() => onNavigate('studio')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border ${currentPage === 'studio'
            ? 'bg-[#00f2ff] text-black border-[#00f2ff]'
            : 'border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-black'
            }`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </motion.button>

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse border border-white/10" />
        ) : user ? (
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white group-hover:text-[#00f2ff] transition-colors">{user.displayName}</div>
              <div className="text-xs text-white/50">Level {user.artistLevel}</div>
            </div>
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${currentPage === 'profile' ? 'border-[#00f2ff]' : 'border-white/20 group-hover:border-[#00f2ff]/50'
                }`}
            />
          </div>
        ) : (
          <SteamLoginButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
