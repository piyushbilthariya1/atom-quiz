import { useEffect, useRef, useState, useCallback } from 'react';

export const useQuizSocket = (roomCode, userId) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState({
        status: 'lobby', // lobby, countdown, question, result, leaderboard
        participants: [],
        currentQuestion: null,
        leaderboard: [],
        timeLeft: 0
    });
    const [lastError, setLastError] = useState(null);

    useEffect(() => {
        if (!roomCode || !userId) return;

        // Connect to FastAPI WebSocket
        const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${wsBaseUrl}/ws/${roomCode}/${userId}`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            console.log("Connected to QuizPulse WebSocket");
            setIsConnected(true);
            setLastError(null);
        };

        socketRef.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleServerMessage(message);
            } catch (err) {
                console.error("Failed to parse WS message:", err);
            }
        };

        socketRef.current.onclose = () => {
            console.log("Disconnected from QuizPulse WebSocket");
            setIsConnected(false);
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket Error:", error);
            setLastError("Connection Error");
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [roomCode, userId]);

    const handleServerMessage = (message) => {
        // console.log("Received:", message.type, message.payload); // Debug logging
        switch (message.type) {
            case 'state_sync':
                // Initial state recovery or reconnnect
                setGameState(prev => ({ ...prev, ...message.payload }));
                break;
            case 'participant_update':
                setGameState(prev => ({ ...prev, participants: message.payload }));
                break;
            case 'game_start':
                // NTA Flow: Start = Active, Payload contains questions
                setGameState(prev => ({
                    ...prev,
                    status: 'active',
                    ...message.payload
                }));
                break;
            // Legacy/Unused cases removed or kept minimal
            case 'new_question':
                // If we ever revert to sync flow
                setGameState(prev => ({
                    ...prev,
                    status: 'question',
                    currentQuestion: message.payload.question
                }));
                break;
            case 'leaderboard_update':
                setGameState(prev => ({ ...prev, leaderboard: message.payload }));
                break;
            case 'game_over':
                setGameState(prev => ({
                    ...prev,
                    status: 'game_over',
                    ...message.payload
                }));
                break;
            default:
                console.warn("Unknown message type:", message.type);
        }
    };

    const sendAction = useCallback((type, payload) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.warn("Cannot send message: WebSocket not open");
        }
    }, []);

    return { isConnected, gameState, sendAction, lastError };
};
