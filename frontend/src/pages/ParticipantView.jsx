import React from 'react';
import { motion } from 'framer-motion';
import { useProctor } from '@/hooks/useProctor';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Components';

const ParticipantView = ({ gameState, sendAction, userId }) => {
    const { status, currentQuestion, timeLeft } = gameState;

    // Integrity Hook
    useProctor(true, (violation) => {
        sendAction('log_violation', { type: violation.type, count: violation.count });
    });

    const handleAnswer = (optionIdx) => {
        sendAction('submit_answer', { questionId: currentQuestion?.id, optionIdx });
    };

    if (status === 'lobby') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background">
                <div className="animate-pulse-fast text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">You're in!</h2>
                <p className="text-muted-foreground">Waiting for host to start...</p>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background animate-pulse">
                <h2 className="text-4xl font-bold text-foreground mb-2">Game Starting!</h2>
                <p className="text-muted-foreground text-xl">Get your fingers ready...</p>
                <div className="mt-8 text-6xl">🚀</div>
            </div>
        );
    }

    if (status === 'game_over') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background">
                <h2 className="text-4xl font-bold text-foreground mb-4">Quiz Ended</h2>
                <p className="text-muted-foreground text-lg">Thanks for playing!</p>
                <div className="mt-8 text-6xl animate-bounce">👋</div>
                <a href="/" className="mt-8 text-primary hover:underline font-semibold">Exit to Home</a>
            </div>
        );
    }

    if (status === 'question' && currentQuestion) {
        return (
            <div className="flex flex-col h-full p-6 bg-background">
                <div className="w-full h-2 bg-secondary rounded-full mb-6 overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: timeLeft, ease: "linear" }}
                        className="h-full bg-primary"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] md:h-auto md:aspect-square max-h-[600px] w-full max-w-4xl mx-auto">
                        {currentQuestion.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={cn(
                                    "rounded-xl border-2 border-border bg-card hover:bg-zinc-800 transition-all active:scale-95 flex flex-col items-center justify-center p-6 md:p-8 group touch-manipulation",
                                    "min-h-[100px] md:min-h-0" // Ensure minimum hit area on mobile
                                )}
                            >
                                <span className="text-4xl md:text-5xl mb-2 text-muted-foreground group-hover:text-foreground font-bold">
                                    {["A", "B", "C", "D"][idx]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-background">
            <h2 className="text-xl font-bold text-foreground">Check the screen!</h2>
        </div>
    );
};

export default ParticipantView;
