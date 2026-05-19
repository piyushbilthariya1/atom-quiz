import React, { useState, useRef } from 'react';
import { 
    ArrowLeft, Save, Plus, Trash2, 
    CheckCircle2, GripVertical, Copy, 
    Edit2, X, ChevronUp, ChevronDown,
    Settings2, Layout, Image as ImageIcon, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from '@/components/ui/Components';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

// ── Input components defined OUTSIDE the main component to prevent remounting ──
const BaseInput = ({ className, ...props }) => (
    <input 
        className={cn("w-full bg-[#050505] border border-[#1F1F1F] rounded-lg px-4 focus:outline-none focus:border-[#F25623]/50 text-white placeholder-[#A3A3A3]/50 transition-all", className)} 
        {...props} 
    />
);

const BaseTextarea = ({ className, ...props }) => (
    <textarea 
        className={cn("w-full bg-[#050505] border border-[#1F1F1F] rounded-lg p-4 focus:outline-none focus:border-[#F25623]/50 text-white placeholder-[#A3A3A3]/50 transition-all resize-none", className)} 
        {...props} 
    />
);

const QuizBuilder = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // UI State
    const [isEditingQuestion, setIsEditingQuestion] = useState(null);
    const [qText, setQText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIdx, setCorrectIdx] = useState(0);

    const sidebarRef = useRef(null);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddOrUpdateQuestion = () => {
        if (!qText.trim()) {
            toast("Please enter a question", "error");
            return;
        }
        if (options.some(opt => !opt.trim())) {
            toast("Please fill in all 4 options", "error");
            return;
        }

        const newQuestion = {
            id: isEditingQuestion !== null ? questions[isEditingQuestion].id : Math.random().toString(36).substr(2, 9),
            text: qText,
            options: options.map((opt, idx) => ({
                text: opt,
                is_correct: idx === correctIdx
            })),
            points: 100,
            time_limit: 30,
            difficulty: 'medium'
        };

        if (isEditingQuestion !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[isEditingQuestion] = newQuestion;
            setQuestions(updatedQuestions);
            setIsEditingQuestion(null);
            toast("Question updated!", "success");
        } else {
            setQuestions([...questions, newQuestion]);
            toast("Question added!", "success");
        }

        setQText('');
        setOptions(['', '', '', '']);
        setCorrectIdx(0);
    };

    const handleEditClick = (idx) => {
        const q = questions[idx];
        setQText(q.text);
        setOptions(q.options.map(o => o.text));
        setCorrectIdx(q.options.findIndex(o => o.is_correct));
        setIsEditingQuestion(idx);
        
        if (sidebarRef.current) {
            sidebarRef.current.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

    const handleDuplicate = (idx) => {
        const q = JSON.parse(JSON.stringify(questions[idx]));
        q.id = Math.random().toString(36).substr(2, 9);
        const newQuestions = [...questions];
        newQuestions.splice(idx + 1, 0, q);
        setQuestions(newQuestions);
        toast("Question duplicated", "info");
    };

    const handleDeleteQuestion = (idxToDelete) => {
        setQuestions(questions.filter((_, idx) => idx !== idxToDelete));
        if (isEditingQuestion === idxToDelete) {
            setIsEditingQuestion(null);
            setQText('');
            setOptions(['', '', '', '']);
            setCorrectIdx(0);
        }
        toast("Question removed", "info");
    };

    const handleCancelEdit = () => {
        setIsEditingQuestion(null);
        setQText('');
        setOptions(['', '', '', '']);
        setCorrectIdx(0);
    };

    const handleSaveQuiz = async () => {
        if (!title.trim()) {
            toast("Please add a quiz title", "error");
            return;
        }
        if (questions.length === 0) {
            toast("Add at least one question", "error");
            return;
        }

        setLoading(true);
        try {
            const quizData = {
                title,
                description,
                topic: "Manual",
                questions: questions
            };

            await api.createQuiz(quizData);
            toast("Quiz saved successfully!", "success");
            navigate('/admin/dashboard');
        } catch (err) {
            toast("Failed to save quiz. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#F25623]/30">
            <div className="flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="px-8 py-4 border-b border-[#1F1F1F] flex justify-between items-center bg-[#050505] shrink-0 z-50">
                    <div className="flex items-center gap-6">
                        <Link to="/admin/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#1F1F1F]">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-display font-black tracking-tight text-white flex items-center gap-2">
                                <Layout className="w-5 h-5 text-[#F25623]" />
                                {title || 'New Quiz'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-[#1F1F1F] border-none text-[#A3A3A3] text-[10px] uppercase font-bold tracking-widest">{questions.length} Questions</Badge>
                                {isEditingQuestion !== null && <Badge className="bg-[#F25623]/20 text-[#F25623] border-none animate-pulse text-[10px] uppercase font-bold">Editing</Badge>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleSaveQuiz} disabled={loading} className="px-8 rounded-lg bg-[#F25623] text-white shadow-lg shadow-[#F25623]/20 hover:bg-[#F25623]/90 active:scale-95 transition-all font-bold text-sm h-10">
                            {loading ? 'Saving...' : 'Save Quiz'}
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Editor */}
                    <aside ref={sidebarRef} className="w-full lg:w-[450px] border-r border-[#1F1F1F] p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-[#000000]">
                        <div className="space-y-10">
                            <section>
                                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-[0.2em] mb-4 block">Quiz Details</label>
                                <div className="space-y-4">
                                    <BaseInput
                                        placeholder="Quiz Title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-lg font-bold h-12"
                                    />
                                    <BaseTextarea
                                        placeholder="Short description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-24 text-sm"
                                    />
                                </div>
                            </section>

                            <section className={cn("bg-[#050505] border border-[#1F1F1F] rounded-xl p-6 shadow-xl transition-all", isEditingQuestion !== null && "border-[#F25623]/50 ring-1 ring-[#F25623]/20")}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-[10px] font-bold text-[#F25623] uppercase tracking-[0.2em] block">
                                        {isEditingQuestion !== null ? `Editing Question #${isEditingQuestion + 1}` : 'Add New Question'}
                                    </label>
                                </div>
                                
                                <div className="space-y-6">
                                    <BaseTextarea
                                        placeholder="Type your question here..."
                                        value={qText}
                                        onChange={(e) => setQText(e.target.value)}
                                        className="text-base font-medium min-h-[100px] bg-[#000000]"
                                    />

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Answer Options</label>
                                            <span className="text-[10px] text-[#F25623] font-bold uppercase">Click = Correct</span>
                                        </div>
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="group relative flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setCorrectIdx(idx)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-all font-bold text-sm",
                                                        correctIdx === idx 
                                                            ? "bg-[#F25623] border-[#F25623] text-white shadow-lg shadow-[#F25623]/20" 
                                                            : "bg-[#000000] border-[#1F1F1F] text-[#A3A3A3] hover:border-[#1F1F1F]/80"
                                                    )}
                                                >
                                                    {String.fromCharCode(65 + idx)}
                                                </button>
                                                <BaseInput
                                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    className={cn("h-10 bg-[#000000]", correctIdx === idx && "border-[#F25623]/30 bg-[#F25623]/5 text-white")}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleAddOrUpdateQuestion} className="flex-1 h-12 rounded-lg text-sm font-bold bg-white text-black hover:bg-white/90">
                                            {isEditingQuestion !== null ? 'Save Changes' : 'Add Question'}
                                        </Button>
                                        {isEditingQuestion !== null && (
                                            <Button 
                                                variant="ghost" 
                                                onClick={handleCancelEdit}
                                                className="h-12 w-12 bg-[#1F1F1F] hover:bg-[#1F1F1F]/80 rounded-lg"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </aside>

                    {/* Right: List / Preview */}
                    <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-[#050505]" id="scroll-container">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                                    Questions List
                                </h3>
                                <p className="text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">Drag to Reorder</p>
                            </div>

                            <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-4" layoutScroll>
                                <AnimatePresence mode="popLayout">
                                    {questions.map((q, idx) => (
                                        <Reorder.Item
                                            key={q.id}
                                            value={q}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="cursor-default"
                                        >
                                            <div className="group relative overflow-hidden bg-[#000000] border border-[#1F1F1F] rounded-xl hover:border-[#1F1F1F]/80 transition-all p-5">
                                                <div className="flex gap-5">
                                                    <div className="flex flex-col items-center gap-2 pt-1">
                                                        <div className="w-8 h-8 bg-[#050505] border border-[#1F1F1F] rounded-lg flex items-center justify-center font-bold font-mono text-[#F25623]">
                                                            {idx + 1}
                                                        </div>
                                                        <GripVertical className="w-4 h-4 text-[#A3A3A3]/30 group-hover:text-[#F25623] cursor-grab active:cursor-grabbing transition-colors" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="font-bold text-lg leading-snug pr-12 text-white group-hover:text-[#F25623] transition-colors">{q.text}</h4>
                                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button 
                                                                    variant="ghost" size="icon" 
                                                                    className="h-8 w-8 bg-[#050505] border border-[#1F1F1F] rounded-lg text-[#A3A3A3] hover:text-white"
                                                                    onClick={() => handleDuplicate(idx)}
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" size="icon" 
                                                                    className="h-8 w-8 bg-[#050505] border border-[#1F1F1F] rounded-lg text-[#A3A3A3] hover:text-[#F25623]"
                                                                    onClick={() => handleEditClick(idx)}
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" size="icon" 
                                                                    className="h-8 w-8 bg-[#050505] border border-[#1F1F1F] rounded-lg text-[#A3A3A3] hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10"
                                                                    onClick={() => handleDeleteQuestion(idx)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div
                                                                    key={oIdx}
                                                                    className={cn(
                                                                        "p-2.5 px-4 rounded-lg border text-xs transition-all flex justify-between items-center",
                                                                        opt.is_correct
                                                                            ? "bg-[#F25623]/10 border-[#F25623]/30 text-[#F25623] font-bold"
                                                                            : "bg-[#050505] border-[#1F1F1F] text-[#A3A3A3]"
                                                                    )}
                                                                >
                                                                    <span className="line-clamp-1">{opt.text}</span>
                                                                    {opt.is_correct && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </AnimatePresence>
                            </Reorder.Group>

                            {questions.length === 0 && (
                                <div className="text-center py-24 bg-[#000000] border border-dashed border-[#1F1F1F] rounded-2xl group hover:border-[#1F1F1F]/80 transition-all">
                                    <div className="w-16 h-16 bg-[#050505] rounded-xl flex items-center justify-center mx-auto mb-6 border border-[#1F1F1F] group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6 text-[#A3A3A3] group-hover:text-[#F25623] transition-colors" />
                                    </div>
                                    <h4 className="text-xl font-black text-white/50 mb-2">No questions yet</h4>
                                    <p className="text-[#A3A3A3] text-sm max-w-xs mx-auto">Use the editor on the left to add your first question.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
