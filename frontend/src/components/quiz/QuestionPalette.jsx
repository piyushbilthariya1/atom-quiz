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

    const getStatusColor = (index) => {
        const qId = str(index);
        const isAnswered = responses[qId] !== undefined;
        const isMarked = reviewList.has(qId);
        const isVisited = visitedList.has(qId);
        const isCurrent = currentQuestionIndex === index;

        if (isCurrent) return "ring-2 ring-primary ring-offset-2";

        if (isMarked) {
            return isAnswered ? "bg-purple-600 text-white" : "bg-purple-400 text-white";
        }
        if (isAnswered) return "bg-green-500 text-white";
        if (isVisited) return "bg-red-500 text-white"; // Visited but not answered

        return "bg-secondary text-secondary-foreground"; // Not visited
    };

    // Helper since we index usually by string in map
    const str = (i) => String(i);

    return (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full">
            <h3 className="font-bold text-foreground mb-4">Question Palette</h3>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-[300px] pr-2">
                {Array.from({ length: totalQuestions }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onQuestionSelect(idx)}
                        className={cn(
                            "h-10 w-10 rounded-md font-medium text-sm transition-all hover:brightness-110",
                            getStatusColor(idx)
                        )}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Not Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded-full" /> Marked for Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-secondary rounded-full" /> Not Visited</div>
            </div>
        </div>
    );
};

export default QuestionPalette;
