import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, MoreVertical, Trash2 } from 'lucide-react';
import { Button, Card } from '@/components/ui/Components';
import { api } from '@/lib/api';

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await api.getQuizzes();
            setQuizzes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Prevent Link click
        if (confirm("Are you sure you want to delete this quiz?")) {
            await api.deleteQuiz(id);
            loadQuizzes();
        }
    };

    const navigate = useNavigate();
    const handleHost = async (quizId) => {
        try {
            const { room_code } = await api.createRoom(quizId);
            navigate(`/admin/host/${room_code}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create room.");
        }
    };

    return (
        <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage your organization's quizzes</p>
                    </div>
                    <Link to="/admin/create">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Create Quiz
                        </Button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <Card key={quiz._id} className="group hover:border-foreground/20 transition-all duration-300 cursor-pointer bg-card border-border flex flex-col p-6 shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {quiz.questions?.length || 0} Questions
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mt-1 -mr-2 h-8 w-8"
                                    onClick={(e) => handleDelete(e, quiz._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                                <div className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded">
                                    <span className="text-foreground font-bold">{quiz.plays || 0}</span> plays
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleHost(quiz._id)}
                                    className="gap-2"
                                >
                                    <Play className="h-3 w-3" /> Host
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {quizzes.length === 0 && !loading && (
                    <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-card/50">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2">No quizzes available</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Get started by creating your first quiz to host for your team.</p>
                        <Link to="/admin/create">
                            <Button className="min-w-[150px]">Create Quiz</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
