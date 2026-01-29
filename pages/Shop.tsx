
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Check, Zap, Crown, Shield, Star, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SHOP_TIERS = [
    {
        id: 'starter',
        name: 'Starter',
        credits: 500,
        price: '$5.00',
        color: '#CD7F32',
        glowColor: 'rgba(205, 127, 50, 0.4)',
        benefits: ['500 Canvas Credits', 'Standard Support', 'Profile Badge (Bronze)'],
        icon: Shield
    },
    {
        id: 'pro',
        name: 'Pro',
        credits: 1200,
        price: '$10.00',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.4)',
        benefits: ['1,200 Canvas Credits', 'Priority Support', 'Exclusive Silver Badge', '10% Artist Referral Bonus'],
        icon: Star
    },
    {
        id: 'elite',
        name: 'Elite',
        credits: 3000,
        price: '$20.00',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.4)',
        benefits: ['3,000 Canvas Credits', '24/7 VIP Support', 'Animated Gold Badge', 'Early Access to New Drops', 'Feature on Home Page'],
        icon: Crown
    }
];

const Shop: React.FC = () => {
    const { user } = useAuth();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Check for successful payment from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setMessage({ type: 'success', text: 'Payment successful! Your credits have been added.' });
            // Clear URL param
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('payment') === 'cancelled') {
            setMessage({ type: 'error', text: 'Payment cancelled.' });
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);


    const handleBuyNow = async (tierId: string) => {
        if (!user) {
            // Should be protected by Route but just in case
            return alert("Please login first");
        }

        setLoadingTier(tierId);
        setMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Assuming AuthContext attaches credentials/cookie automatically or we need credentials: include
                },
                // We need credentials execution for passport session
                credentials: 'include',
                body: JSON.stringify({ tierId })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Purchase error:', error);
            setMessage({ type: 'error', text: 'Failed to initiate purchase. Please try again.' });
            setLoadingTier(null);
        }
    };

    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <header className="text-center mb-16 space-y-4">
                <h1 className="text-5xl font-display font-extrabold mb-4">CREDIT SHOP</h1>
                <p className="text-white/50 text-xl max-w-2xl mx-auto">
                    Purchase Canvas Credits to unlock exclusive artworks and customizations.
                </p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-block px-6 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SHOP_TIERS.map((tier) => (
                    <motion.div
                        key={tier.id}
                        whileHover={{ y: -10 }}
                        className="relative glass rounded-[2.5rem] p-10 border border-white/5 flex flex-col items-center text-center overflow-hidden group transition-all duration-500"
                        style={{
                            boxShadow: `0 20px 50px -12px ${tier.glowColor}`
                        }}
                    >
                        {/* Glow effect */}
                        <div
                            className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-30 transition-opacity group-hover:opacity-50"
                            style={{ backgroundColor: tier.color }}
                        />

                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-500"
                            style={{ backgroundColor: `${tier.color}20`, border: `1px solid ${tier.color}40` }}
                        >
                            <tier.icon style={{ color: tier.color }} className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-display font-bold mb-1" style={{ color: tier.color }}>{tier.name}</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <Coins className="text-[#FFD700] w-5 h-5" />
                            <span className="text-4xl font-extrabold text-white">{tier.credits.toLocaleString()}</span>
                        </div>

                        <p className="text-5xl font-display font-black mb-8">{tier.price}</p>

                        <ul className="space-y-4 mb-10 text-left w-full flex-grow">
                            {tier.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                                    <div className="bg-white/10 rounded-full p-1">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBuyNow(tier.id)}
                            disabled={!!loadingTier}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-[#00f2ff] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-colors`}
                        >
                            {loadingTier === tier.id ? (
                                <Loader className="animate-spin w-5 h-5" />
                            ) : (
                                'Buy Now'
                            )}
                        </motion.button>

                        {tier.id === 'elite' && (
                            <div className="absolute top-6 right-6 bg-[#FFD700] text-black font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                Most Popular
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 p-10 glass rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 rounded-full bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/30 flex-shrink-0">
                    <Zap className="w-10 h-10 text-[#00f2ff]" />
                </div>
                <div className="flex-grow space-y-2">
                    <h3 className="text-2xl font-bold">Artist Partnership Program</h3>
                    <p className="text-white/50">Are you a designer? Apply for our verified artist program and start earning credits for every purchase of your artwork. Join over 200+ artists worldwide.</p>
                </div>
                <button className="px-8 py-4 glass border border-white/10 rounded-2xl font-bold hover:bg-white/5 transition-colors whitespace-nowrap">
                    Apply Now
                </button>
            </div>
        </div>
    );
};

export default Shop;
