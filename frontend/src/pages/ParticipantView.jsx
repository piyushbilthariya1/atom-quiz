import React from 'react';
import { motion } from 'framer-motion';
import { useProctor } from '@/hooks/useProctor';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Components';

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
        <div className="flex flex-col md:flex-row h-full gap-4 p-4 max-w-7xl mx-auto">
            {/* Main Question Area */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
                    <h2 className="font-semibold text-lg">Question {currentQIndex + 1}</h2>
                    <div className="text-xs font-mono text-muted-foreground">ID: {currentQ.id}</div>
                </div>

                {/* Question Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8">{currentQ.text}</p>

                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = responses[String(currentQIndex)] === idx;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={cn(
                                        "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-zinc-800/50",
                                        isSelected
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center",
                                        isSelected ? "border-primary" : "border-muted-foreground"
                                    )}>
                                        {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-lg">{opt.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-border bg-secondary/10 flex flex-wrap gap-2 justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleMarkReview}>
                            {reviewList.has(String(currentQIndex)) ? "Unmark Review" : "Mark for Review"}
                        </Button>
                        <Button variant="ghost" onClick={handleClear}>Clear Response</Button>
                    </div>
                    <Button onClick={handleSaveNext} className="min-w-[120px]">Save & Next</Button>
                </div>
            </div>

            {/* Sidebar Palette */}
            <div className="w-full md:w-80 flex-shrink-0">
                <QuestionPalette
                    totalQuestions={questions.length}
                    currentQuestionIndex={currentQIndex}
                    onQuestionSelect={handleNav}
                    responses={responses}
                    reviewList={reviewList}
                    visitedList={visitedList}
                />

                <div className="mt-4">
                    <Button
                        variant="primary"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                        onClick={handleSubmitTest}
                    >
                        Submit Test
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantView;
