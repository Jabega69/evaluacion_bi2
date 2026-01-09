'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS } from '@/lib/mock-data';

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
    const { login, isLoading } = useAuth();
    const [error, setError] = useState('');

    const handleLogin = async (email: string) => {
        setError('');
        const success = await login(email);
        if (!success) {
            setError('Error al iniciar sesión');
        }
    };

    return (
        <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '550px'
        }}>
            <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '32px',
                textAlign: 'center',
                fontFamily: 'Poppins, sans-serif',
                color: '#1e293b'
            }}>
                Selecciona tu perfil
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_USERS.map((user) => (
                    <button
                        key={user.id}
                        onClick={() => handleLogin(user.email)}
                        disabled={isLoading}
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
                            outline: 'none'
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
                            background: roleColors[user.role as keyof typeof roleColors],
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            flexShrink: 0
                        }}>
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '18px',
                                color: '#1e293b',
                                fontFamily: 'Poppins, sans-serif',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.name}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#64748b'
                            }}>
                                {roleLabels[user.role as keyof typeof roleLabels]}
                            </div>
                        </div>

                        <div style={{ color: '#6366F1' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {error && (
                <div style={{
                    marginTop: '24px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca'
                }}>
                    {error}
                </div>
            )}

            {isLoading && (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 24px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        boxShadow: '0 10px 15px -3px rgba(99,102,241,0.3)'
                    }}>
                        <div className="spinner" style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%'
                        }}></div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Iniciando sesión...</span>
                    </div>
                </div>
            )}

            <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
