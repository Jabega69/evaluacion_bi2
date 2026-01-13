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
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            fontFamily: "'Poppins', sans-serif"
        }}>

            {/* Header Centrado */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto 4rem auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    marginBottom: '1rem',
                    lineHeight: 1.2
                }}>
                    Mis <span style={{ color: '#14B8A6' }}>Alumnos</span> 🌱
                </h1>
            </div>

            {/* Lista de Proyectos */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem',
                        backgroundColor: 'white',
                        borderRadius: '30px',
                        border: '4px dashed #E2E8F0',
                        color: '#94A3B8'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🌱</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sin asignaciones</h3>
                        <p>Aún no tienes alumnos que tutelar</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '2rem'
                    }}>
                        {projects.map((project, idx) => (
                            <div key={project.id} style={{
                                backgroundColor: '#CCFBF1', // Teal 100
                                borderRadius: '30px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                border: '8px solid white',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>

                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255,255,255,0.6)',
                                            color: '#0D9488',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 900
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: '#0D9488',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Tutorizando
                                            </span>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 900,
                                                color: '#134E4A',
                                                lineHeight: 1.2
                                            }}>
                                                {project.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                        {project.students.map(student => (
                                            <Link
                                                key={student.id}
                                                href={`/dashboard/tutor/${student.id}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '16px',
                                                    textDecoration: 'none',
                                                    color: '#334155',
                                                    transition: 'transform 0.2s',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#F0FDFA',
                                                        color: '#0D9488',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 800
                                                    }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{student.name}</span>
                                                </div>
                                                <span style={{ color: '#0D9488', fontWeight: 900 }}>➜</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: '#0D9488',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Evaluar Seguimiento ⚡️
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
