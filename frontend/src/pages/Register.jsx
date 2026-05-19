import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui/Components';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

const Register = ({ isParticipant = true }) => {
    const [formData, setFormData] = useState({
        orgName: '',
        fullName: '',
        email: '',
        password: '',
        inviteCode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userData = {
                email: formData.email,
                username: formData.email,
                full_name: formData.fullName,
                password: formData.password,
            };

            if (isParticipant) {
                await api.registerParticipant(userData, formData.inviteCode);
                navigate('/login', { state: { message: 'ACCOUNT CREATED. PLEASE SIGN IN.' } });
            } else {
                await api.registerAdmin(userData, formData.orgName, formData.inviteCode);
                navigate('/secure/portal-login', { state: { message: 'PORTAL ESTABLISHED. SIGN IN BELOW.' } });
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#000000] text-white font-sans selection:bg-[#F25623]/30 flex flex-col items-center overflow-hidden">
            {/* The 5xl Window with Borders */}
            <div className="w-full max-w-5xl h-screen flex flex-col border-x border-[#1F1F1F] relative shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#050505]">
                
                {/* Navbar */}
                <header className="w-full h-16 border-b border-[#1F1F1F] flex items-center justify-between px-8 bg-[#050505] z-20 flex-shrink-0">
                    <Link to="/" className="font-display text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#F25623] fill-current" />
                        QuizPulse
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-[11px] font-bold text-[#A3A3A3] hover:text-white uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to main
                    </Link>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-y-auto custom-scrollbar">
                    {/* Abstract background elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F25623]/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[480px] z-10"
                    >
                        <div className="mb-6 text-center">
                            <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
                                Create <span className="text-[#F25623]">Identity.</span>
                            </h2>
                            <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                                Join our private network for elite assessments. Build, manage, and scale.
                            </p>
                        </div>

                        <div className="glass-card p-6 md:p-8 rounded-xl border-[#1F1F1F] relative bg-[#000000]/80 backdrop-blur-md shadow-2xl">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-4">
                                    {!isParticipant && (
                                        <div>
                                            <label className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-1.5 block ml-1">Organization Name</label>
                                            <Input
                                                placeholder="Company Name"
                                                value={formData.orgName}
                                                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                                className="h-10 bg-[#050505] border-[#1F1F1F] focus:border-[#F25623]/40 rounded-[6px] px-4 text-sm"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                                            <Input
                                                placeholder="Your Name"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="h-10 bg-[#050505] border-[#1F1F1F] focus:border-[#F25623]/40 rounded-[6px] px-4 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[#F25623] uppercase tracking-widest mb-1.5 block ml-1">Invite Code</label>
                                            <Input
                                                placeholder="Required"
                                                value={formData.inviteCode}
                                                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                                                className="h-10 bg-[#F25623]/5 border-[#F25623]/30 rounded-[6px] px-4 text-white font-bold tracking-widest focus:bg-[#F25623]/10 transition-all placeholder:text-[#F25623]/40 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-1.5 block ml-1">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-10 bg-[#050505] border-[#1F1F1F] focus:border-[#F25623]/40 rounded-[6px] px-4 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-1.5 block ml-1">Secure Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="h-10 bg-[#050505] border-[#1F1F1F] focus:border-[#F25623]/40 rounded-[6px] px-4 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="py-1">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="w-3.5 h-3.5 rounded-[4px] bg-[#050505] border border-[#1F1F1F] group-hover:border-[#F25623]/50 transition-all mt-0.5" />
                                        <span className="text-[10px] text-[#A3A3A3] leading-relaxed">
                                            I agree to the <span className="text-white hover:text-[#F25623] transition-colors underline decoration-[#F25623]/30">Terms of Service</span> and <span className="text-white hover:text-[#F25623] transition-colors underline decoration-[#F25623]/30">Privacy Policy</span>.
                                        </span>
                                    </label>
                                </div>

                                {error && <p className="text-red-400 text-[10px] font-bold bg-red-400/5 p-3 rounded-[6px] border border-red-400/10 text-center uppercase tracking-widest">{error}</p>}

                                <Button 
                                    type="submit" 
                                    className="w-full h-11 bg-white text-black hover:bg-white/90 shadow-2xl flex items-center justify-center gap-3 mt-2 rounded-[6px] font-bold text-xs"
                                    disabled={loading}
                                >
                                    {loading ? 'PROCESSING...' : 'INITIALIZE ACCOUNT'} <ArrowRight className="w-4 h-4" />
                                </Button>


                            </form>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-[#A3A3A3]/60 font-bold uppercase tracking-widest">
                                Already part of the network?{' '}
                                <Link to="/login" className="text-white hover:text-[#F25623] transition-all ml-1">
                                    Secure Login
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="w-full border-t border-[#1F1F1F] py-4 px-8 flex flex-col md:flex-row items-center justify-between bg-[#050505] text-[10px] font-bold text-[#A3A3A3]/50 uppercase tracking-widest z-20 flex-shrink-0">
                    <p>© 2026 QuizPulse.</p>
                    <div className="flex gap-6 mt-2 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Register;
