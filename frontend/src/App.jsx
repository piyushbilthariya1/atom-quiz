import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QuizBuilder from './pages/QuizBuilder';
import GameRoom from './pages/GameRoom';
import JoinGame from './pages/JoinGame';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background text-white selection:bg-primary/30">
                <Routes>
                    {/* User / Participant Routes */}
                    <Route path="/" element={<JoinGame />} />
                    <Route path="/play/:roomCode" element={<GameRoom isHost={false} />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<Dashboard />} />
                        <Route path="/admin/create" element={<QuizBuilder />} />
                        <Route path="/admin/host/:roomCode" element={<GameRoom isHost={true} />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
