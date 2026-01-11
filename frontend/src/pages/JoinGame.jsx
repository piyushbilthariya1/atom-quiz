import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui/Components';
import { Gamepad2 } from 'lucide-react';

const JoinGame = () => {
    const [roomCode, setRoomCode] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomCode.trim() && nickname.trim()) {
            navigate(`/play/${roomCode}?userId=${nickname}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-[400px] p-8 border-border bg-card shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Gamepad2 className="w-6 h-6 text-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Join Quiz</h1>
                    <p className="text-muted-foreground text-sm">Enter code to join the game</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-4">
                        <Input
                            placeholder="ROOM CODE (E.G., A1B2)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="h-12 text-center tracking-widest uppercase bg-secondary/50 border-input placeholder:text-muted-foreground"
                            maxLength={6}
                        />
                        <Input
                            placeholder="Your Nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="h-12 text-center bg-secondary/50 border-input placeholder:text-muted-foreground"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
                        disabled={!roomCode || !nickname}
                    >
                        JOIN GAME
                    </Button>
                </form>


            </Card>
        </div>
    );
};

export default JoinGame;
