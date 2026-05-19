import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Plus, Play, Trash2, LayoutDashboard, 
    Settings, LogOut, Users, Trophy, 
    BarChart3, PlusCircle, Search, Filter,
    ChevronRight, Calendar, Clock, Zap
} from 'lucide-react';
import { Button, Card, Badge, Skeleton } from '@/components/ui/Components';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPlays: 0, totalQuestions: 0 });
    const navigate = useNavigate();
    const toast = useToast();
    const username = localStorage.getItem('username') || 'Admin';

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getQuizzes();
            setQuizzes(data);
            const totalPlays = data.reduce((acc, q) => acc + (q.plays || 0), 0);
            const totalQuestions = data.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
            setStats({ totalPlays, totalQuestions });
        } catch (err) {
            toast('Load failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Delete this quiz?")) {
            try {
                await api.deleteQuiz(id);
                toast('Success', 'success');
                loadData();
            } catch (err) {
                toast('Failed', 'error');
            }
        }
    };

    const handleHost = async (e, quizId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const { room_code } = await api.createRoom(quizId);
            toast(`Live session started: ${room_code}`, 'success');
            navigate(`/admin/host/${room_code}`);
        } catch (err) {
            toast('Failed to start session', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#A3A3A3] flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#1F1F1F] bg-[#050505] hidden md:flex flex-col p-8 fixed h-full z-50">
                <div className="flex items-center gap-3 mb-16">
                    <div className="w-8 h-8 bg-[#F25623] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(242,86,35,0.3)]">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-tight text-white">QuizPulse</span>
                </div>

                <nav className="space-y-1 flex-1">
                    <Link to="/admin/dashboard">
                        <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-md text-sm font-medium text-white bg-white/[0.03] active-glow">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                    </Link>
                    <Link to="/admin/analytics">
                        <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-md text-sm font-medium text-white/40 hover:text-white hover:bg-white/[0.02] transition-all">
                            <BarChart3 className="w-4 h-4" /> Analytics
                        </button>
                    </Link>
                    <Link to="/admin/settings">
                        <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-md text-sm font-medium text-white/40 hover:text-white hover:bg-white/[0.02] transition-all">
                            <Settings className="w-4 h-4" /> Settings
                        </button>
                    </Link>
                </nav>

                <div className="pt-8 border-t border-white/[0.04]">
                    <div className="flex items-center gap-4 px-2 mb-8">
                        <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center font-bold text-[10px]">
                            {username[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{username}</p>
                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Admin</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-4 px-4 text-white/20 hover:text-red-400 hover:bg-red-500/5"
                        onClick={() => { api.logout(); navigate('/login'); }}
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 relative overflow-y-auto custom-scrollbar">
                <div className="w-full p-6 md:p-8 lg:p-10">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 lg:mb-16">
                        <div>
                            <h1 className="text-5xl font-display font-bold tracking-tighter text-white mb-3">DASHBOARD</h1>
                            <p className="text-white/20 font-medium">Create and manage your interactive quizzes.</p>
                        </div>
                        <Link to="/admin/create">
                            <Button className="h-12 px-8 bg-[#F25623] text-white font-bold rounded-md shadow-[0_0_20px_rgba(242,86,35,0.2)] hover:bg-[#F25623]/90">
                                <PlusCircle className="mr-3 h-4 w-4" /> CREATE QUIZ
                            </Button>
                        </Link>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                        {[
                            { label: 'Total Quizzes', value: quizzes.length, icon: LayoutDashboard },
                            { label: 'Questions', value: stats.totalQuestions, icon: PlusCircle },
                            { label: 'Avg. Score', value: '88.5%', icon: Trophy },
                            { label: 'Platform Status', value: 'ONLINE', icon: Zap },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-lg group">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-3xl font-display font-bold text-white tracking-tight">
                                        {loading ? <Skeleton className="h-8 w-16" /> : stat.value}
                                    </h3>
                                    <stat.icon className="w-5 h-5 text-white/10 group-hover:text-[#F25623] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
                            <h2 className="text-lg font-bold text-white/60 flex items-center gap-4">
                                YOUR QUIZZES
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40">{quizzes.length}</Badge>
                            </h2>
                            <div className="flex gap-2">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/20" />
                                    <input 
                                        placeholder="Search quizzes..." 
                                        className="bg-white/[0.02] border border-white/[0.05] rounded-md pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#F25623]/30 w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                        ) : (
                            <div className="grid grid-cols-1 gap-1">
                                {quizzes.map((quiz) => (
                                    <div 
                                        key={quiz._id} 
                                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#08090a] hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] rounded-lg transition-all cursor-pointer"
                                        onClick={() => navigate(`/admin/edit/${quiz._id}`)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 bg-white/[0.02] border border-white/[0.05] rounded-md flex items-center justify-center text-white/20 group-hover:text-[#F25623] transition-colors">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{quiz.title}</h3>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                    <span>{quiz.questions?.length || 0} QUESTIONS</span>
                                                    <span>•</span>
                                                    <span>{quiz.plays || 0} PARTICIPANTS</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleHost(e, quiz._id)}
                                                className="border-white/[0.05] hover:border-[#F25623]/30 text-white/40 hover:text-white"
                                            >
                                                LIVE SESSION
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-white/10 hover:text-red-400"
                                                onClick={(e) => handleDelete(e, quiz._id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
