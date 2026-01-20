'use client';

import { useAuth } from '@/lib/auth-context';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLE_LABELS: Record<Role, string> = {
    admin: 'Administrador',
    tribunal: 'Mec. Tribunal',
    tutor: 'Tutor Proyectos'
};

const ROLE_ICONS: Record<Role, string> = {
    admin: '🛡️',
    tribunal: '⚖️',
    tutor: '🌱'
};

const ROLE_COLORS: Record<Role, string> = {
    admin: '#8B5CF6', // Purple
    tribunal: '#4F46E5', // Indigo
    tutor: '#14B8A6' // Teal
};

export default function RoleSwitcher() {
    const { user, setActiveRole } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!user || user.roles.length <= 1) return null;

    const handleRoleChange = (role: Role) => {
        setActiveRole(role);
        setIsOpen(false);
        router.push(`/dashboard/${role}`);
    };

    const currentRole = user.activeRole || user.roles[0];

    return (
        <div className="relative mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/10 hover:bg-white/15 rounded-2xl transition-all border border-white/10 group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-lg">
                        {ROLE_ICONS[currentRole]}
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Rol Activo</div>
                        <div className="text-sm font-bold text-white leading-none capitalize">{ROLE_LABELS[currentRole]}</div>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <span className="text-white/40">▼</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                        {user.roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleChange(role)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${currentRole === role
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/5 text-white/60 hover:text-white'
                                    }`}
                            >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/20 text-sm" style={{ color: ROLE_COLORS[role] }}>
                                    {ROLE_ICONS[role]}
                                </div>
                                <span className="text-xs font-bold">{ROLE_LABELS[role]}</span>
                                {currentRole === role && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
