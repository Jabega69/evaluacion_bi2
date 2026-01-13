'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[ResetPassword] handleReset started');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        // Safety timeout
        timeoutRef.current = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('La operación está tardando demasiado. Comprueba tu conexión o recarga la página.');
            }
        }, 10000);

        try {
            console.log('[ResetPassword] Checking active session...');
            const { data: { session } } = await supabase.auth.getSession();
            console.log('[ResetPassword] Session found:', session ? 'YES' : 'NO');

            if (!session) {
                console.error('[ResetPassword] No session! Login might have expired.');
                setError('No hay una sesión activa. Por favor, vuelve a iniciar sesión.');
                return;
            }

            console.log('[ResetPassword] Attempting to update password for:', session.user.email);
            // 1. Update password in Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });

            if (authError) {
                console.error('[ResetPassword] Auth update error:', authError);
                throw authError;
            }
            console.log('[ResetPassword] Auth password updated successfully');

            // 2. Update needs_password_reset in public.users
            if (user) {
                console.log('[ResetPassword] Updating public.users table for user:', user.id);
                const { error: dbError } = await supabase
                    .from('users')
                    .update({ needs_password_reset: false })
                    .eq('id', user.id);

                if (dbError) {
                    console.error('[ResetPassword] DB update error:', dbError);
                    throw dbError;
                }
                console.log('[ResetPassword] Public.users updated successfully');
            }

            // 3. Success! Redirect to dashboard
            console.log('[ResetPassword] Success! Redirecting...');
            alert('Contraseña actualizada correctamente');
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('[ResetPassword] Catch error:', err);
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            console.log('[ResetPassword] handleReset finished');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FAFC',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔐</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                    Actualiza tu Contraseña
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Por seguridad, debes cambiar la contraseña que te asignó el administrador antes de continuar.
                </p>

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                            Nueva Contraseña
                        </label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                borderRadius: '12px',
                                border: '2px solid #E2E8F0',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                            Confirmar Contraseña
                        </label>
                        <input
                            required
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                borderRadius: '12px',
                                border: '2px solid #E2E8F0',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            backgroundColor: '#0F172A',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            border: 'none',
                            cursor: loading ? 'wait' : 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
                        }}
                    >
                        {loading ? 'Guardando...' : 'Cambiar Contraseña y Entrar'}
                    </button>

                    <button
                        type="button"
                        onClick={() => logout()}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        Cancelar y Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
