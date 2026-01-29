import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SteamLoginButton from './SteamLoginButton';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#00f2ff] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-6 pt-20">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white/30" />
                </div>
                <div className="text-center space-y-2 max-w-md px-6">
                    <h1 className="text-3xl font-display font-bold">Access Restricted</h1>
                    <p className="text-white/40">You must be logged in with Steam to view this protected zone.</p>
                </div>
                <SteamLoginButton />
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
