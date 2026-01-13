'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const { login, loginWithGoogle, user, isLoading, setActiveRole } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Redirect if already logged in and role is selected
    useEffect(() => {
        const checkStatus = () => {
            if (user && !isLoading) {
                if (user.activeRole) {
                    const role = user.activeRole;
                    if (role === 'admin') router.push('/dashboard/admin');
                    else if (role === 'tribunal') router.push('/dashboard/tribunal');
                    else if (role === 'tutor') router.push('/dashboard/tutor');
                } else if (user.roles && user.roles.length > 1) {
                    setShowRoleSelector(true);
                    setLoading(false);
                    setIsConnecting(false);
                }
            } else if (!user && !isLoading && isConnecting) {
                // Add a tiny grace period to avoid race conditions with isLoading state
                setTimeout(() => {
                    // Check again inside timeout
                    // If still no user and no loading, then it's a real "no profile" error
                    if (!user && !isLoading && isConnecting) {
                        setError('No se pudo cargar tu perfil. Es posible que el administrador deba registrarte primero.');
                        setLoading(false);
                        setIsConnecting(false);
                    }
                }, 1000);
            }
        };

        checkStatus();
    }, [user, isLoading, router, isConnecting]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setIsConnecting(true); // Set to true immediately to indicate connection attempt

        try {
            const result = await login(email, password);

            if (result.success) {
                // If login success, we wait for AuthProvider to fetch the profile
                // isConnecting is already true, and useEffect will handle the rest
            } else {
                setLoading(false);
                setIsConnecting(false); // Reset if login failed
                setError(result.error || 'Credenciales inválidas');
            }
        } catch (err: any) {
            setLoading(false);
            setIsConnecting(false); // Reset if an error occurred
            setError('Error al iniciar sesión. Comprueba tu conexión.');
        }
    };

    if (showRoleSelector && user) {
        return (
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: 'white',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem', color: '#0F172A' }}>
                    Selecciona tu Rol
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                    Tienes varios roles asignados. ¿Cómo quieres entrar hoy?
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {user.roles.map((role) => (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role as any)}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '16px',
                                border: '2px solid #E2E8F0',
                                background: 'white',
                                color: '#0F172A',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                        >
                            Entrar como {role === 'tutor' ? 'Tutor' : role === 'tribunal' ? 'Tribunal' : 'Admin'}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: '#0F172A', fontFamily: 'Poppins, sans-serif' }}>
                Bienvenido 👋
            </h2>

            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #E2E8F0',
                        fontSize: '1rem',
                        outline: 'none',
                        width: '100%',
                        color: '#1e293b'
                    }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #E2E8F0',
                        fontSize: '1rem',
                        outline: 'none',
                        width: '100%',
                        color: '#1e293b'
                    }}
                />

                {error && (
                    <div style={{ color: '#EF4444', fontSize: '0.9rem', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: loading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    {loading ? 'Entrando...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0', color: '#94A3B8' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>O accede con</span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
            </div>

            <button
                type="button"
                onClick={() => loginWithGoogle()}
                style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid #E2E8F0',
                    background: 'white',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
                {/* Google Icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
            </button>
        </div>
    );
}
