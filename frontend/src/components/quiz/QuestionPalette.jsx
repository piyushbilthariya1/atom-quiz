import React from 'react';
import { cn } from '@/lib/utils'; // Assuming Shadcn util exists


const QuestionPalette = ({
    totalQuestions,
    currentQuestionIndex,
    onQuestionSelect,
    responses,
    reviewList,
    visitedList
}) => {
    // Helper since we index usually by string in map
    const str = (i) => String(i);

    const getStatusClass = (index) => {
        const qId = str(index);
        const isAnswered = responses[qId] !== undefined;
        const isMarked = reviewList.has(qId);
        const isVisited = visitedList.has(qId);
        const isCurrent = currentQuestionIndex === index;

        let baseClass = "relative flex items-center justify-center font-bold text-sm transition-all shadow-sm";

        // Shape
        // isCurrent ? 'rounded-xl scale-110 z-10' : 'rounded-lg'
        /* 
           Using a comprehensive logic:
           1. Current: Ring & slightly larger
           2. Mark + Answered: Purple with Check
           3. Mark + Not Answered: Purple hollow
           4. Answered: Green
           5. Visited (Skipped): Red/Orange
           6. Not Visited: Gray
        */

        if (isCurrent) {
            baseClass += " ring-2 ring-primary ring-offset-2 ring-offset-background z-10 scale-105";
        }

        if (isMarked) {
            return cn(baseClass, "bg-indigo-600 text-white shadow-indigo-500/20");
        }
        if (isAnswered) {
            return cn(baseClass, "bg-emerald-500 text-white shadow-emerald-500/20");
        }
        if (isVisited) {
            // Seen but no answer implies "Skipped" for now
            return cn(baseClass, "bg-amber-500 text-white shadow-amber-500/20");
        }

        return cn(baseClass, "bg-accent text-muted-foreground border border-border/50 hover:bg-accent/80");
    };

    return (
        <div className="bg-card border border-border rounded-xl flex flex-col h-full shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full" /> Question Palette
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-5 gap-3 content-start">
                    {Array.from({ length: totalQuestions }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => onQuestionSelect(idx)}
                            className={cn(
                                "aspect-square rounded-lg",
                                getStatusClass(idx)
                            )}
                        >
                            {idx + 1}
                            {/* Dot indicator for reviewed items */}
                            {reviewList.has(str(idx)) && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm shadow-sm" />
                        <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-sm shadow-sm" />
                        <span>Skipped</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-sm shadow-sm" />
                        <span>For Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent border border-border rounded-sm" />
                        <span>Not Visited</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
