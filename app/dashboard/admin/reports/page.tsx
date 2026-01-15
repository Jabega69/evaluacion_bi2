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
                        Selecciona una investigación para consultar las actas de resultados finales
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
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        {projects.map((project) => (
                            <div key={project.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '32px',
                                padding: '2.5rem',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #F1F5F9',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden'
                            }} className="hover:scale-[1.03] hover:shadow-xl group">
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '120px',
                                    height: '120px',
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 70%)',
                                    borderRadius: '0 0 0 100%'
                                }} />

                                <div>
                                    <div style={{
                                        display: 'inline-flex',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#EEF2FF',
                                        color: '#6366F1',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05rem',
                                        marginBottom: '1.5rem'
                                    }}>Proyecto Activo</div>

                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        marginBottom: '0.75rem',
                                        lineHeight: 1.3
                                    }}>
                                        {project.title}
                                    </h3>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                        {project.students.map(s => (
                                            <span key={s.id} style={{
                                                fontSize: '0.8rem',
                                                padding: '0.3rem 0.75rem',
                                                backgroundColor: '#F8FAFC',
                                                color: '#64748B',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                border: '1px solid #F1F5F9'
                                            }}>
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link href={`/dashboard/admin/reports/${project.id}`} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    width: '100%',
                                    padding: '1.25rem',
                                    backgroundColor: '#0F172A',
                                    color: 'white',
                                    borderRadius: '20px',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s'
                                }} className="group-hover:bg-indigo-600">
                                    Generar Informe
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
