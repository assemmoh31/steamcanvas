
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Award, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  User,
  History,
  AlertTriangle
} from 'lucide-react';
import ArtistRankBadge from '../../components/Profile/ArtistRankBadge';

const VerificationManager: React.FC = () => {
  const [pendingVerifications] = useState([
    { id: 'v1', artist: 'CyberSage', sales: 112000, profileUrl: 'https://steamcommunity.com/id/cybersage', status: 'pending_milestone' },
    { id: 'v2', artist: 'RetroVibes', sales: 42000, profileUrl: 'https://steamcommunity.com/id/retrovibes', status: 'pending_id' },
    { id: 'v3', artist: 'TechLord', sales: 260000, profileUrl: 'https://steamcommunity.com/id/techlord', status: 'pending_milestone' }
  ]);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Rank <span className="text-white/40">Authority</span></h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.4em] font-black mt-2">Milestone Verifications: Stream_Locked</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {pendingVerifications.map((v) => (
             <div key={v.id} className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 group hover:border-[#7000ff]/30 transition-all">
                <div className="flex items-center gap-6 shrink-0">
                   <div className="w-16 h-16 rounded-full border-2 border-[#7000ff] p-1 bg-black/40">
                      <img src={`https://picsum.photos/seed/${v.artist}/100/100`} className="w-full h-full rounded-full object-cover" />
                   </div>
                   <div>
                      <h4 className="text-xl font-display font-black text-white uppercase">@{v.artist}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <ArtistRankBadge sales={v.sales} size="sm" />
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{v.sales.toLocaleString()} Sold</span>
                      </div>
                   </div>
                </div>

                <div className="flex-grow space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">Proof_Review</div>
                      <a href={v.profileUrl} target="_blank" className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest flex items-center gap-1 hover:underline">
                         Steam Profile <ExternalLink size={10} />
                      </a>
                   </div>
                   <p className="text-xs text-white/60 font-medium">Artist has crossed the {v.sales >= 100000 ? '100K' : '10K'} milestone and requested verification.</p>
                </div>

                <div className="flex gap-3">
                   <button className="px-6 py-4 bg-[#7000ff] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg">Verify Unit</button>
                   <button className="p-4 glass border-white/5 text-white/30 hover:text-white rounded-xl transition-all"><ChevronRight size={18} /></button>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border border-[#7000ff]/20 bg-[#7000ff]/5 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/5 blur-[60px] rounded-full" />
              <div className="flex items-center gap-4">
                 <Zap className="text-[#7000ff]" size={24} />
                 <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Manual Override</h3>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Identify User Unit</label>
                    <input type="text" placeholder="SteamID64 / Username" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#7000ff] transition-all font-bold text-white shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Override Level (1-5)</label>
                    <div className="grid grid-cols-5 gap-2">
                       {[1,2,3,4,5].map(lvl => (
                         <button key={lvl} className="py-3 rounded-xl glass border-white/5 text-xs font-black hover:bg-[#7000ff] hover:text-white transition-all">{lvl}</button>
                       ))}
                    </div>
                 </div>
              </div>
              <button className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl">Apply Master Sync</button>
           </div>

           <div className="p-8 glass rounded-[2.5rem] border border-orange-500/20 bg-orange-500/5 flex items-start gap-4">
              <AlertTriangle className="text-orange-500 shrink-0" size={20} />
              <div className="space-y-1">
                 <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Compliance Protocol</h4>
                 <p className="text-[9px] text-white/40 leading-relaxed uppercase font-bold tracking-widest">Manual overrides bypass milestone telemetry. Use strictly for partner onboarding or incident remediation.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationManager;
