'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

// Ucademy-inspired palette for Tribunal
const VARIANTS = [
    { bg: '#E0E7FF', btn1: '#4F46E5', btn2: '#4338CA', label: 'indigo' },
    { bg: '#FAE8FF', btn1: '#D946EF', btn2: '#C026D3', label: 'fuchsia' },
];

export default function TribunalDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            if (user?.id) {
                const data = await api.projects.getByGrader(user.id);
                setProjects(data);
            }
            setLoading(false);
        }
        loadProjects();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-slate-400">Cargando proyectos...</p>
        </div>
    );

    return (
        <div className="animate-in w-full min-h-screen p-8 md:p-16 max-w-[1600px] mx-auto">
            <div className="text-center mb-24 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight" style={{ fontFamily: 'Poppins' }}>
                    Tu criterio define el <br /> <span className="text-purple-600">futuro académico</span> 🎓
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Proyectos asignados para tu evaluación como miembro del Tribunal.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4 opacity-20">⚖️</div>
                    <h3 className="text-2xl font-bold text-slate-300">No tienes evaluaciones pendientes</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {projects.map((project, idx) => {
                        const variant = VARIANTS[idx % VARIANTS.length];
                        return (
                            <div key={project.id} className="rounded-[40px] p-10 md:p-16 transition-all hover:shadow-xl"
                                style={{ background: variant.bg }}>
                                <div className="text-center mb-12">
                                    <span className="inline-block px-4 py-2 rounded-full bg-white/50 text-slate-600 font-bold text-xs uppercase tracking-widest mb-4">
                                        Proyecto #{idx + 1}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2" style={{ fontFamily: 'Poppins' }}>
                                        {project.title}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {project.students.map((student) => (
                                        <div key={student.id} className="bg-white rounded-[32px] overflow-hidden flex flex-col shadow-sm transition-transform hover:-translate-y-2">
                                            <div className="p-8 flex-1 flex flex-col items-center text-center">
                                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 mb-4">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                                                <p className="text-sm text-slate-400 font-medium">Estudiante</p>
                                            </div>

                                            <div className="grid grid-cols-2 border-t border-slate-100">
                                                <Link
                                                    href={`/dashboard/tribunal/${project.id}/escrita?studentId=${student.id}`}
                                                    className="py-4 text-center font-bold text-sm transition-colors hover:bg-slate-50 flex flex-col items-center gap-1"
                                                    style={{ color: variant.btn1 }}
                                                >
                                                    <span>📝 Escrita</span>
                                                </Link>
                                                <Link
                                                    href={`/dashboard/tribunal/${project.id}/oral?studentId=${student.id}`}
                                                    className="py-4 text-center font-bold text-sm transition-colors hover:bg-slate-50 flex flex-col items-center gap-1 border-l border-slate-100"
                                                    style={{ color: variant.btn2 }}
                                                >
                                                    <span>🎤 Oral</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
