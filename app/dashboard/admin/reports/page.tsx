'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

export default function AdminReportsListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.projects.getAll();
            setProjects(data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-slate-400">Cargando proyectos...</p>
        </div>
    );

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '3rem 2rem',
            backgroundColor: '#F8FAFC',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
                        Informes de <span style={{ color: '#6366F1' }}>Evaluación</span> 📈
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748B', fontWeight: 500 }}>
                        Selecciona un alumno para consultar su acta de resultados finales de forma individual
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '40px',
                        border: '4px dashed #E2E8F0',
                        color: '#94A3B8'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.5 }}>📊</div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#CBD5E1' }}>No hay proyectos registrados</h3>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gap: '3rem'
                    }}>
                        {projects.map((project) => (
                            <div key={project.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '40px',
                                padding: '3rem',
                                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
                                border: '1px solid #F1F5F9',
                                overflow: 'hidden'
                            }}>
                                <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #F8FAFC', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#6366F1', letterSpacing: '0.1rem', marginBottom: '0.5rem', display: 'block' }}>
                                            Investigación
                                        </span>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>{project.title}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.1rem', marginBottom: '0.5rem', display: 'block' }}>
                                            Total Alumnos
                                        </span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#475569' }}>{project.students.length}</div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {project.students.map((s) => (
                                        <Link
                                            key={s.id}
                                            href={`/dashboard/admin/reports/${project.id}?studentId=${s.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1.5rem 2rem',
                                                backgroundColor: '#F8FAFC',
                                                borderRadius: '24px',
                                                border: '1px solid #F1F5F9',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            className="hover:bg-white hover:border-indigo-600 hover:shadow-xl group"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '14px',
                                                    backgroundColor: '#EEF2FF',
                                                    color: '#6366F1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 900,
                                                    transition: 'all 0.3s'
                                                }} className="group-hover:bg-indigo-600 group-hover:text-white">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>{s.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Generar Informe Individual</div>
                                                </div>
                                            </div>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#6366F1',
                                                border: '1px solid #F1F5F9',
                                                transition: 'all 0.3s'
                                            }} className="group-hover:translate-x-1 group-hover:bg-indigo-600 group-hover:text-white">
                                                →
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
