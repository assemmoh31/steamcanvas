
import React from 'react';
import { 
  ShieldAlert, 
  BarChart3, 
  Layers, 
  Activity, 
  Users, 
  Lock, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

export type AdminModule = 'queue' | 'verification' | 'analytics' | 'tools' | 'moderation';

interface AdminSidebarProps {
  activeModule: AdminModule;
  onSelect: (module: AdminModule) => void;
  onExit: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeModule, onSelect, onExit }) => {
  const menuItems: { id: AdminModule; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Vault Pulse', icon: BarChart3 },
    { id: 'queue', label: 'Review Queue', icon: Layers },
    { id: 'verification', label: 'Identity/Rank', icon: CheckCircle2 },
    { id: 'tools', label: 'System Health', icon: Activity },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
  ];

  return (
    <div className="w-80 h-full glass border-r border-[#7000ff]/20 p-8 flex flex-col gap-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#7000ff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(112,0,255,0.4)]">
          <Lock className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter">Command</h2>
          <p className="text-[10px] font-black text-[#7000ff] uppercase tracking-[0.4em]">Center V2.0</p>
        </div>
      </div>

      <nav className="flex-grow space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden group ${
              activeModule === item.id 
                ? 'bg-[#7000ff]/10 text-white border border-[#7000ff]/30 shadow-[0_0_30px_rgba(112,0,255,0.1)]' 
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {activeModule === item.id && (
              <motion.div 
                layoutId="admin-nav-glow"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#7000ff] rounded-full blur-[2px]" 
              />
            )}
            <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-[#7000ff]' : ''}`} />
            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            {item.id === 'queue' && (
              <span className="ml-auto px-2 py-0.5 bg-red-500 rounded text-[9px] font-black text-white">2</span>
            )}
          </button>
        ))}
      </nav>

      <div className="space-y-4">
        <div className="p-5 glass border-white/5 rounded-2xl">
           <div className="flex items-center gap-3 mb-3">
              <History className="w-4 h-4 text-white/20" />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Session Status</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase">Secure_Node: Active</span>
           </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full py-4 glass border-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Command Center
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
