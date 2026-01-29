
import React from 'react';
import { Info, Share2, Settings, MoreHorizontal } from 'lucide-react';
import { Artwork } from '../../types';
import ArtistRankBadge from '../Profile/ArtistRankBadge';
import FollowButton from '../Social/FollowButton';

interface SteamSimulatorProps {
  artwork?: Partial<Artwork>;
  previewImageUrl?: string;
}

const SteamSimulator: React.FC<SteamSimulatorProps> = ({ artwork, previewImageUrl }) => {
  const displayImageUrl = previewImageUrl || artwork?.imageUrl || 'https://via.placeholder.com/800x1000?text=Artwork+Preview';
  
  return (
    <div className="w-full max-w-5xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Header Bar */}
      <div className="bg-[#171a21] p-3 border-b border-black flex items-center justify-between text-[#8f98a0] text-sm">
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer">Store</span>
          <span className="text-white border-b-2 border-[#1a9fff] pb-1 cursor-pointer">Community</span>
          <span className="hover:text-white cursor-pointer">User</span>
          <span className="hover:text-white cursor-pointer">Chat</span>
        </div>
        <div className="flex gap-4 items-center">
          <Share2 className="w-4 h-4 hover:text-white cursor-pointer" />
          <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-[#1b2838] p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0 opacity-20 blur-3xl scale-150 pointer-events-none">
          <img src={displayImageUrl} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 w-40 h-40 flex-shrink-0">
          <div className="w-full h-full p-1 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-sm">
             <div className="w-full h-full bg-[#1b2838] p-1">
                <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>

        <div className="relative z-10 flex-grow pt-4">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">CyberExplorer</h1>
            <ArtistRankBadge sales={artwork?.artistSales || 0} size="sm" />
            <FollowButton artistName={artwork?.artist || "Unknown"} className="ml-2 scale-90" />
          </div>
          <div className="flex items-center gap-4 text-[#8f98a0]">
            <span className="text-white">Level 42</span>
            <div className="flex items-center gap-1">
              <img src="https://community.cloudflare.steamstatic.com/public/images/badges/01_community/community01_54.png" className="w-6 h-6" />
              <span>Badge Collector</span>
            </div>
          </div>
          <p className="mt-4 text-[#8f98a0] max-w-lg italic">
            "Testing the new {artwork?.title || 'artwork'} on my profile. Looks amazing!"
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-2 pt-4">
          <button className="bg-[#5c7e10] hover:bg-[#6c9412] text-white px-8 py-2 rounded-sm shadow-inner shadow-white/10 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0f1115] p-6 flex flex-col md:flex-row gap-6">
        {/* Artwork Showcase */}
        <div className="flex-grow space-y-4">
          <div className="bg-[#161a20]/80 p-4 border-l-4 border-[#1a9fff] flex items-center justify-between">
            <span className="text-[#ebebeb] font-medium uppercase tracking-wider text-xs">Artwork Showcase</span>
            <Info className="w-4 h-4 text-[#8f98a0]" />
          </div>

          <div className="flex gap-2 h-[600px]">
            <div className="flex-grow h-full rounded-sm overflow-hidden border border-white/5 relative group">
              <img src={displayImageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="w-24 h-full flex flex-col gap-2">
               <div className="flex-grow bg-[#161a20] rounded-sm overflow-hidden border border-white/5">
                 <img src={displayImageUrl} className="w-full h-full object-cover object-right" />
               </div>
               <div className="h-24 bg-[#161a20] rounded-sm overflow-hidden border border-white/5 flex items-center justify-center text-[#8f98a0]">
                 <MoreHorizontal className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
           <div className="space-y-3">
              <h4 className="text-[#ebebeb] uppercase text-xs tracking-widest border-b border-white/10 pb-2">Recent Activity</h4>
              <div className="text-xs text-[#8f98a0]">
                <p><span className="text-white">1,245</span> items owned</p>
                <p><span className="text-white">42</span> badges collected</p>
                <p><span className="text-white">9,540</span> trades made</p>
              </div>
           </div>
           
           <div className="space-y-2">
              <div className="bg-[#1b2838] p-2 flex items-center gap-3 border border-white/5 group cursor-pointer hover:bg-white/5 transition-colors">
                 <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <img src="https://picsum.photos/seed/game1/50/50" />
                 </div>
                 <div className="text-[10px]">
                    <p className="text-white font-bold group-hover:text-[#1a9fff]">Counter-Strike 2</p>
                    <p className="text-[#8f98a0]">1,450 hrs on record</p>
                 </div>
              </div>
              <div className="bg-[#1b2838] p-2 flex items-center gap-3 border border-white/5 group cursor-pointer hover:bg-white/5 transition-colors">
                 <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <img src="https://picsum.photos/seed/game2/50/50" />
                 </div>
                 <div className="text-[10px]">
                    <p className="text-white font-bold group-hover:text-[#1a9fff]">Dota 2</p>
                    <p className="text-[#8f98a0]">3,200 hrs on record</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SteamSimulator;
