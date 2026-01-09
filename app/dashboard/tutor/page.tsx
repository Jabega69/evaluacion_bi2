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

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Mis Alumnos</h1>
                <p className="page-subtitle">Evalúa el desempeño de tus alumnos tutorizados</p>
            </div>

            {projects.length === 0 ? (
                <div className="p-32 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>No tienes proyectos asignados</p>
                </div>
            ) : (
                <div className="card-grid">
                    {projects.map((project) => (
                        <div key={project.id} className="card card-teal">
                            <div className="mb-4">
                                <div className="badge badge-teal mb-3">Proyecto Tutorizado</div>
                                <h3 className="text-xl font-bold mb-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                    {project.title}
                                </h3>
                            </div>

                            <div className="space-y-3 mt-6 pt-6" style={{ borderTop: '2px solid #F3F4F6' }}>
                                {project.students.map(student => (
                                    <Link
                                        key={student.id}
                                        href={`/dashboard/tutor/${student.id}`}
                                        className="flex items-center justify-between w-full px-5 py-4 rounded-xl text-left transition-all group"
                                        style={{
                                            background: '#F9FAFB',
                                            border: '2px solid #E5E7EB'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#14B8A6';
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.background = '#F9FAFB';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="avatar" style={{
                                                width: '40px',
                                                height: '40px',
                                                fontSize: '14px',
                                                background: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)'
                                            }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-base">{student.name}</span>
                                        </div>
                                        <span className="text-teal-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
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
