
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar, { AdminModule } from './AdminSidebar';
import ReviewQueue from './ReviewQueue';
import EconomicAnalytics from './EconomicAnalytics';
import VerificationManager from './VerificationManager';
import { AlertTriangle, Lock } from 'lucide-react';

const AdminPanel: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const handleExit = async () => {
    // 1. Kill the backend session cookie
    try {
      await fetch('/api/admin/logout-gate', { method: 'POST' });
    } catch (e) {
      console.error("Logout gate failed:", e);
    }

    // 2. Clear frontend state and exit
    setIsVerified(false);
    onExit();
  };
  const { isAdmin } = useAuth();
  const [activeModule, setActiveModule] = useState<AdminModule>('analytics');

  // RBAC done on backend now mostly, but keep basic steamId check
  if (!isAdmin) {
    // ... same denied view
  }

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Start locked by default
  const [isVerified, setIsVerified] = useState(false);

  // Check verification status via a dummy call on mount
  useEffect(() => {
    // If we are admin, try to fetch analytics/queue to see if we are verified (have cookie)
    if (isAdmin) {
      // Force check immediately
      fetch('/api/admin/queue')
        .then(res => {
          if (res.status === 401) {
            setShowSecurityModal(true);
            setIsVerified(false);
          } else {
            setIsVerified(true);
          }
        })
        .catch(() => {
          setShowSecurityModal(true);
          setIsVerified(false);
        });
    }
  }, [isAdmin]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsVerified(true);
        setShowSecurityModal(false);
        // Refresh modules
        setActiveModule('analytics');
      } else {
        setError('Access Denied: Invalid Security Credential');
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#050505] overflow-hidden relative">
      {/* Security Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500" />
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/30 mb-4">
                  <Lock className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Security Override</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Biometric Mismatch. Manual Passphrase Required.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="ENTER MASTER KEY"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-center tracking-[0.5em] font-black text-white outline-none focus:border-red-500 transition-all placeholder:text-white/10"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Authenticate'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminSidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        onExit={handleExit}
      />

      <main className="flex-grow overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(112,0,255,0.05),transparent_60%)]">
        <div className="p-12 container mx-auto">
          <AnimatePresence mode="wait">
            {!showSecurityModal && isVerified && (
              <>
                {activeModule === 'analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <EconomicAnalytics />
                  </motion.div>
                )}
                {activeModule === 'queue' && (
                  <motion.div key="queue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <ReviewQueue />
                  </motion.div>
                )}
                {activeModule === 'verification' && (
                  <motion.div key="verification" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <VerificationManager />
                  </motion.div>
                )}
                {['tools', 'moderation'].includes(activeModule) && (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-40">
                    <AlertTriangle className="w-16 h-16 text-[#7000ff] mb-6 animate-pulse" />
                    <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Module Sync Pending</h2>
                    <p className="text-white/30 text-xs uppercase tracking-[0.3em] mt-2">Connecting to Security Node...</p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
