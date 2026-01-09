'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

export default function TutorDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            if (user?.id) {
                const data = await api.projects.getByTutor(user.id);
                setProjects(data);
            }
            setLoading(false);
        }
        loadProjects();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-teal-600 font-bold animate-pulse">Cargando tus alumnos tutorizados...</p>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '60px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="text-center md:text-left mb-16 border-b border-gray-100 pb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    Panel del Tutor
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
                    Mis <span style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Alumnos</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl">
                    Evalúa la actitud y el compromiso de cada estudiante bajo tu tutela.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                    <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center text-6xl mb-8 shadow-inner">👥</div>
                    <h3 className="text-3xl font-black text-slate-400 mb-2" style={{ fontFamily: 'Poppins' }}>Sin alumnos asignados</h3>
                    <p className="text-slate-300 font-bold">Actualmente no tienes proyectos bajo tu tutoría activa.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="card group p-10 overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-teal-500/10"
                            style={{ background: 'white', borderRadius: '32px', transition: 'all 0.4s ease' }}>
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex-1">
                                    <div className="badge badge-teal mb-4">Proyecto Tutorizado</div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                        {project.title}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {project.id.slice(0, 8)}</p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-3xl shadow-inner">👥</div>
                            </div>

                            <div className="space-y-3 pt-8" style={{ borderTop: '2px dashed #f1f5f9' }}>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Alumnos bajo tutela</h4>
                                {project.students.map(student => (
                                    <Link
                                        key={student.id}
                                        href={`/dashboard/tutor/${student.id}`}
                                        className="flex items-center justify-between w-full p-5 rounded-2xl text-left transition-all border-2 border-slate-50 bg-slate-50 hover:border-teal-100 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group/item"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-sm"
                                                style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-lg text-slate-800">{student.name}</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-100 text-teal-500 transition-all group-hover/item:bg-teal-500 group-hover/item:text-white group-hover/item:scale-110">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
