import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, LogIn } from 'lucide-react';
import IberdrolaLogo from '@/components/IberdrolaLogo';

const VALID_USERS = [
    { username: 'admin', password: 'Iber2018.' },
    { username: 'mhinojo@lin3s.com', password: '1987' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            if (VALID_USERS.some(u => u.username === username && u.password === password)) {
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/');
            } else {
                setError('Usuario o contraseña incorrectos');
            }
            setLoading(false);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <IberdrolaLogo className="h-11 w-auto mb-6" />
                    <h1 className="text-2xl font-bold text-foreground">DATA IMPALA</h1>
                    <p className="text-sm text-muted-foreground mt-1">Monitorización de eventos</p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Iniciar sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <label htmlFor="login-username" className="text-sm font-medium text-foreground">
                                Usuario
                            </label>
                            <input
                                id="login-username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="usuario"
                                required
                                className="w-full h-10 px-3 rounded-md border-[1.5px] border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-[3px] focus:ring-ib-green-100 focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-10 pl-3 pr-10 rounded-md border-[1.5px] border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-[3px] focus:ring-ib-green-100 focus:border-primary transition-colors"
                                />
                                <button
                                    type="button"
                                    id="toggle-password-visibility"
                                    onClick={() => setShowPass((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                id="login-error"
                                className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5 border border-destructive/20"
                            >
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-ib-green-700 hover:-translate-y-px hover:shadow-ib-sm active:translate-y-0 active:shadow-none transition-all disabled:opacity-45 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <Activity className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogIn className="h-4 w-4" />
                            )}
                            {loading ? 'Accediendo...' : 'Entrar'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    by Mario Hinojo
                </p>
            </div>
        </div>
    );
}
