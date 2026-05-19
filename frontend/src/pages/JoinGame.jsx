import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui/Components';
import { Hash, ArrowRight, LogOut, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const JoinGame = () => {
    const [roomCode, setRoomCode] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomCode.trim()) {
            navigate(`/play/${roomCode}?userId=${username}`);
        } else {
            toast("Please enter a room code", "error");
        }
    };

    const handleLogout = () => {
        api.logout();
        toast("Logged out successfully", "info");
        navigate('/login');
    };

    return (
        <div className="h-screen bg-[#000000] text-white font-sans selection:bg-[#F25623]/30 flex flex-col items-center overflow-hidden">
            {/* The 5xl Window with Borders */}
            <div className="w-full max-w-5xl h-screen flex flex-col border-x border-[#1F1F1F] relative shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#050505]">
                
                {/* Navbar */}
                <header className="w-full h-16 border-b border-[#1F1F1F] flex items-center justify-between px-8 bg-[#050505] z-20 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="font-display text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#F25623] fill-current" />
                            QuizPulse
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#000000] border border-[#1F1F1F] rounded-[6px]">
                            <div className="w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                                <User className="w-2.5 h-2.5 text-[#A3A3A3]" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{username}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#A3A3A3] hover:text-red-400">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-y-auto custom-scrollbar">
                    {/* Abstract background elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F25623]/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[440px] z-10"
                    >
                        <div className="mb-6 text-center">
                            <div className="inline-block mb-4 px-3 py-1 bg-[#F25623]/10 border border-[#F25623]/20 rounded-full text-[9px] font-bold text-[#F25623] uppercase tracking-widest">
                                Ready to Play
                            </div>
                            <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
                                Join a <span className="text-[#F25623]">Quiz.</span>
                            </h2>
                            <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                                Enter the 6-digit room code shared by your quiz host.
                            </p>
                        </div>

                        <div className="glass-card p-6 md:p-8 rounded-xl border-[#1F1F1F] relative bg-[#000000]/80 backdrop-blur-md shadow-2xl">
                            <form onSubmit={handleJoin} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-2 block ml-1 text-center">Room Code</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Hash className="w-4 h-4 text-[#A3A3A3] group-focus-within:text-[#F25623] transition-colors" />
                                            </div>
                                            <Input
                                                placeholder="000000"
                                                value={roomCode}
                                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                                className="pl-12 h-14 text-center text-xl tracking-[0.4em] font-display font-bold bg-[#050505] border-[#1F1F1F] focus:border-[#F25623]/40 rounded-[6px]"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-white text-black hover:bg-white/90 shadow-2xl flex items-center justify-center gap-3 rounded-[6px] font-bold text-xs mt-2"
                                    disabled={!roomCode}
                                >
                                    Join Quiz <ArrowRight className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="w-full border-t border-[#1F1F1F] py-4 px-8 flex flex-col md:flex-row items-center justify-between bg-[#050505] text-[10px] font-bold text-[#A3A3A3]/50 uppercase tracking-widest z-20 flex-shrink-0">
                    <p>© 2026 QuizPulse.</p>
                    <div className="flex gap-6 mt-2 md:mt-0">
                        <span>Help</span>
                        <span>Support</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default JoinGame;
