import React from 'react';
import { cn } from '@/lib/utils';

const QuestionPalette = ({
    totalQuestions,
    currentQuestionIndex,
    onQuestionSelect,
    responses,
    reviewList,
    visitedList
}) => {
    const str = (i) => String(i);

    const getStatus = (index) => {
        const qId = str(index);
        const isAnswered = responses[qId] !== undefined && responses[qId] !== -1;
        const isMarked = reviewList.has(qId);
        const isVisited = visitedList.has(qId);
        const isCurrent = currentQuestionIndex === index;

        if (isMarked) return { status: 'review', isCurrent };
        if (isAnswered) return { status: 'answered', isCurrent };
        if (isVisited) return { status: 'skipped', isCurrent };
        return { status: 'not_visited', isCurrent };
    };

    const statusStyles = {
        answered: 'bg-emerald-500 text-white shadow-emerald-500/20 border-emerald-500',
        skipped: 'bg-[#F25623] text-white shadow-[#F25623]/20 border-[#F25623]',
        review: 'bg-indigo-500 text-white shadow-indigo-500/20 border-indigo-500',
        not_visited: 'bg-[#111111] text-[#A3A3A3] border-[#1F1F1F] hover:bg-[#1a1a1a] hover:border-[#333]',
    };

    // Count stats
    const stats = { answered: 0, skipped: 0, review: 0, not_visited: 0 };
    for (let i = 0; i < totalQuestions; i++) {
        stats[getStatus(i).status]++;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-1 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-[#F25623] rounded-full" />
                    Questions
                </h3>
                <p className="text-[10px] text-[#A3A3A3]/50 mt-1.5 ml-3.5">
                    {stats.answered} of {totalQuestions} answered
                </p>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: totalQuestions }).map((_, idx) => {
                        const { status, isCurrent } = getStatus(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => onQuestionSelect(idx)}
                                className={cn(
                                    "relative aspect-square rounded-lg border text-[13px] font-bold transition-all duration-200 flex items-center justify-center",
                                    statusStyles[status],
                                    isCurrent && "ring-2 ring-white ring-offset-1 ring-offset-[#0A0A0B] scale-105 z-10"
                                )}
                            >
                                {idx + 1}
                                {/* Review ping indicator */}
                                {reviewList.has(str(idx)) && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400 border border-[#0A0A0B]"></span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="pt-4 mt-4 border-t border-[#1F1F1F]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {[
                        { color: 'bg-emerald-500', label: 'Answered', count: stats.answered },
                        { color: 'bg-[#F25623]', label: 'Skipped', count: stats.skipped },
                        { color: 'bg-indigo-500', label: 'For Review', count: stats.review },
                        { color: 'bg-[#111111] border border-[#1F1F1F]', label: 'Not Visited', count: stats.not_visited },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-[3px] shrink-0", item.color)} />
                            <span className="text-[10px] text-[#A3A3A3] font-medium">{item.label}</span>
                            <span className="text-[10px] text-[#A3A3A3]/30 font-bold ml-auto">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
