import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuizSocket } from '@/hooks/useQuizSocket';
import HostView from './HostView';
import ParticipantView from './ParticipantView';

const GameRoom = ({ isHost: isHostProp }) => {
    const { roomCode } = useParams();
    const [searchParams] = useSearchParams();
    const isHost = isHostProp;

    // Mock User ID for demo – in real app, get from Context/Auth
    const [userId] = useState(() => searchParams.get('userId') || `guest_${Math.floor(Math.random() * 10000)}`);

    const { isConnected, gameState, sendAction, lastError } = useQuizSocket(roomCode, userId);

    if (lastError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 font-bold bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    Connection Error: {lastError}. Is the backend running?
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-primary font-mono">Connecting to Server...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-background to-background -z-10" />

            <div className="container mx-auto h-screen p-4 md:p-6">
                {isHost ? (
                    <HostView gameState={gameState} sendAction={sendAction} roomCode={roomCode} />
                ) : (
                    <ParticipantView gameState={gameState} sendAction={sendAction} userId={userId} />
                )}
            </div>
        </div>
    );
};

export default GameRoom;
