const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
    getQuizzes: async () => {
        const res = await fetch(`${API_URL}/api/quizzes/`);
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        return res.json();
    },

    getQuiz: async (id) => {
        const res = await fetch(`${API_URL}/api/quizzes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch quiz');
        return res.json();
    },

    createQuiz: async (quizData) => {
        const res = await fetch(`${API_URL}/api/quizzes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData),
        });
        if (!res.ok) throw new Error('Failed to create quiz');
        return res.json();
    },

    deleteQuiz: async (id) => {
        const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete quiz');
        return true;
    },

    createRoom: async (quizId) => {
        const res = await fetch(`${API_URL}/api/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_id: quizId }),
        });
        if (!res.ok) throw new Error('Failed to create room');
        return res.json();
    }
};
