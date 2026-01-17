'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function ReportsListPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            let data: Project[] = [];
            if (user?.roles.includes('admin')) {
                data = await api.projects.getAll();
            } else if (user?.roles.includes('tribunal')) {
                data = await api.projects.getByGrader(user.id);
            } else if (user?.roles.includes('tutor')) {
                data = await api.projects.getByTutor(user.id);
            }
            setProjects(data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #F1F5F9',
                borderTop: '4px solid #6366F1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
            }}></div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94A3B8' }}>Cargando expedientes...</p>
        </div>
    );

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '3rem 2rem',
            backgroundColor: '#F8FAFC',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#0F172A', marginBottom: '0.75rem', letterSpacing: '-0.04em' }}>
                        Centro de <span style={{ color: '#6366F1' }}>Resultados</span> 📈
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748B', fontWeight: 600, maxWidth: '600px', margin: '0 auto' }}>
                        Consulta las actas oficiales de evaluación y el desglose detallado por alumno y proyecto.
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '6rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '40px',
                        border: '2px dashed #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📊</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#CBD5E1' }}>No se han encontrado proyectos asignados</h3>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {projects.map((project) => (
                            <div key={project.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '40px',
                                padding: '3rem',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)',
                                border: '1px solid #F1F5F9'
                            }}>
                                <div style={{
                                    marginBottom: '2.5rem',
                                    paddingBottom: '1.5rem',
                                    borderBottom: '2px solid #F8FAFC',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', color: '#6366F1', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>PROYECTO DE INVESTIGACIÓN</div>
                                        <h3 style={{ fontSize: '2.2rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{project.title}</h3>
                                    </div>
                                    <div style={{ backgroundColor: '#F1F5F9', padding: '1rem 1.5rem', borderRadius: '24px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Alumnos</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 950, color: '#1E293B' }}>{project.students.length}</div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {project.students.map((s) => (
                                        <Link
                                            key={s.id}
                                            href={`/dashboard/reports/${project.id}?studentId=${s.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1.75rem',
                                                backgroundColor: '#F8FAFC',
                                                borderRadius: '28px',
                                                border: '1px solid #F1F5F9',
                                                transition: 'all 0.3s ease'
                                            }}
                                            className="report-card-link"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: '16px',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#6366F1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 950,
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                                    border: '1px solid #EEF2FF'
                                                }}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{s.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6366F1', fontWeight: 800, marginTop: '0.2rem' }}>Ver Informe →</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
