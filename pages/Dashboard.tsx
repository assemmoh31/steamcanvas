import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);

    useEffect(() => {
        // Check for payment query params
        const params = new URLSearchParams(window.location.search);
        const payment = params.get('payment');

        if (payment === 'success') {
            setPaymentStatus('success');
            // Refresh user data to get new balance
            refreshUser();
            // Clear query param
            window.history.replaceState({}, '', window.location.pathname);
        } else if (payment === 'cancelled') {
            setPaymentStatus('cancelled');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [refreshUser]);

    return (
        <div className="pt-24 pb-12 container mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-display font-bold">Dashboard</h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Wallet className="w-4 h-4 text-[#00f2ff]" />
                        <span className="font-mono text-[#00f2ff]">
                            {user?.walletBalance?.toFixed(2) || '0.00'} CREDITS
                        </span>
                    </div>
                </div>

                {paymentStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <div>
                            <p className="font-bold">Payment Successful!</p>
                            <p className="text-sm opacity-80">Your credits have been added to your wallet.</p>
                        </div>
                    </motion.div>
                )}

                {paymentStatus === 'cancelled' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                    >
                        <XCircle className="w-5 h-5" />
                        <div>
                            <p className="font-bold">Payment Cancelled</p>
                            <p className="text-sm opacity-80">No charges were made.</p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <h2 className="text-xl font-bold mb-4">Account Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/60">Username</span>
                                <span>{user?.displayName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/60">Steam ID</span>
                                <span className="font-mono text-xs">{user?.steamId}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/60">Artist Level</span>
                                <span>Level {user?.artistLevel}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default Dashboard;
