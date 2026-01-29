import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-gradient-to-br from-black via-[#050505] to-black">
                    <div className="absolute inset-0 bg-[#00f2ff]/5 mix-blend-overlay pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass max-w-xl w-full rounded-[3.5rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden text-center space-y-8"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-[#7000ff] to-red-500" />

                        <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-500/20 group">
                            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">System <span className="text-red-500">Fracture</span></h1>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Error Code: STACK_COLLAPSE_0xAF</p>
                            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                                The neural interface encountered a critical corruption in the visual buffer.
                                Emergency protocols have been engaged.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left font-mono text-[10px] text-red-400/70 truncate">
                            {this.state.error?.message}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#00f2ff] transition-all shadow-xl"
                        >
                            <RefreshCcw className="w-4 h-4" /> Re-Initialize Session
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
