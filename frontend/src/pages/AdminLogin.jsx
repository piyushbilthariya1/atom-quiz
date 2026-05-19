import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui/Components';
import { ShieldAlert, Mail, Lock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const AdminLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api.login(identifier, password);
            if (data.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Unauthorized: Admin access required');
                api.logout();
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0B] relative overflow-hidden">
             {/* Security Atmosphere */}
             <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />

            <Card className="w-full max-w-[420px] p-8 border-red-500/20 bg-black/40 backdrop-blur-3xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Security Portal</h1>
                    <p className="text-xs text-red-500/60 mt-2 font-bold tracking-widest">AUTHORIZED PERSONNEL ONLY</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Admin Identifier"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    setError('');
                                }}
                                className="pl-11 bg-white/5 border-white/10 h-14 font-medium focus:border-red-500/50"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Portal Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                className="pl-11 bg-white/5 border-white/10 h-14 font-medium focus:border-red-500/50"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</p>}

                    <Button 
                        type="submit" 
                        className="w-full h-14 text-lg font-bold bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all hover:scale-[1.02]"
                        disabled={loading}
                    >
                        {loading ? 'Decrypting...' : 'ACCESS PORTAL'} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </form>
                
                <div className="mt-10 text-center opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-muted-foreground font-mono">ENCRYPTION: AES-256-GCM</p>
                </div>
            </Card>
        </div>
    );
};

export default AdminLogin;
