import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui/Components';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const QuizBuilder = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);

    // New Question State
    const [qText, setQText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIdx, setCorrectIdx] = useState(0);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddQuestion = () => {
        if (!qText.trim() || options.some(opt => !opt.trim())) {
            alert("Please fill in the question and all options.");
            return;
        }

        const newQuestion = {
            text: qText,
            options: options.map((opt, idx) => ({
                text: opt,
                is_correct: idx === correctIdx
            })),
            points: 100,
            time_limit: 30,
            difficulty: 'medium'
        };

        setQuestions([...questions, newQuestion]);

        // Reset Form
        setQText('');
        setOptions(['', '', '', '']);
        setCorrectIdx(0);
    };

    const handleDeleteQuestion = (idxToDelete) => {
        setQuestions(questions.filter((_, idx) => idx !== idxToDelete));
    };

    const handleSaveQuiz = async () => {
        if (!title.trim() || questions.length === 0) {
            alert("Please add a title and at least one question.");
            return;
        }

        try {
            const quizData = {
                title,
                topic: "Manual",
                organization_id: "default_org", // Placeholder
                created_by: "admin", // Placeholder
                questions: questions
            };

            await api.createQuiz(quizData);
            alert("Quiz Saved Successfully!");
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to save quiz.");
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen">
            <Link to="/admin/dashboard">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-foreground text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>

            <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Create New Quiz</h1>
                    <Button onClick={handleSaveQuiz} className="bg-primary text-primary-foreground">
                        <Save className="mr-2 h-4 w-4" /> Save Quiz
                    </Button>
                </header>

                <div className="space-y-8">
                    {/* Quiz Meta */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Quiz Title</label>
                        <Input
                            placeholder="e.g., General Knowledge 2024"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg h-12"
                        />
                    </div>

                    {/* Question Form */}
                    <div className="bg-secondary/30 border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-6 text-foreground">Add New Question</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Question Text</label>
                                <Input
                                    placeholder="Enter your question here..."
                                    value={qText}
                                    onChange={(e) => setQText(e.target.value)}
                                    className="bg-background"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {options.map((opt, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={cn("text-xs font-medium", correctIdx === idx ? "text-primary" : "text-muted-foreground")}>
                                                Option {idx + 1} {correctIdx === idx && "(Correct Answer)"}
                                            </label>
                                            <button
                                                onClick={() => setCorrectIdx(idx)}
                                                className={cn(
                                                    "text-xs px-2 py-0.5 rounded transition-colors border",
                                                    correctIdx === idx ? "bg-primary/10 border-primary/20 text-primary" : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                )}
                                            >
                                                Set Correct
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                placeholder={`Option ${idx + 1}`}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className={cn(
                                                    "bg-background pr-10 border-input",
                                                    correctIdx === idx && "border-primary ring-1 ring-primary"
                                                )}
                                            />
                                            {correctIdx === idx && (
                                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={handleAddQuestion} variant="outline" className="w-full mt-4 border-dashed">
                                <Plus className="mr-2 h-4 w-4" /> Add Question
                            </Button>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            Questions <span className="text-sm bg-secondary px-2 py-0.5 rounded-full text-muted-foreground border border-border">{questions.length}</span>
                        </h3>
                        <AnimatePresence>
                            {questions.map((q, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative group"
                                >
                                    <Card className="relative overflow-hidden hover:border-foreground/20 transition-colors bg-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-semibold text-lg max-w-[90%] text-foreground"><span className="text-muted-foreground mr-2 font-mono">#{idx + 1}</span> {q.text}</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteQuestion(idx)}
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mt-2 -mr-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div
                                                    key={oIdx}
                                                    className={cn(
                                                        "p-3 rounded-md border text-sm font-medium",
                                                        opt.is_correct
                                                            ? "bg-primary/5 border-primary/20 text-primary"
                                                            : "bg-secondary/50 border-input text-muted-foreground"
                                                    )}
                                                >
                                                    {opt.text}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {questions.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-secondary/10">
                                Your quiz is empty. Add a question above to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
