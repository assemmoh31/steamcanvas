import React from 'react';
import { LogIn } from 'lucide-react';

const SteamLoginButton: React.FC = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/api/auth/steam';
    };

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-6 py-2 bg-[#171a21] text-[#c5c3c0] font-bold rounded hover:bg-[#1b2838] hover:text-white transition-colors border border-[#c5c3c0]/20"
        >
            <LogIn className="w-5 h-5" />
            <span>Sign in with Steam</span>
        </button>
    );
};

export default SteamLoginButton;
