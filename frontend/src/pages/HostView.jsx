import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, StopCircle, CheckCircle2 } from 'lucide-react';
import { Button, Card } from '@/components/ui/Components';
import { motion } from 'framer-motion';

const HostView = ({ gameState, sendAction, roomCode }) => {
    const { status, participants, leaderboard } = gameState;

    const handleStartGame = () => sendAction('start_game', {});
    const handleForceSubmit = () => {
        if (confirm("End test for all users? This will force submit everyone.")) {
            sendAction('force_submit', {});
        }
    };

    // Calculate stats
    // Note: In NTA mode, backend sends 'participants' with 'answers' map.
    // 'currentQuestion' is irrelevant for Host now.

    // If we don't know total questions from gamestate directly (since we only sent sanitized questions to users),
    // we can infer it or we might need backend to send "quiz_meta".
    // For MVP, max answers count in any participant or just assume 5/10/whatever or undefined.
    // Ideally backend sends 'total_questions' in start payload.
    // Let's rely on finding standard max or just showing raw count.

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">War Room</h2>
                    <p className="text-4xl font-mono font-bold text-foreground mt-1">Room: {roomCode}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-muted-foreground bg-secondary px-4 py-2 rounded-full border border-border">
                        <Users className="w-5 h-5 mr-2" />
                        <span className="text-xl font-bold text-foreground">{participants?.length || 0}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col">

                {status === 'lobby' && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Card className="text-center p-12 min-w-[400px] border-border bg-card shadow-lg">
                                <h3 className="text-2xl font-semibold mb-6 text-foreground">Waiting for candidates...</h3>
                                <Button size="lg" onClick={handleStartGame} className="w-full text-lg h-14 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Play className="mr-2 fill-current" /> START TEST
                                </Button>
                            </Card>
                            <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-2xl">
                                {participants?.map((p, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-secondary px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground flex items-center gap-2"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        {p.nickname || p.id}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {status === 'active' && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-2xl font-bold text-foreground">Live Monitoring</h3>
                            <Button variant="destructive" onClick={handleForceSubmit}>
                                <StopCircle className="mr-2 h-4 w-4" /> END TEST
                            </Button>
                        </div>

                        <div className="bg-card border border-border rounded-xl flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {participants?.map((p) => {
                                    const answerCount = Object.keys(p.answers || {}).length;
                                    const isCompleted = p.completed;

                                    return (
                                        <div key={p.id} className="p-4 rounded-lg bg-secondary/20 border border-border flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-lg mb-1">{p.nickname}</div>
                                                <div className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded inline-block">
                                                    ID: {p.id.substring(0, 8)}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {isCompleted ? (
                                                    <div className="text-green-500 font-bold flex items-center justify-end gap-1">
                                                        <CheckCircle2 className="w-4 h-4" /> Submitted
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="text-2xl font-mono font-bold">{answerCount}</div>
                                                        <div className="text-xs text-muted-foreground">Answered</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {(status === 'leaderboard' || status === 'game_over') && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <h2 className="text-4xl font-bold text-foreground mb-8">Results</h2>
                        <div className="w-full max-w-3xl bg-card border border-border rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="p-4 font-bold text-muted-foreground">Rank</th>
                                        <th className="p-4 font-bold text-muted-foreground">Candidate</th>
                                        <th className="p-4 font-bold text-muted-foreground text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard?.map((p, idx) => (
                                        <tr key={p.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                                            <td className="p-4 font-mono text-muted-foreground">#{idx + 1}</td>
                                            <td className="p-4 font-medium">{p.nickname}</td>
                                            <td className="p-4 font-mono font-bold text-right text-primary">{p.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Link to="/admin/dashboard" className="mt-8">
                            <Button variant="outline">Return to Dashboard</Button>
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
};

export default HostView;
