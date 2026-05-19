import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Play, Users, StopCircle, 
    CheckCircle2, Activity, Globe, 
    LayoutDashboard, ArrowLeft, Trophy, Zap
} from 'lucide-react';
import { Button, Badge } from '@/components/ui/Components';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const HostView = ({ gameState, sendAction, roomCode }) => {
    const { status, participants, leaderboard } = gameState;
    const navigate = useNavigate();

    const handleStartGame = () => sendAction('start_game', {});
    const handleForceSubmit = () => {
        if (confirm("End test for all users? This will force submit everyone.")) {
            sendAction('force_submit', {});
        }
    };

    const stats = useMemo(() => {
        if (!participants) return { answered: 0, completed: 0, total: 0 };
        const completed = participants.filter(p => p.completed).length;
        const total = participants.length;
        const totalAnswers = participants.reduce((acc, p) => acc + Object.keys(p.answers || {}).length, 0);
        return { completed, total, totalAnswers };
    }, [participants]);

    return (
        <div className="flex flex-col h-full bg-[#000000] text-white font-sans selection:bg-[#F25623]/30 overflow-hidden">
            {/* Header / Top Bar */}
            <header className="px-8 py-6 border-b border-[#1F1F1F] flex justify-between items-center bg-[#050505] sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/admin/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#1F1F1F]">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-[#F25623]/30 text-[#F25623] bg-[#F25623]/5 px-3 py-1 font-mono tracking-wider">ROOM: {roomCode}</Badge>
                            {status === 'active' && <Badge variant="success" className="animate-pulse bg-emerald-500/20 text-emerald-500 border-none">LIVE</Badge>}
                        </div>
                        <h1 className="text-xl font-bold mt-1 font-display tracking-tight">Quiz Control Center</h1>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-8">
                        <div className="text-center">
                            <p className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-widest mb-1">Participants</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-widest mb-1">Progress</p>
                            <p className="text-xl font-bold">{stats.completed}/{stats.total}</p>
                        </div>
                    </div>
                    {status === 'active' && (
                        <Button variant="destructive" size="sm" onClick={handleForceSubmit} className="shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700">
                            <StopCircle className="w-4 h-4 mr-2" /> End Session
                        </Button>
                    )}
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {status === 'lobby' && (
                        <motion.div 
                            key="lobby"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] relative"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F25623]/5 rounded-full blur-[150px] pointer-events-none"></div>

                            <div className="text-center max-w-2xl z-10">
                                <div className="w-20 h-20 bg-[#F25623]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#F25623]/20 shadow-2xl shadow-[#F25623]/20">
                                    <Globe className="w-10 h-10 text-[#F25623] animate-spin-slow" />
                                </div>
                                <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">Ready to launch?</h2>
                                <p className="text-[#A3A3A3] text-sm mb-10">Invite participants using the room code <span className="font-mono text-white bg-[#1F1F1F] px-2 py-1 rounded">{roomCode}</span>. Once everyone has joined, click the button below to start the live quiz session.</p>
                                
                                <Button 
                                    size="lg" 
                                    onClick={handleStartGame} 
                                    className="h-14 px-12 text-sm font-bold bg-[#F25623] text-white hover:bg-[#F25623]/90 rounded-lg shadow-xl shadow-[#F25623]/20 active:scale-95 transition-all"
                                    disabled={participants?.length === 0}
                                >
                                    <Play className="mr-3 w-5 h-5 fill-current" /> LAUNCH SESSION
                                </Button>
                                
                                <div className="mt-16">
                                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-[0.2em] mb-6">Connected Candidates</p>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <AnimatePresence>
                                            {participants?.map((p, i) => (
                                                <motion.div
                                                    key={p.id}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-[#050505] px-5 py-2.5 rounded-lg text-sm font-medium border border-[#1F1F1F] flex items-center gap-3 shadow-sm"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[#F25623] animate-pulse" />
                                                    {p.nickname || p.id}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {(!participants || participants.length === 0) && (
                                            <p className="text-[#A3A3A3] text-sm italic">Waiting for candidates to join...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'active' && (
                        <motion.div 
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"
                        >
                            {/* Live Feed */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-[#F25623]" /> Live Activity Feed
                                    </h3>
                                    <span className="text-[10px] text-[#A3A3A3] font-mono tracking-widest">UPDATED REAL-TIME</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {participants?.map((p) => {
                                            const answerCount = Object.keys(p.answers || {}).length;
                                            const isCompleted = p.completed;

                                            return (
                                                <motion.div 
                                                    key={p.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={cn(
                                                        "p-6 rounded-xl border transition-all duration-300",
                                                        isCompleted 
                                                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                                                            : "bg-[#050505] border-[#1F1F1F] hover:border-[#1F1F1F]/80"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-lg">{p.nickname}</div>
                                                            <div className="text-[10px] text-[#A3A3A3] font-mono mt-1 uppercase tracking-tighter">ID: {p.id}</div>
                                                        </div>
                                                        {isCompleted ? (
                                                            <Badge variant="success" className="bg-emerald-500 text-white border-none px-3 py-1">FINISHED</Badge>
                                                        ) : (
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-[#F25623] font-mono">{answerCount}</div>
                                                                <div className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-widest">Answered</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Simple Progress Bar */}
                                                    {!isCompleted && (
                                                        <div className="mt-4 h-1.5 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                                                            <motion.div 
                                                                className="h-full bg-[#F25623]"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min((answerCount / 10) * 100, 100)}%` }} // Assuming 10 q's for visual
                                                            />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="p-6 bg-[#050505] border border-[#1F1F1F] rounded-xl sticky top-24">
                                    <h4 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-6 border-b border-[#1F1F1F] pb-4">Session Metrics</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[#A3A3A3] text-sm font-bold">Completion Rate</span>
                                            <span className="text-xl font-bold">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F25623] transition-all duration-1000" style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="p-4 bg-[#000000] rounded-xl border border-[#1F1F1F] text-center">
                                                <p className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-widest mb-1">Answers</p>
                                                <p className="text-2xl font-bold">{stats.totalAnswers}</p>
                                            </div>
                                            <div className="p-4 bg-[#000000] rounded-xl border border-[#1F1F1F] text-center">
                                                <p className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-widest mb-1">Active</p>
                                                <p className="text-2xl font-bold">{stats.total - stats.completed}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(status === 'leaderboard' || status === 'game_over') && (
                        <motion.div 
                            key="leaderboard"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center max-w-4xl mx-auto py-10"
                        >
                            <div className="w-24 h-24 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                                <Trophy className="w-12 h-12 text-amber-500" />
                            </div>
                            <h2 className="text-5xl font-display font-bold mb-12 tracking-tight">Leaderboard</h2>
                            
                            <div className="w-full space-y-3">
                                {leaderboard?.map((p, idx) => (
                                    <motion.div 
                                        key={p.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn(
                                            "flex items-center gap-6 p-5 rounded-xl border transition-all",
                                            idx === 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/30 scale-105 shadow-xl shadow-amber-500/5" : 
                                            idx === 1 ? "bg-[#050505] border-[#1F1F1F] shadow-lg" :
                                            idx === 2 ? "bg-[#050505] border-[#1F1F1F]/50" : "bg-transparent border-[#1F1F1F]/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shrink-0 font-mono",
                                            idx === 0 ? "bg-amber-500/20 text-amber-500" : "bg-[#1F1F1F] text-[#A3A3A3]"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("text-xl font-bold", idx === 0 ? "text-amber-500" : "text-white")}>{p.nickname}</p>
                                            <p className="text-[10px] text-[#A3A3A3] font-mono uppercase">{p.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-3xl font-black font-mono", idx === 0 ? "text-amber-500" : "text-white")}>{p.score}</p>
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#A3A3A3]">POINTS</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-16 flex gap-4">
                                <Button size="lg" className="px-10 h-12 text-sm font-bold bg-white text-black hover:bg-white/90" onClick={() => navigate('/admin/dashboard')}>
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                </Button>
                                <Button variant="outline" size="lg" className="px-10 h-12 text-sm font-bold border-[#1F1F1F] bg-[#050505] hover:bg-[#1F1F1F] text-white">
                                    Export Results
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HostView;
