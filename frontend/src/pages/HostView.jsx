import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, SkipForward, Users, Trophy } from 'lucide-react';
import { Button, Card } from '@/components/ui/Components';
import { motion } from 'framer-motion';

const HostView = ({ gameState, sendAction, roomCode }) => {
    const { status, participants, currentQuestion, leaderboard } = gameState;

    const handleStartGame = () => sendAction('start_game', {});
    const handleNextQuestion = () => sendAction('next_question', {});

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Host Panel</h2>
                    <p className="text-4xl font-mono font-bold text-foreground mt-1">Room: {roomCode}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-muted-foreground bg-secondary px-4 py-2 rounded-full border border-border">
                        <Users className="w-5 h-5 mr-2" />
                        <span className="text-xl font-bold text-foreground">{participants?.length || 0}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center">

                {status === 'lobby' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Card className="text-center p-12 min-w-[400px] border-border bg-card shadow-lg">
                            <h3 className="text-2xl font-semibold mb-6 text-foreground">Waiting for players...</h3>
                            <Button size="lg" onClick={handleStartGame} className="w-full text-lg h-14 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                                <Play className="mr-2 fill-current" /> START GAME
                            </Button>
                        </Card>
                        <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-2xl">
                            {participants?.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-secondary px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground"
                                >
                                    {p.nickname || p.id}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {status === 'countdown' && (
                    <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-300">
                        <div className="text-9xl font-black text-foreground tabular-nums tracking-tighter">
                            <CountdownTimer duration={5} onComplete={handleNextQuestion} />
                        </div>
                        <h2 className="text-3xl font-bold text-muted-foreground mt-8 uppercase tracking-widest animate-pulse">Get Ready!</h2>
                    </div>
                )}

                {status === 'question' && currentQuestion && (
                    <div className="w-full max-w-5xl space-y-8">
                        <motion.h2
                            key={currentQuestion.text}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-5xl font-bold text-center leading-tight text-foreground"
                        >
                            {currentQuestion.text}
                        </motion.h2>

                        <div className="grid grid-cols-2 gap-4">
                            {currentQuestion.options.map((opt, idx) => (
                                <div key={idx} className="p-8 bg-card border border-border rounded-xl text-2xl text-center font-medium text-foreground hover:bg-zinc-800 transition-colors">
                                    <span className="inline-block w-8 h-8 rounded-full bg-secondary text-base align-middle mr-3 leading-8 text-muted-foreground">{["A", "B", "C", "D"][idx]}</span>
                                    {opt.text}
                                </div>
                            ))}
                        </div>

                        {/* Host Controls */}
                        <div className="flex justify-center mt-8">
                            <Button onClick={handleNextQuestion} variant="secondary" className="border border-border">
                                Skip / Next
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'leaderboard' && (
                    <div className="w-full max-w-2xl">
                        <h2 className="text-3xl font-bold text-center mb-8 text-foreground"><Trophy className="inline mb-1 text-primary" /> Leaderboard</h2>
                        <div className="space-y-2">
                            {leaderboard.map((entry, idx) => (
                                <motion.div
                                    key={entry.user_id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex justify-between items-center p-4 bg-card rounded-lg border border-border"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-muted-foreground w-6">#{idx + 1}</span>
                                        <span className="font-bold text-lg text-foreground">{entry.nickname}</span>
                                    </div>
                                    <span className="font-mono text-primary font-bold">{entry.score} pts</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-8">
                            <Button onClick={handleNextQuestion} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Next Question <SkipForward className="ml-2 w-4 h-4" />
                            </Button>
                            <Button onClick={() => sendAction('game_over', {})} variant="destructive" size="lg">
                                End Game
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'game_over' && (
                    <div className="w-full max-w-2xl text-center animate-in zoom-in duration-500">
                        <h2 className="text-5xl font-black text-foreground mb-8 tracking-tighter">GAME OVER</h2>

                        <div className="bg-card p-8 rounded-2xl border border-border mb-8 shadow-2xl">
                            <Trophy className="w-24 h-24 text-primary mx-auto mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-muted-foreground">Winner</h3>
                            <p className="text-4xl font-bold text-foreground mt-2">
                                {leaderboard[0]?.nickname || "No one?"}
                            </p>
                            <p className="text-xl text-primary mt-1 font-mono">{leaderboard[0]?.score || 0} pts</p>
                        </div>

                        <Link to="/admin/dashboard">
                            <Button size="lg" variant="secondary" className="w-full max-w-xs border border-border">
                                Return to Dashboard
                            </Button>
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
};


const CountdownTimer = ({ duration, onComplete }) => {
    const [count, setCount] = useState(duration);

    useEffect(() => {
        if (count <= 0) {
            onComplete?.();
            return;
        }
        const timer = setInterval(() => {
            setCount((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [count, onComplete]);

    return <>{count}</>;
};

export default HostView;
