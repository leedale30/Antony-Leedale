
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { IconKey, IconRocket } from './Icons';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setError('');

        const success = await authService.login(password);
        
        if (success) {
            onLoginSuccess();
        } else {
            setError('Invalid Access Code');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-50">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 w-full max-w-md mx-4 shadow-2xl bg-black/40 backdrop-blur-xl animate-fade-in relative overflow-hidden">
                
                {/* Decorative Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gem-blue to-transparent"></div>
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                        <span className="text-3xl animate-pulse">🔒</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">SUIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-gem-blue to-gem-purple">Smart Hub</span></h1>
                    <p className="text-gray-400 text-sm tracking-wide">SECURE ACCESS REQUIRED</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gem-blue uppercase tracking-widest ml-1">Access Code</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-gray-600 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-gem-blue focus:ring-1 focus:ring-gem-blue/50 outline-none transition-all text-lg tracking-widest"
                                placeholder="••••••••"
                                autoFocus
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <IconKey />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-bold animate-pulse">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-gem-blue to-gem-purple text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-gem-blue/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="tracking-wide">AUTHENTICATING...</span>
                            </>
                        ) : (
                            <>
                                <span className="tracking-wide">ENTER SYSTEM</span>
                                <span className="group-hover:translate-x-1 transition-transform"><IconRocket /></span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};
