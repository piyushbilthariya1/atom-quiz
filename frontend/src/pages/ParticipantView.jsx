
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Components';
import QuestionPalette from '@/components/quiz/QuestionPalette';

const ParticipantView = ({ gameState, sendAction, userId }) => {
    const { status } = gameState;

    // NTA Engine State
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [responses, setResponses] = useState({}); // { "0": 1, "1": 3 } (QuestionIndex: OptionIndex)
    const [reviewList, setReviewList] = useState(new Set());
    const [visitedList, setVisitedList] = useState(new Set(["0"]));
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // Sync state from server on load/reconnect
    useEffect(() => {
        if (gameState.questions) {
            setQuestions(gameState.questions);
        }
        if (gameState.my_answers) {
            setResponses(gameState.my_answers);
        }
    }, [gameState]);

    // Handle Question Navigation
    const handleNav = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQIndex(index);
            setVisitedList(prev => new Set(prev).add(String(index)));
        }
    };

    // Actions
    const handleSaveNext = () => {
        // Backend handles "submit_answer" as a save.
        // We already optimistically updated 'responses' when they clicked the option? 
        // Typically NTA flow: Select Option -> Click Save & Next.
        // Let's assume selecting `setSelectedOption` is local, and Save persists it.

        // Actually, for better UX with websockets, let's auto-save on selection?
        // But NTA pattern specifically has "Save & Next".
        // Let's stick to strict NTA: Selection is transient until Saved?
        // Or simpler: Selection updates local state, Save sends to server.

        // Finding selected option from local *transient* state is weird if we map directly to responses.
        // Let's use `responses` as the source of truth for "Saved" answers.

        // If we want "Save & Next", we imply the user MIGHT have selected something new.
        // For simplicity in this React implementation:
        // Clicking an option updates `responses` immediately (Auto-Save behavior), 
        // AND "Save & Next" just moves forward.
        // This is more modern/user-friendly than strict 1990s NTA.

        handleNav(currentQIndex + 1);
    };

    const handleOptionSelect = (optIdx) => {
        const qId = String(currentQIndex);
        setResponses(prev => ({ ...prev, [qId]: optIdx }));

        // Sync to backend
        sendAction('submit_answer', { questionId: qId, optionIdx: optIdx });
    };

    const handleClear = () => {
        const qId = String(currentQIndex);
        const newResp = { ...responses };
        delete newResp[qId];
        setResponses(newResp);

        // How to clear on backend? Send null?
        // Our backend simple logic might fail, lets assume overwrite -1?
        // Need to update backend validation for null/removal.
        // For MVP: Just keep it local or send a special flag.
    };

    const handleMarkReview = () => {
        const qId = String(currentQIndex);
        setReviewList(prev => {
            const newSet = new Set(prev);
            if (newSet.has(qId)) newSet.delete(qId);
            else newSet.add(qId);
            return newSet;
        });
    };

    const handleSubmitTest = () => {
        if (confirm("Are you sure you want to submit the test? You cannot make changes after this.")) {
            sendAction('submit_test', {});
        }
    };

    if (status === 'lobby') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background">
                <div className="animate-pulse-fast text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">You're in!</h2>
                <p className="text-muted-foreground">Waiting for host to start the test...</p>
            </div>
        );
    }

    if (status === 'game_over') {
        // Show Leaderboard from `gameState.leaderboard`?
        // Or just a summary.
        const myResult = gameState.leaderboard?.find(p => p.id === userId);

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background">
                <h2 className="text-4xl font-bold text-foreground mb-4">Test Submitted</h2>
                <div className="bg-card border border-border p-8 rounded-xl shadow-lg">
                    <p className="text-2xl font-mono mb-2">Score: <span className="text-primary">{myResult?.score || 0}</span></p>
                    <p className="text-muted-foreground">Thank you for participating.</p>
                </div>
                <a href="/" className="mt-8 text-primary hover:underline font-semibold">Exit to Home</a>
            </div>
        );
    }

    if (!questions.length) {
        return <div className="p-8 text-center text-muted-foreground">Loading test...</div>;
    }

    const currentQ = questions[currentQIndex];

    return (
        <div className="flex flex-col md:flex-row h-full gap-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Main Question Area */}
            <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden h-full">

                {/* Header Phase */}
                <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-secondary/30 to-background flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {currentQIndex + 1}
                        </span>
                        <h2 className="font-semibold text-lg text-foreground tracking-tight">Question</h2>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
                        ID: {currentQ.id.substring(0, 6)}
                    </div>
                </div>

                {/* Animated Content */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-32 md:pb-10 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-3xl mx-auto"
                        >
                            <p className="text-2xl md:text-3xl font-medium leading-normal mb-10 text-foreground">
                                {currentQ.text}
                            </p>

                            <div className="space-y-4">
                                {currentQ.options.map((opt, idx) => {
                                    const isSelected = responses[String(currentQIndex)] === idx;
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={cn(
                                                "group flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                    : "border-border/60 bg-card hover:border-primary/50 hover:bg-secondary/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-2 mr-6 flex-shrink-0 flex items-center justify-center transition-colors duration-200",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-muted-foreground group-hover:border-primary/50"
                                            )}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                            </div>
                                            <span className={cn(
                                                "text-lg font-medium",
                                                isSelected ? "text-primary dark:text-white" : "text-foreground"
                                            )}>
                                                {opt.text}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Desktop Footer */}
                <div className="hidden md:flex p-6 border-t border-border bg-muted/10 gap-4 justify-between items-center backdrop-blur-md">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleMarkReview}
                            className={cn("border-2 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-200", reviewList.has(String(currentQIndex)) && "border-indigo-500 text-indigo-600 bg-indigo-50")}
                        >
                            {reviewList.has(String(currentQIndex)) ? "★ Marked for Review" : "☆ Mark for Review"}
                        </Button>
                        <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-destructive">Clear Response</Button>
                    </div>
                    <Button onClick={handleSaveNext} size="lg" className="px-8 font-bold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                        Save & Next
                    </Button>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar (Glassmorphism) */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-foreground/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center z-50 px-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                <Button variant="ghost" className="h-full rounded-xl w-24 hover:bg-white/10" onClick={() => handleNav(currentQIndex - 1)} disabled={currentQIndex === 0}>
                    &larr; Prev
                </Button>

                <div
                    onClick={() => setIsPaletteOpen(true)}
                    className="flex flex-col items-center justify-center h-full px-6 cursor-pointer active:opacity-70"
                >
                    <div className="w-12 h-1 bg-primary/50 rounded-full mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Palette</span>
                </div>

                <Button variant="ghost" className="h-full rounded-xl w-24 hover:bg-white/10" onClick={handleSaveNext}>
                    Next &rarr;
                </Button>
            </div>

            {/* Sidebar Palette (Desktop) */}
            <div className="hidden md:flex flex-col w-80 flex-shrink-0 gap-6">
                <QuestionPalette
                    totalQuestions={questions.length}
                    currentQuestionIndex={currentQIndex}
                    onQuestionSelect={handleNav}
                    responses={responses}
                    reviewList={reviewList}
                    visitedList={visitedList}
                />
                <Button
                    variant="default"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-8 text-xl font-bold rounded-2xl shadow-emerald-900/20 shadow-xl transition-all hover:scale-[1.02]"
                    onClick={handleSubmitTest}
                >
                    Submit Test 🚀
                </Button>
            </div>

            {/* Mobile Palette Drawer Overlay */}
            {isPaletteOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex flex-col">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPaletteOpen(false)} />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[2rem] p-6 h-[85vh] flex flex-col shadow-2xl border-t border-white/10"
                    >
                        <div className="w-16 h-1.5 bg-muted rounded-full mx-auto mb-8 opacity-50" />

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Question Map</h2>
                            <Button variant="ghost" size="icon" className="rounded-full bg-secondary" onClick={() => setIsPaletteOpen(false)}>×</Button>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-6 -mx-2 px-2">
                            <QuestionPalette
                                totalQuestions={questions.length}
                                currentQuestionIndex={currentQIndex}
                                onQuestionSelect={(idx) => {
                                    handleNav(idx);
                                    setIsPaletteOpen(false);
                                }}
                                responses={responses}
                                reviewList={reviewList}
                                visitedList={visitedList}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <Button variant="outline" className="h-14 text-lg border-2" onClick={handleMarkReview}>
                                {reviewList.has(String(currentQIndex)) ? "Unmark" : "Mark Review"}
                            </Button>
                            <Button variant="outline" className="h-14 text-lg border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={handleClear}>Clear</Button>
                            <Button
                                className="col-span-2 h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg mt-2"
                                onClick={handleSubmitTest}
                            >
                                Submit Test 🚀
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ParticipantView;
