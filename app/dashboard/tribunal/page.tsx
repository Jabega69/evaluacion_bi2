'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

const cardColors = ['purple', 'pink', 'orange', 'teal'];

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

    if (loading) {
        return <div className="p-8 text-center text-secondary">Cargando...</div>;
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Proyectos Asignados</h1>
                <p className="page-subtitle">Evalúa a cada estudiante de forma individual</p>
            </div>

            {projects.length === 0 ? (
                <div className="p-32 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-xl font-semibold text-secondary">No tienes proyectos asignados</p>
                </div>
            ) : (
                <div className="card-grid">
                    {projects.map((project, idx) => (
                        <div key={project.id} className={`card card-${cardColors[idx % cardColors.length]}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className={`badge badge-${cardColors[idx % cardColors.length]} mb-3`}>
                                        Proyecto
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                        {project.title}
                                    </h3>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                        {project.students.length} {project.students.length === 1 ? 'Estudiante' : 'Estudiantes'}
                                    </p>
                                </div>
                                <div className="text-4xl">🎓</div>
                            </div>

                            <div className="mt-6 pt-6" style={{ borderTop: '2px solid #F3F4F6' }}>
                                <div className="space-y-3">
                                    {project.students.map((student) => (
                                        <div key={student.id} className="p-4 rounded-xl" style={{ background: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-base">{student.name}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href={`/dashboard/tribunal/${project.id}/escrita?studentId=${student.id}`}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all text-white"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                                                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                                                    }}
                                                >
                                                    📝 Escrita
                                                </Link>
                                                <Link
                                                    href={`/dashboard/tribunal/${project.id}/oral?studentId=${student.id}`}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all text-white"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
                                                        boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.3)';
                                                    }}
                                                >
                                                    🎤 Oral
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
