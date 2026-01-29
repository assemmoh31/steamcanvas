
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Zap, Upload, CheckCircle2 } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocial();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use (window as any).document and type casting to satisfy compiler without DOM lib
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setIsOpen(false);
      }
    };
    (window as any).document.addEventListener('mousedown', handleClickOutside);
    return () => (window as any).document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={unreadCount > 0 ? { y: [0, -2, 0] } : {}}
        transition={unreadCount > 0 ? { duration: 0.5, repeat: Infinity, repeatDelay: 3 } : {}}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all ${
          isOpen ? 'bg-[#00f2ff]/10 border-[#00f2ff]/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
        } relative`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#00f2ff]' : 'text-white/70'}`} />
        
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-[#050505] flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)]"
          >
            <span className="text-[8px] font-black text-white">{unreadCount}</span>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-80 glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Neural Uplinks</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-5 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-white/[0.02]' : ''}`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00f2ff] rounded-full blur-[1px]" />
                    )}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                      <img src={notif.artistAvatar} className="w-full h-full object-cover" />
                      <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-0.5 border border-white/10">
                        {notif.type === 'upload' ? <Upload size={8} className="text-[#00f2ff]" /> : <Zap size={8} className="text-[#FFD700]" />}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-white leading-snug">
                        <span className="font-black text-[#00f2ff]">@{notif.artistName}</span> {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(notif.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                    <CheckCircle2 className="w-6 h-6 text-white/10" />
                  </div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No New Uplinks</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                <button className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors">
                  View Full History
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
