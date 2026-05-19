import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/components/ui/Components';
import QuestionPalette from '@/components/quiz/QuestionPalette';
import { 
    Clock, ChevronLeft, ChevronRight, 
    Flag, RotateCcw, Send, CheckCircle2, Zap, AlertTriangle, Monitor, Shield
} from 'lucide-react';

const ParticipantView = ({ gameState, sendAction, userId }) => {
    const { status } = gameState;

    // Quiz engine state
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [reviewList, setReviewList] = useState(new Set());
    const [visitedList, setVisitedList] = useState(new Set(["0"]));
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // Security state - useRef for tab count to avoid stale closure bugs
    const [hasStartedExam, setHasStartedExam] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const tabSwitchCountRef = useRef(0);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Sync questions from server
    useEffect(() => {
        if (gameState.questions && gameState.questions.length > 0) {
            setQuestions(gameState.questions);
        }
        if (gameState.my_answers) {
            setResponses(gameState.my_answers);
        }
    }, [gameState]);

    // If reconnecting to an active game that was already started
    useEffect(() => {
        if (status === 'active' && gameState.questions && gameState.questions.length > 0) {
            // Auto-recover: if we have questions, we were in the exam
            // But still require fullscreen gate
        }
    }, [status, gameState.questions]);

    // Tab switching anti-cheat - only active when exam is started
    useEffect(() => {
        if (!hasStartedExam || isSubmitted || status !== 'active') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                tabSwitchCountRef.current += 1;
                const newCount = tabSwitchCountRef.current;
                setTabSwitchCount(newCount);

                if (newCount >= 3) {
                    sendAction('submit_test', { forced: true, reason: 'tab_switching' });
                    setIsSubmitted(true);
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                    }
                } else {
                    setShowWarning(true);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [hasStartedExam, isSubmitted, status, sendAction]);

    // THE key function: user clicks Start → go fullscreen → unlock exam
    const handleStartExam = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setHasStartedExam(true);
        } catch (err) {
            console.error('Fullscreen failed:', err);
            // Still allow exam if fullscreen is blocked by browser
            setHasStartedExam(true);
        }
    }, []);

    const handleNav = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQIndex(index);
            setVisitedList(prev => new Set(prev).add(String(index)));
        }
    };

    const handleSaveNext = () => {
        if (currentQIndex < questions.length - 1) {
            handleNav(currentQIndex + 1);
        } else {
            // Last question: on mobile open palette, on desktop show submit
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop) {
                setShowConfirmSubmit(true);
            } else {
                setIsPaletteOpen(true);
            }
        }
    };

    const handleOptionSelect = (optIdx) => {
        const qId = String(currentQIndex);
        setResponses(prev => ({ ...prev, [qId]: optIdx }));
        sendAction('submit_answer', { questionId: qId, optionIdx: optIdx });
    };

    const handleClear = () => {
        const qId = String(currentQIndex);
        const newResp = { ...responses };
        delete newResp[qId];
        setResponses(newResp);
        sendAction('submit_answer', { questionId: qId, optionIdx: -1 });
    };

    const handleMarkReview = () => {
        const qId = String(currentQIndex);
        setReviewList(prev => {
            const newSet = new Set(prev);
            if (newSet.has(qId)) newSet.delete(qId); else newSet.add(qId);
            return newSet;
        });
    };

    const handleSubmitTest = () => {
        setShowConfirmSubmit(true);
    };

    const confirmSubmit = () => {
        sendAction('submit_test', {});
        setIsSubmitted(true);
        setShowConfirmSubmit(false);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    // ─── RENDER: LOBBY ───
    if (status === 'lobby') {
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <Glow color="orange" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full p-8 rounded-2xl bg-[#0A0A0B] border border-[#1F1F1F] shadow-2xl text-center z-10">
                        <div className="w-16 h-16 bg-[#F25623]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#F25623]/20">
                            <Clock className="w-8 h-8 text-[#F25623] animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-display font-bold mb-2 text-white">System Check: <span className="text-[#F25623]">OK</span></h2>
                        <p className="text-sm text-[#A3A3A3] leading-relaxed mb-6">
                            Connected as <span className="text-white font-mono text-xs bg-[#1F1F1F] px-2 py-0.5 rounded">{userId}</span>
                        </p>
                        <div className="pt-6 border-t border-[#1F1F1F]">
                            <div className="inline-block px-4 py-2 bg-[#F25623]/10 text-[#F25623] text-[10px] font-bold uppercase tracking-widest border border-[#F25623]/20 rounded-full animate-pulse">
                                WAITING FOR HOST
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Shell>
        );
    }

    // ─── RENDER: GAME OVER ───
    if (status === 'game_over') {
        const myResult = gameState.leaderboard?.find(p => p.id === userId);
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <Glow color="green" />
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="max-w-md w-full p-8 rounded-2xl bg-[#0A0A0B] border border-[#1F1F1F] shadow-2xl text-center z-10">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-white mb-2">Results Published</h2>
                        <p className="text-sm text-[#A3A3A3] mb-8">Your responses have been graded.</p>
                        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl mb-8">
                            <p className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest mb-2">Final Score</p>
                            <p className="text-5xl font-black text-[#F25623] font-mono">{myResult?.score ?? 0}</p>
                        </div>
                        <Button className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-xs" onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                            window.location.href = '/join';
                        }}>Back to Home</Button>
                    </motion.div>
                </div>
            </Shell>
        );
    }

    // ─── RENDER: SUBMITTED (waiting for host to end) ───
    if (isSubmitted) {
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <Glow color="orange" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full p-8 rounded-2xl bg-[#0A0A0B] border border-[#1F1F1F] shadow-2xl text-center z-10">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4 text-white">Exam Submitted</h2>
                        <p className="text-sm text-[#A3A3A3] leading-relaxed mb-6">
                            Your test is locked. Wait for the host to publish results.
                        </p>
                        <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 rounded-full">
                            AWAITING RESULTS
                        </div>
                    </motion.div>
                </div>
            </Shell>
        );
    }

    // ─── RENDER: START GATE (fullscreen prompt) ───
    if (status === 'active' && !hasStartedExam) {
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <Glow color="orange" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="max-w-lg w-full p-8 rounded-2xl bg-[#0A0A0B] border border-[#1F1F1F] shadow-2xl text-center z-10">
                        <div className="w-20 h-20 bg-[#F25623]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#F25623]/20">
                            <Monitor className="w-10 h-10 text-[#F25623]" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-3 text-white">Ready to Begin</h2>
                        <p className="text-sm text-[#A3A3A3] leading-relaxed mb-4">
                            The host has started the exam. Clicking <strong className="text-white">Start Exam</strong> will enter full-screen mode.
                        </p>
                        <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 mb-8 text-left space-y-3">
                            <div className="flex items-start gap-3">
                                <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#A3A3A3]">Switching tabs <strong className="text-red-400">3 times</strong> will auto-submit your exam.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Monitor className="w-4 h-4 text-[#F25623] mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#A3A3A3]">Full-screen mode is <strong className="text-white">mandatory</strong> during the exam.</p>
                            </div>
                        </div>
                        <Button onClick={handleStartExam}
                            className="w-full h-14 bg-[#F25623] text-white hover:bg-[#d94a1c] rounded-xl font-bold tracking-widest text-sm uppercase transition-all">
                            Start Exam
                        </Button>
                    </motion.div>
                </div>
            </Shell>
        );
    }

    // ─── RENDER: ACTIVE EXAM ───
    if (!questions.length) {
        return (
            <Shell>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-[#F25623] font-mono text-sm">Loading questions...</div>
                </div>
            </Shell>
        );
    }

    const currentQ = questions[currentQIndex];
    const answeredCount = Object.keys(responses).filter(k => responses[k] !== undefined && responses[k] !== -1).length;

    return (
        <div className="h-screen bg-[#000000] text-white font-sans flex flex-col items-center overflow-hidden relative">
            <div className="w-full max-w-5xl h-screen flex flex-col border-x border-[#1F1F1F] bg-[#050505]">
                {/* Header */}
                <header className="w-full h-14 border-b border-[#1F1F1F] flex items-center justify-between px-6 bg-[#050505] z-50 flex-shrink-0">
                    <div className="font-display text-lg font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#F25623] fill-current" /> QuizPulse
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className={cn("border-none text-[10px] font-bold tracking-widest uppercase",
                            tabSwitchCount > 0 ? "bg-red-500/10 text-red-400" : "bg-[#1F1F1F] text-[#A3A3A3]")}>
                            ⚠ {tabSwitchCount}/3
                        </Badge>
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest hidden md:block">
                            {answeredCount}/{questions.length} answered
                        </span>
                        <Button variant="ghost" className="hidden md:flex gap-2 text-red-400 hover:bg-red-500/10 font-bold tracking-widest text-[10px] uppercase" onClick={handleSubmitTest}>
                            <Send className="w-3 h-3" /> Submit
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main question area */}
                    <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
                        <div className="w-full px-6 py-6 pb-28">
                            {/* Question counter */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[10px] font-bold text-[#A3A3A3]/60 uppercase tracking-widest">Question</span>
                                <span className="text-2xl font-black text-white">{currentQIndex + 1}</span>
                                <span className="text-[10px] font-bold text-[#A3A3A3]">/ {questions.length}</span>
                                {reviewList.has(String(currentQIndex)) && (
                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">FLAGGED</span>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div key={currentQIndex}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}>
                                    
                                    {/* Question card */}
                                    <div className="p-6 mb-8 bg-[#111111] border border-[#1F1F1F] rounded-2xl">
                                        <h2 className="text-xl md:text-2xl font-display font-bold leading-snug text-white">
                                            {currentQ.text}
                                        </h2>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {currentQ.options.map((opt, idx) => {
                                            const isSelected = responses[String(currentQIndex)] === idx;
                                            return (
                                                <button key={idx} onClick={() => handleOptionSelect(idx)}
                                                    className={cn(
                                                        "group w-full flex items-center p-4 rounded-xl border text-left transition-all duration-200 relative",
                                                        isSelected
                                                            ? "border-[#F25623] bg-[#F25623]/10 shadow-[0_0_15px_rgba(242,86,35,0.1)]"
                                                            : "border-[#1F1F1F] bg-[#0A0A0B] hover:border-[#333] hover:bg-[#111111]"
                                                    )}>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center mr-4 transition-all text-sm",
                                                        isSelected
                                                            ? "bg-[#F25623] border-[#F25623] text-white"
                                                            : "bg-[#1F1F1F] border-[#333] text-[#A3A3A3] group-hover:border-[#F25623]/50 group-hover:text-[#F25623]"
                                                    )}>
                                                        <span className="font-bold font-mono">{String.fromCharCode(65 + idx)}</span>
                                                    </div>
                                                    <span className={cn("text-sm font-medium", isSelected ? "text-white" : "text-[#A3A3A3] group-hover:text-white")}>
                                                        {opt.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom nav bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none">
                            <div className="w-full flex justify-between items-center bg-[#0A0A0B] border border-[#1F1F1F] p-2 rounded-xl shadow-2xl pointer-events-auto">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10 hover:bg-[#1F1F1F]" onClick={handleMarkReview}>
                                        <Flag className={cn("w-4 h-4", reviewList.has(String(currentQIndex)) ? "text-indigo-400 fill-current" : "text-[#A3A3A3]")} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10 hover:bg-[#1F1F1F]" onClick={handleClear}>
                                        <RotateCcw className="w-4 h-4 text-[#A3A3A3]" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" className="h-10 px-4 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] text-xs font-bold"
                                        onClick={() => handleNav(currentQIndex - 1)} disabled={currentQIndex === 0}>
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                    </Button>
                                    <Button className="h-10 px-5 rounded-lg bg-[#F25623] hover:bg-[#d94a1c] text-white text-xs font-bold"
                                        onClick={handleSaveNext}>
                                        {currentQIndex === questions.length - 1 ? 'Review' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop sidebar palette */}
                    <aside className="hidden lg:flex w-64 border-l border-[#1F1F1F] bg-[#0A0A0B] p-5 flex-col">
                        <div className="flex-1 overflow-hidden">
                            <QuestionPalette totalQuestions={questions.length} currentQuestionIndex={currentQIndex}
                                onQuestionSelect={handleNav} responses={responses} reviewList={reviewList} visitedList={visitedList} />
                        </div>
                        <div className="pt-4 mt-2">
                            <Button className="w-full h-11 text-xs font-bold rounded-xl bg-white text-black hover:bg-white/90 shadow-lg" onClick={handleSubmitTest}>
                                Submit Test
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Mobile palette overlay */}
            <AnimatePresence>
                {isPaletteOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-[100] flex items-end">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPaletteOpen(false)} />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="relative w-full bg-[#0A0A0B] border-t border-[#1F1F1F] rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="w-12 h-1 bg-[#1F1F1F] rounded-full mx-auto mb-6" />
                            <h3 className="text-lg font-bold mb-4">Test Summary</h3>
                            <QuestionPalette totalQuestions={questions.length} currentQuestionIndex={currentQIndex}
                                onQuestionSelect={(i) => { handleNav(i); setIsPaletteOpen(false); }}
                                responses={responses} reviewList={reviewList} visitedList={visitedList} />
                            <Button className="w-full h-12 mt-6 rounded-xl bg-[#F25623] text-white text-xs font-bold" onClick={handleSubmitTest}>
                                CONFIRM SUBMISSION
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Submit Modal */}
            <AnimatePresence>
                {showConfirmSubmit && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0A0A0B] border border-[#1F1F1F] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-[#F25623]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#F25623]/20">
                                <Send className="w-8 h-8 text-[#F25623]" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white mb-3">Submit Test?</h2>
                            <p className="text-sm text-[#A3A3A3] mb-8 leading-relaxed">
                                This action is <strong className="text-white">final</strong>. You won't be able to change your answers after submitting.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setShowConfirmSubmit(false)}
                                    className="flex-1 h-12 bg-[#1F1F1F] hover:bg-[#2a2a2a] text-white font-bold text-xs uppercase rounded-xl">
                                    Go Back
                                </Button>
                                <Button onClick={confirmSubmit}
                                    className="flex-1 h-12 bg-[#F25623] hover:bg-[#d94a1c] text-white font-bold text-xs uppercase rounded-xl shadow-lg shadow-[#F25623]/20">
                                    Yes, Submit
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Warning overlay */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="bg-[#0A0A0B] border border-red-500/40 p-8 rounded-2xl max-w-lg text-center shadow-[0_0_80px_rgba(239,68,68,0.15)]">
                            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-display font-black text-red-500 mb-4">Security Alert</h2>
                            <p className="text-sm text-[#A3A3A3] mb-8 leading-relaxed">
                                Tab switch detected. This is a violation.<br /><br />
                                <strong className="text-white">Warning {tabSwitchCount} of 3.</strong> {3 - tabSwitchCount} more and your exam is auto-submitted.
                            </p>
                            <Button onClick={() => { setShowWarning(false); document.documentElement.requestFullscreen().catch(() => {}); }}
                                className="bg-red-600 hover:bg-red-700 text-white w-full h-12 font-bold tracking-widest text-xs uppercase rounded-xl">
                                I Understand — Resume
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Shared Layout Pieces ───
const Shell = ({ children }) => (
    <div className="h-screen bg-[#000000] text-white font-sans flex flex-col items-center overflow-hidden relative">
        <div className="w-full max-w-5xl h-screen flex flex-col border-x border-[#1F1F1F] bg-[#050505]">
            <header className="w-full h-14 border-b border-[#1F1F1F] flex items-center px-6 bg-[#050505] flex-shrink-0">
                <div className="font-display text-lg font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F25623] fill-current" /> QuizPulse
                </div>
            </header>
            <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">{children}</main>
        </div>
    </div>
);

const Glow = ({ color }) => (
    <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none",
        color === 'green' ? "bg-emerald-500/10" : "bg-[#F25623]/10")} />
);

export default ParticipantView;
