import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QuizBuilder from './pages/QuizBuilder';
import GameRoom from './pages/GameRoom';
import JoinGame from './pages/JoinGame';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Login from './pages/Login';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ToastProvider } from './components/ui/Toast';

function App() {
    return (
        <ToastProvider>
            <Router>
            <div className="min-h-screen bg-[#000000] text-white selection:bg-[#F25623]/30">
                <Routes>
                    {/* Public Routes - redirect to dashboard if already logged in */}
                    <Route element={<PublicRoute />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register isParticipant={true} />} />
                    </Route>
                    {/* Participant Routes (Protected) */}
                    <Route element={<ProtectedRoute requireAdmin={false} />}>
                        <Route path="/join" element={<JoinGame />} />
                        <Route path="/play/:roomCode" element={<GameRoom isHost={false} />} />
                    </Route>

                    {/* Admin Routes (Private Paths) */}
                    <Route path="/secure/portal-login" element={<AdminLogin />} />
                    <Route path="/secure/portal-register" element={<Register isParticipant={false} />} />

                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<Dashboard />} />
                        <Route path="/admin/create" element={<QuizBuilder />} />
                        <Route path="/admin/host/:roomCode" element={<GameRoom isHost={true} />} />
                    </Route>
                </Routes>
            </div>
        </Router>
        </ToastProvider>
    );
}

export default App;
