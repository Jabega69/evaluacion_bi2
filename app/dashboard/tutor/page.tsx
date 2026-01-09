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
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-slate-400">Cargando...</p>
        </div>
    );

    return (
        <div className="animate-in w-full min-h-screen p-8 md:p-16 max-w-[1600px] mx-auto">
            <div className="text-center mb-24 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight" style={{ fontFamily: 'Poppins' }}>
                    Guía el camino al <br /> <span className="text-teal-500">éxito</span> 🌱
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Seguimiento y tutoría de los alumnos asignados.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4 opacity-20">🌱</div>
                    <h3 className="text-2xl font-bold text-slate-300">No tienes alumnos asignados</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="rounded-[40px] overflow-hidden bg-[#CCFBF1] flex flex-col h-full hover:shadow-xl transition-shadow">
                            <div className="p-10 flex-1">
                                <span className="inline-block px-3 py-1 bg-white/60 text-teal-800 rounded-lg text-xs font-bold uppercase tracking-wider mb-6">
                                    Proyecto Tutorizado
                                </span>
                                <h3 className="text-3xl font-black text-slate-800 mb-8 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                    {project.title}
                                </h3>

                                <div className="space-y-4">
                                    {project.students.map(student => (
                                        <Link
                                            key={student.id}
                                            href={`/dashboard/tutor/${student.id}`}
                                            className="block bg-white p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700">{student.name}</span>
                                            </div>
                                            <span className="text-teal-500 text-xl font-bold group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-teal-500 p-4 text-center text-white/90 font-bold text-sm">
                                Evaluación de Actitud y Seguimiento
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
