'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

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
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold animate-pulse">Cargando tus proyectos asignados...</p>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '60px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="text-center md:text-left mb-16 border-b border-gray-100 pb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    Panel del Tribunal
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
                    Proyectos <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Asignados</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl">
                    Evalúa la calidad académica y la defensa oral de cada estudiante.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                    <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center text-6xl mb-8 shadow-inner">📚</div>
                    <h3 className="text-3xl font-black text-slate-400 mb-2" style={{ fontFamily: 'Poppins' }}>Sin proyectos</h3>
                    <p className="text-slate-300 font-bold">Actualmente no tienes investigaciones asignadas para evaluar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project, idx) => (
                        <div key={project.id} className="card group p-10 overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-purple-500/10"
                            style={{ background: 'white', borderRadius: '32px', transition: 'all 0.4s ease' }}>
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex-1">
                                    <div className="badge badge-purple mb-4">Proyecto #{idx + 1}</div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                        {project.title}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {project.id.slice(0, 8)}</p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl shadow-inner">📖</div>
                            </div>

                            <div className="space-y-4 pt-8" style={{ borderTop: '2px dashed #f1f5f9' }}>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selecciona un alumno para evaluar</h4>
                                {project.students.map((student) => (
                                    <div key={student.id} className="p-6 rounded-[24px] bg-slate-50 border-2 border-slate-50 hover:border-purple-100 hover:bg-white transition-all group/item shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg font-black text-purple-600 shadow-sm">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-lg text-slate-800">{student.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href={`/dashboard/tribunal/${project.id}/escrita?studentId=${student.id}`}
                                                className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-black text-sm transition-all text-white hover:scale-[1.02] active:scale-[0.98]"
                                                style={{
                                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                                }}
                                            >
                                                📝 Escrita
                                            </Link>
                                            <Link
                                                href={`/dashboard/tribunal/${project.id}/oral?studentId=${student.id}`}
                                                className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-black text-sm transition-all text-white hover:scale-[1.02] active:scale-[0.98]"
                                                style={{
                                                    background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
                                                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                                                }}
                                            >
                                                🎤 Oral
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
