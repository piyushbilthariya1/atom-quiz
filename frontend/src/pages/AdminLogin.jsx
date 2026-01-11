import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui/Components';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'Piyush@1979') {
            localStorage.setItem('admin_authenticated', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-[400px] p-8 border-border bg-card shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 border border-border">
                        <Lock className="w-6 h-6 text-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
                    <p className="text-sm text-muted-foreground mt-1">Enter credentials to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="bg-secondary/50 border-input placeholder:text-muted-foreground h-11"
                        />
                        {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                    </div>
                    <Button type="submit" className="w-full h-11 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
