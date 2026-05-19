import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, ArrowRight, Shield, Users, BarChart3, Play, CheckCircle2, Star, Sparkles, Globe, Lock } from 'lucide-react';

/* ─── Animation presets ─── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
    whileInView: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
});

/* ─── Animated grid background ─── */
const GridBg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(242,86,35,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(242,86,35,0.03) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
        }} />
    </div>
);

/* ─── Floating orbs ─── */
const Orbs = () => (
    <>
        <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[15%] w-[400px] h-[400px] bg-[#F25623]/[0.07] rounded-full blur-[120px]" />
        <motion.div animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-[#F25623]/[0.04] rounded-full blur-[100px]" />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[20%] left-[40%] w-[250px] h-[250px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
    </>
);

/* ─── Stat counter ─── */
const StatItem = ({ value, label, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }} className="text-center">
        <div className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">{value}</div>
        <div className="text-[11px] font-bold text-[#A3A3A3]/50 uppercase tracking-[0.2em] mt-2">{label}</div>
    </motion.div>
);

/* ─── Feature card ─── */
const FeatureCard = ({ icon, title, desc, index }) => (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="group relative p-7 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-[#1F1F1F] hover:border-[#F25623]/40 transition-all duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F25623]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#F25623]/10 border border-[#F25623]/20 flex items-center justify-center mb-5 group-hover:bg-[#F25623]/20 group-hover:scale-110 transition-all duration-300">
                {icon}
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2.5 tracking-tight">{title}</h3>
            <p className="text-[13px] text-[#A3A3A3]/80 leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);

/* ─── Testimonial card ─── */
const TestimonialCard = ({ quote, name, role, delay }) => (
    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="p-6 rounded-2xl bg-white/[0.02] border border-[#1F1F1F] hover:border-[#1F1F1F]/80 transition-all">
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-[#F25623] fill-[#F25623]" />)}
        </div>
        <p className="text-[13px] text-[#A3A3A3] leading-relaxed mb-5 italic">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F25623] to-[#F25623]/50 flex items-center justify-center text-[10px] font-black text-white">
                {name[0]}
            </div>
            <div>
                <div className="text-xs font-bold text-white">{name}</div>
                <div className="text-[10px] text-[#A3A3A3]/50">{role}</div>
            </div>
        </div>
    </motion.div>
);

/* ═══════════════════════════════════ LANDING ═══════════════════════════════════ */
const Landing = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const features = [
        { icon: <Zap className="w-5 h-5 text-[#F25623]" />, title: 'Instant Setup', desc: 'Create and deploy quizzes in under 60 seconds. No config, no hassle.' },
        { icon: <Shield className="w-5 h-5 text-[#F25623]" />, title: 'Anti-Cheat Engine', desc: 'Fullscreen lockdown, tab-switch detection, and browser monitoring built in.' },
        { icon: <Users className="w-5 h-5 text-[#F25623]" />, title: 'Live Sessions', desc: 'Host real-time quiz sessions with hundreds of concurrent participants.' },
        { icon: <BarChart3 className="w-5 h-5 text-[#F25623]" />, title: 'Deep Analytics', desc: 'Auto-generated leaderboards, score breakdowns, and performance insights.' },
        { icon: <Globe className="w-5 h-5 text-[#F25623]" />, title: 'Access Anywhere', desc: 'Fully responsive — works on desktop, tablet, and mobile browsers.' },
        { icon: <Lock className="w-5 h-5 text-[#F25623]" />, title: 'Invite-Only Access', desc: 'Secure invite codes ensure only authorized participants can join.' },
    ];

    const testimonials = [
        { quote: "QuizPulse transformed how we run internal assessments. Setup takes seconds, and the anti-cheat is rock solid.", name: "Arjun Mehta", role: "Engineering Lead, TechNova" },
        { quote: "We moved from Google Forms to QuizPulse and never looked back. The live hosting feature is a game changer.", name: "Sarah Chen", role: "HR Director, ScaleUp Inc" },
        { quote: "Clean interface, powerful features, zero learning curve. Exactly what our training team needed.", name: "David Park", role: "L&D Manager, CloudFirst" },
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#F25623]/30 overflow-x-hidden">
            {/* ── Navbar ── */}
            <nav className="w-full border-b border-[#1F1F1F]/60 bg-[#000000]/70 backdrop-blur-2xl sticky top-0 z-[100]">
                <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-[#F25623] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="font-display text-xl font-black tracking-tight text-white uppercase">QuizPulse</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#A3A3A3]">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-[13px] font-semibold text-[#A3A3A3] hover:text-white transition-colors hidden sm:block">Log In</Link>
                        <Link to="/register">
                            <button className="px-5 py-2.5 bg-[#F25623] text-white rounded-lg text-[13px] font-bold hover:bg-[#d94a1c] transition-all shadow-lg shadow-[#F25623]/20 flex items-center gap-2">
                                Get Started <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <GridBg />
                <Orbs />
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto px-6 md:px-8 py-24 text-center relative z-10">
                    {/* Badge */}
                    <motion.div {...fadeUp(0)} className="flex justify-center mb-8">
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-[#1F1F1F] backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 text-[#F25623]" />
                            <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-[0.15em]">Now in Public Beta</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-display font-black tracking-[-0.04em] text-white mb-6 leading-[0.95]">
                        The smarter way<br />
                        to run{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-[#F25623] via-[#ff7a50] to-[#F25623] bg-clip-text text-transparent">quizzes.</span>
                            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
                                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F25623] to-transparent rounded-full origin-left" />
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-[#A3A3A3] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                        Build, host, and manage secure quiz sessions with real-time analytics,
                        anti-cheat protection, and beautiful interfaces — all in one platform.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        <Link to="/register">
                            <button className="h-14 px-10 bg-[#F25623] text-white font-bold rounded-xl text-[15px] hover:bg-[#d94a1c] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#F25623]/25 group w-full sm:w-auto">
                                Start for Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="h-14 px-10 bg-white/[0.04] border border-[#1F1F1F] text-white font-bold rounded-xl text-[15px] hover:bg-white/[0.08] hover:border-[#333] transition-all flex items-center justify-center gap-3 backdrop-blur-sm w-full sm:w-auto">
                                <Play className="w-4 h-4 text-[#F25623]" /> Watch Demo
                            </button>
                        </Link>
                    </motion.div>

                    <motion.p {...fadeUp(0.4)} className="text-[11px] text-[#A3A3A3]/40 font-medium flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10b981]" /> Free forever</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10b981]" /> No credit card</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10b981]" /> Setup in 60s</span>
                    </motion.p>
                </motion.div>
            </section>

            {/* ── Product Preview ── */}
            <section className="relative pb-24 -mt-8">
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-2xl overflow-hidden border border-[#1F1F1F] bg-[#0a0a0a] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F25623]/40 to-transparent" />
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1F1F1F] bg-[#080808]">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                            <div className="ml-4 flex-1 h-6 rounded-md bg-white/[0.03] border border-[#1F1F1F] flex items-center px-3">
                                <span className="text-[10px] text-[#A3A3A3]/40 font-mono">quizpulse.app/dashboard</span>
                            </div>
                        </div>
                        {/* Dashboard mockup */}
                        <div className="p-6 md:p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F25623] flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-white" /></div>
                                    <span className="font-display text-sm font-bold text-white">Dashboard</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1.5 rounded-md bg-[#F25623]/10 border border-[#F25623]/20 text-[10px] font-bold text-[#F25623]">+ New Quiz</div>
                                </div>
                            </div>
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[{ l: 'Active Quizzes', v: '12' }, { l: 'Participants', v: '847' }, { l: 'Avg Score', v: '78%' }].map(s => (
                                    <div key={s.l} className="p-4 rounded-xl bg-white/[0.02] border border-[#1F1F1F]">
                                        <div className="text-[10px] text-[#A3A3A3]/50 uppercase tracking-wider mb-1">{s.l}</div>
                                        <div className="text-xl font-display font-black text-white">{s.v}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Table rows */}
                            <div className="rounded-xl border border-[#1F1F1F] overflow-hidden">
                                {['JavaScript Fundamentals', 'React Advanced Patterns', 'System Design Basics'].map((q, i) => (
                                    <div key={q} className={`flex items-center justify-between px-5 py-3.5 ${i < 2 ? 'border-b border-[#1F1F1F]' : ''} hover:bg-white/[0.02] transition-colors`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#10b981]' : 'bg-[#A3A3A3]/20'}`} />
                                            <span className="text-xs font-semibold text-white">{q}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#A3A3A3]/40">{i === 0 ? 'LIVE' : 'DRAFT'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Bottom glow */}
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#F25623]/20 to-transparent" />
                    </motion.div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="border-t border-b border-[#1F1F1F] bg-[#030303]">
                <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatItem value="10K+" label="Quizzes Created" delay={0} />
                        <StatItem value="50K+" label="Participants" delay={0.1} />
                        <StatItem value="99.9%" label="Uptime" delay={0.2} />
                        <StatItem value="4.9★" label="User Rating" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="relative">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-28">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-[10px] font-bold text-[#F25623] uppercase tracking-[0.3em] mb-4 block">Features</span>
                        <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
                            Everything you need.<br />
                            <span className="text-[#A3A3A3]/40">Nothing you don't.</span>
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section id="testimonials" className="border-t border-[#1F1F1F]">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-28">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-[10px] font-bold text-[#F25623] uppercase tracking-[0.3em] mb-4 block">Testimonials</span>
                        <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white">
                            Loved by teams everywhere.
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => <TestimonialCard key={t.name} {...t} delay={i * 0.1} />)}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="border-t border-[#1F1F1F] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#F25623]/[0.06] via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F25623]/[0.05] rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 md:px-8 py-32 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-5">
                            Ready to get started?
                        </h2>
                        <p className="text-[#A3A3A3] mb-10 text-lg max-w-lg mx-auto">
                            Create your first quiz in under a minute. Free forever for individuals and small teams.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register">
                                <button className="h-14 px-10 bg-[#F25623] text-white font-bold rounded-xl text-[15px] hover:bg-[#d94a1c] transition-all shadow-2xl shadow-[#F25623]/25 flex items-center justify-center gap-3 group">
                                    Create Free Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="h-14 px-10 bg-white text-black font-bold rounded-xl text-[15px] hover:bg-white/90 transition-all">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-[#1F1F1F] bg-[#030303]">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-[#F25623] flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                            <span className="font-display text-lg font-black text-white uppercase tracking-tight">QuizPulse</span>
                        </div>
                        <div className="flex gap-8 text-[11px] font-bold text-[#A3A3A3]/40 uppercase tracking-widest">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-[#1F1F1F]/50 text-center">
                        <p className="text-[10px] font-bold text-[#A3A3A3]/20 uppercase tracking-[0.2em]">© 2026 QuizPulse Inc — All rights reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
