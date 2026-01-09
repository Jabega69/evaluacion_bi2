'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { User } from '@/types';

const roleColors = {
    admin: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    tribunal: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    tutor: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)'
};

const roleLabels = {
    admin: 'Administrador',
    tribunal: 'Tribunal',
    tutor: 'Tutor'
};

export default function LoginForm() {
    const { login, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadUsers() {
            try {
                const fetchedUsers = await api.auth.getAllUsers();
                setUsers(fetchedUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    const handleLogin = async (email: string) => {
        setError('');
        const success = await login(email);
        if (!success) {
            setError('Error al iniciar sesión. ¿Has configurado Supabase?');
        }
    };

    if (loading) {
        return (
            <div className="card w-full flex flex-col items-center justify-center p-12" style={{ maxWidth: '600px', background: 'white' }}>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-bold">Cargando usuarios reales...</p>
            </div>
        );
    }

    return (
        <div className="card w-full" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '40px', maxWidth: '600px', background: 'white', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px', textAlign: 'center', fontFamily: 'Poppins', color: '#1e293b' }}>
                Inicia sesión como:
            </h2>

            {users.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500 mb-4">No hay usuarios en la base de datos.</p>
                    <p className="text-xs bg-amber-50 text-amber-700 p-3 rounded-lg">
                        IMPORTANTE: Ejecuta el contenido de <code>supabase-seed.sql</code> en el editor SQL de Supabase para ver los usuarios aquí.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleLogin(user.email)}
                            disabled={authLoading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                border: '2px solid #f1f5f9',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#6366F1';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'white',
                                background: roleColors[user.role as keyof typeof roleColors] || '#6366F1',
                                flexShrink: 0
                            }}>
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b', fontFamily: 'Poppins' }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                                    {roleLabels[user.role as keyof typeof roleLabels]}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', textAlign: 'center', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}
        </div>
    );
}
