'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = {
    admin: [
        { icon: '📊', label: 'Proyectos', path: '/dashboard/admin', color: 'purple' },
        { icon: '👥', label: 'Profesores', path: '/dashboard/admin/users', color: 'orange' },
        { icon: '🗓️', label: 'Calendario', path: '/dashboard/admin/calendar', color: 'blue' },
        { icon: '📈', label: 'Informes', path: '/dashboard/reports', color: 'pink' },
        { icon: '📑', label: 'Listado Proyectos', path: '/dashboard/admin/project-list', color: 'indigo' },
        { icon: '✉️', label: 'Distribución', path: '/dashboard/admin/distribution', color: 'rose' },
    ],
    tribunal: [
        { icon: '📚', label: 'Mis proyectos', path: '/dashboard/tribunal', color: 'purple' },
        { icon: '📈', label: 'Informes', path: '/dashboard/reports', color: 'pink' },
    ],
    tutor: [
        { icon: '👥', label: 'Mis alumnos', path: '/dashboard/tutor', color: 'teal' },
        { icon: '📈', label: 'Informes', path: '/dashboard/reports', color: 'pink' },
    ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router, pathname]);

    if (!user || !user.activeRole) return null;

    const items = navItems[user.activeRole as keyof typeof navItems] || [];

    return (
        <div className="min-h-screen">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)' }}>
                            🎓
                        </div>
                        <div className="sidebar-logo">EvalResearch</div>
                    </div>
                    <p className="text-xs font-semibold tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ textTransform: "capitalize" }}>{user.activeRole}</span> Panel
                    </p>
                </div>

                <div className="sidebar-nav">
                    {items.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-item-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {user?.needs_password_reset && (
                        <div
                            onClick={() => router.push('/auth/reset-password')}
                            style={{
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            <p style={{ color: '#991B1B', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>
                                ⚠️ ACCIÓN REQUERIDA:<br />Actualiza tu contraseña
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                        <div className="avatar">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/auth/reset-password')}
                            className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all border border-slate-700 text-slate-300 hover:bg-slate-800"
                            style={{ background: 'transparent' }}
                        >
                            Cambiar contraseña
                        </button>
                        <button
                            onClick={logout}
                            className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ overflowX: 'hidden', width: '100%', minWidth: '0' }}>
                {children}
            </div>
        </div>
    );
}
