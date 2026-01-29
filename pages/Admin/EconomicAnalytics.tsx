
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  TrendingUp,
  Activity,
  History,
  Info
} from 'lucide-react';

const EconomicAnalytics: React.FC = () => {
  // Mock data for the chart
  const revenueData = [12, 18, 15, 22, 30, 25, 35, 28, 42, 38];
  
  const stats = [
    { label: 'Vault Revenue (24h)', value: '18,450', change: '+12%', isUp: true, color: '#00f2ff' },
    { label: 'Platform Fees (15%)', value: '2,767', change: '+15%', isUp: true, color: '#7000ff' },
    { label: 'Escrow Holdings', value: '42,900', change: '-2%', isUp: false, color: '#FFD700' },
    { label: 'Active Trade Units', value: '154', change: '+5%', isUp: true, color: '#10b981' }
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Vault <span className="text-white/40">Pulse</span></h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.4em] font-black mt-2">Economic Telemetry: Stream_Active</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 glass border-white/5 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 hover:bg-white/5">
              <History size={12} /> Full Audit Log
           </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 rounded-full" style={{ backgroundColor: stat.color }} />
             <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                   {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   {stat.change}
                </div>
             </div>
             <div className="flex items-end gap-3">
                <span className="text-3xl font-display font-black text-white">{stat.value}</span>
                <span className="text-xs font-bold text-white/20 uppercase pb-1.5">Credits</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 glass rounded-[3.5rem] p-12 border border-white/5 space-y-10 relative overflow-hidden">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Marketplace Velocity</h3>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Transaction Volume History (Last 10 Cycles)</p>
              </div>
              <TrendingUp className="text-[#7000ff]" size={24} />
           </div>

           {/* Custom Neon SVG Chart */}
           <div className="h-64 w-full relative">
              <svg className="w-full h-full overflow-visible">
                 <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#7000ff" stopOpacity="0.4" />
                       <stop offset="100%" stopColor="#7000ff" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 {/* Area fill */}
                 <path
                    d={`M 0 256 ${revenueData.map((d, i) => `L ${(i / (revenueData.length - 1)) * 100}% ${256 - (d * 5)}`).join(' ')} L 100% 256 Z`}
                    fill="url(#chartGradient)"
                 />
                 {/* Line */}
                 <path
                    d={`M 0 ${256 - (revenueData[0] * 5)} ${revenueData.map((d, i) => `L ${(i / (revenueData.length - 1)) * 100}% ${256 - (d * 5)}`).join(' ')}`}
                    fill="none"
                    stroke="#7000ff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shadow-[0_0_15px_rgba(112,0,255,0.5)]"
                 />
                 {/* Points */}
                 {revenueData.map((d, i) => (
                    <circle 
                       key={i} 
                       cx={`${(i / (revenueData.length - 1)) * 100}%`} 
                       cy={256 - (d * 5)} 
                       r="4" 
                       fill="#050505" 
                       stroke="#7000ff" 
                       strokeWidth="2" 
                    />
                 ))}
              </svg>
           </div>
           
           <div className="flex justify-between px-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
              <span>Cycle_01</span>
              <span>Cycle_05</span>
              <span>Cycle_10</span>
           </div>
        </div>

        {/* Escrow Module */}
        <div className="glass rounded-[3.5rem] p-10 border border-[#FFD700]/20 bg-[#FFD700]/5 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[60px] rounded-full" />
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center border border-[#FFD700]/30">
                 <ShieldAlert className="text-[#FFD700]" size={24} />
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Escrow Lock</h3>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span>Average Safety Window</span>
                    <span className="text-[#FFD700]">24.0 Hours</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-gradient-to-r from-[#FFD700] to-orange-500" />
                 </div>
              </div>

              <div className="p-5 glass border-white/5 rounded-2xl space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Flagged Transactions</span>
                    <span className="text-xs font-bold text-red-500">2 Units</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Auto-Released (1h)</span>
                    <span className="text-xs font-bold text-white/80">12 Units</span>
                 </div>
              </div>
           </div>

           <button className="w-full py-4 glass border-[#FFD700]/30 text-[#FFD700] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FFD700]/10 transition-all">
              Force Escrow Flush
           </button>
        </div>
      </div>
    </div>
  );
};

export default EconomicAnalytics;
