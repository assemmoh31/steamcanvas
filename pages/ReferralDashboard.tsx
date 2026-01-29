
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  Coins, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ReferralRecord } from '../types';

const ReferralDashboard: React.FC = () => {
  const { triggerReferralBonus } = useWallet();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([
    { id: 'ref-1', username: 'PixelKnight', status: 'bonus_paid', joinDate: Date.now() - 86400000 * 5, revenueGenerated: 1250 },
    { id: 'ref-2', username: 'NeonSpecter', status: 'active', joinDate: Date.now() - 86400000 * 2, revenueGenerated: 0 },
    { id: 'ref-3', username: 'VaporHacker', status: 'pending', joinDate: Date.now() - 3600000 * 4, revenueGenerated: 0 },
  ]);

  const referralLink = `https://steamcanvas.com/join?ref=CyberSage_777`;

  const copyToClipboard = () => {
    // Access navigator via window as any to satisfy compiler and avoid WorkerNavigator conflict
    (window as any).navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = useMemo(() => ({
    totalReferrals: referrals.length,
    activeBonuses: referrals.filter(r => r.status === 'bonus_paid').length,
    totalEarned: referrals.filter(r => r.status === 'bonus_paid').length * 250,
  }), [referrals]);

  // Mock function to simulate a referred user purchasing credits
  const simulateReferralAction = (username: string) => {
    setReferrals(prev => prev.map(r => 
      r.username === username ? { ...r, status: 'bonus_paid', revenueGenerated: 500 } : r
    ));
    triggerReferralBonus(username);
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
      <header className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFD700]/5 blur-[120px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
            <Gift className="w-3.5 h-3.5" /> Affiliate Network Terminal
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 uppercase leading-tight">
            Share <span className="text-[#FFD700]">Gold</span>, <br /> Earn <span className="text-[#FFD700]">Credits</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold text-[10px]">
            Expand the network. Every successful node connection drops 250 credits.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Stats and Link */}
        <div className="lg:col-span-5 space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border border-[#FFD700]/20 bg-gradient-to-br from-[#FFD700]/5 to-transparent space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[60px] rounded-full" />
              
              <div>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Your Invite Node</h3>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Copy and broadcast to the community</p>
              </div>

              <div className="space-y-4">
                 <div className="relative group">
                    <input 
                      type="text" 
                      readOnly 
                      value={referralLink} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 outline-none font-bold text-white/70 text-sm shadow-inner"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 glass rounded-xl hover:bg-white/10 transition-all group-hover:border-[#FFD700]/30"
                    >
                      {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} className="text-[#FFD700]" />}
                    </button>
                 </div>
                 
                 <div className="flex gap-4">
                    <button className="flex-grow py-4 glass border-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                       <Share2 size={14} /> Global Link Share
                    </button>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
                 <div>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Referrals</p>
                    <p className="text-xl font-display font-black text-white">{stats.totalReferrals}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Bonuses</p>
                    <p className="text-xl font-display font-black text-green-500">{stats.activeBonuses}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Total 🪙</p>
                    <p className="text-xl font-display font-black text-[#FFD700]">{stats.totalEarned.toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Info className="text-[#00f2ff]" size={24} />
                 </div>
                 <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Reward Protocol</h3>
              </div>
              <ul className="space-y-4">
                 {[
                   { label: "Direct Referral", reward: "50 Credits", icon: Users },
                   { label: "Vault Purchase Bonus", reward: "250 Credits", icon: Coins },
                   { label: "Elite Artist Sync", reward: "500 Credits", icon: Zap }
                 ].map((item, i) => (
                   <li key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <item.icon size={14} className="text-white/30" />
                         </div>
                         <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#FFD700] uppercase">{item.reward}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Right: Referral Log */}
        <div className="lg:col-span-7 space-y-8">
           <header className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <TrendingUp size={18} className="text-[#FFD700]" />
                 <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Network Activity</h2>
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <Sparkles size={12} className="text-[#FFD700]" /> Real-time Node Status
              </div>
           </header>

           <div className="glass rounded-[3.5rem] border border-white/5 overflow-hidden">
              <div className="p-8 space-y-4">
                 {referrals.map((ref) => (
                   <motion.div 
                    key={ref.id}
                    layout
                    className={`glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 group transition-all ${ref.status === 'bonus_paid' ? 'bg-[#FFD700]/5 border-[#FFD700]/20' : ''}`}
                   >
                      <div className="flex items-center gap-4 md:w-1/3">
                         <div className="w-14 h-14 rounded-full border border-white/10 p-1 bg-black/40">
                            <img src={`https://picsum.photos/seed/${ref.username}/100/100`} className="w-full h-full rounded-full object-cover" />
                         </div>
                         <div>
                            <h4 className="font-bold text-white">@{ref.username}</h4>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Joined {new Date(ref.joinDate).toLocaleDateString()}</p>
                         </div>
                      </div>

                      <div className="flex-grow grid grid-cols-2 gap-8 w-full md:w-auto items-center">
                         <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${ref.status === 'bonus_paid' ? 'bg-green-500' : ref.status === 'active' ? 'bg-[#00f2ff] animate-pulse' : 'bg-white/20'}`} />
                               <span className={`text-[10px] font-bold uppercase tracking-widest ${ref.status === 'bonus_paid' ? 'text-green-500' : 'text-white/60'}`}>{ref.status.replace('_', ' ')}</span>
                            </div>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Net Earnings</p>
                            <div className="flex items-center gap-2">
                               <Coins size={12} className="text-[#FFD700]" />
                               <span className="font-bold text-white tabular-nums">{ref.revenueGenerated}</span>
                            </div>
                         </div>
                      </div>

                      <div className="w-full md:w-auto">
                         {ref.status !== 'bonus_paid' ? (
                           <button 
                            onClick={() => simulateReferralAction(ref.username)}
                            className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all flex items-center justify-center gap-2 group-hover:border-[#FFD700]/30"
                           >
                             Simulate Purchase <ArrowRight size={12} />
                           </button>
                         ) : (
                           <div className="px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-widest">
                             <CheckCircle2 size={12} /> Bonus Paid
                           </div>
                         )}
                      </div>
                   </motion.div>
                 ))}
                 {referrals.length === 0 && (
                   <div className="text-center py-20">
                      <Users className="w-16 h-16 text-white/5 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Node Registry Empty</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-10 glass rounded-[3.5rem] border border-[#00f2ff]/20 bg-[#00f2ff]/5 flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/30 shrink-0">
                 <Zap className="text-[#00f2ff]" size={32} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">Accelerator Active</h4>
                 <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                   You are currently in the <span className="text-[#00f2ff]">Bronze Tier</span> referral loop. Refer 5 more users to unlock the <span className="text-[#7000ff]">Silver 1.5x Multiplier</span>.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
