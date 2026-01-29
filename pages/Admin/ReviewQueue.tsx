import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Layers,
  X,
  ShieldCheck,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { Artwork } from '../../types';
import SteamSimulator from '../../components/ItemDetail/SteamSimulator';

const ReviewQueue: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingArt, setPreviewingArt] = useState<Artwork | null>(null);

  const fetchQueue = async () => {
    try {
      // Fetch ONLY pending items (Admin Route)
      const res = await fetch('/api/admin/queue');
      const data = await res.json();
      if (res.ok) {
        setArtworks(data.queue);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/verify/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setArtworks(prev => prev.filter(a => a.id !== id));
        // @ts-ignore
        (window as any).alert("Artwork approved!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this artwork?")) return;

    try {
      const res = await fetch(`/api/admin/reject/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArtworks(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (ts?: string) => {
    if (!ts) return 'Just now';
    const date = new Date(ts);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Review <span className="text-white/40">Queue</span></h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.4em] font-black mt-2">Active Ingest Requests: {artworks.length}</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 glass border-white/5 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-[#7000ff]" /> Compliance OK
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-20 flex justify-center"><Loader className="animate-spin text-white/20" /></div>
      ) : (
        <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Artwork Unit</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Creator</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Timestamp</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Telemetry</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {artworks.map((art) => (
                <tr key={art.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={art.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{art.title}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{art.category || 'Artwork'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-white/30" />
                      <span className="text-xs font-bold text-white/80">
                        {/* @ts-ignore */}
                        @{art.artist?.displayName || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                      <Clock size={12} />
                      {/* @ts-ignore */}
                      {formatTime(art.createdAt)}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-4 bg-[#7000ff] rounded-full" />
                      <span className="text-[10px] font-bold text-[#7000ff] uppercase tracking-widest">
                        {/* @ts-ignore */}
                        {art.fileSize ? (art.fileSize / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setPreviewingArt(art)}
                        className="p-3 glass border-white/5 rounded-xl text-white/40 hover:text-white hover:border-[#7000ff]/30 transition-all group/btn"
                      >
                        <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleApprove(art.id)}
                        className="p-3 bg-green-500/10 rounded-xl text-green-500/40 hover:text-green-500 hover:bg-green-500/20 transition-all"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(art.id)}
                        className="p-3 bg-red-500/10 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {artworks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Layers className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Queue Cleared: No Pending Units</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {previewingArt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl bg-black/80"
          >
            <div className="container max-w-7xl h-full flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#7000ff]/10 rounded-2xl flex items-center justify-center border border-[#7000ff]/30">
                    <Eye size={24} className="text-[#7000ff]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Compliance Review</h2>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Inspecting Unit: {previewingArt.title}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewingArt(null)} className="p-4 glass rounded-2xl text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-start overflow-hidden">
                <div className="lg:col-span-8 h-full overflow-y-auto pr-4 scrollbar-hide">
                  <SteamSimulator artwork={previewingArt} previewImageUrl={previewingArt.imageUrl} />
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <div className="glass p-8 rounded-[3rem] border border-[#7000ff]/20 bg-[#7000ff]/5 space-y-6">
                    <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Review Checklist</h3>
                    <div className="space-y-4">
                      {[
                        "Resolution compliance (506px main)",
                        "Frame-rate optimization",
                        "Safe-content verification",
                        "No external watermarks"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-white/60 font-medium">
                          <div className="w-4 h-4 rounded border border-[#7000ff]/30 flex items-center justify-center"><CheckCircle size={10} className="text-[#7000ff]" /></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => { handleApprove(previewingArt.id); setPreviewingArt(null); }}
                        className="flex-grow py-4 bg-green-500 text-black font-black text-xs uppercase tracking-widest rounded-xl"
                      >
                        Confirm Access
                      </button>
                      <button
                        onClick={() => { handleReject(previewingArt.id); setPreviewingArt(null); }}
                        className="px-6 py-4 glass border-white/5 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className="p-6 glass border-orange-500/20 rounded-[2.5rem] bg-orange-500/5 flex items-start gap-4">
                    <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-relaxed">
                      Note: Rejecting will automatically generate a Neural Alert for the artist with the selected reason code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewQueue;
