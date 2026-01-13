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
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            fontFamily: "'Poppins', sans-serif",
            overflowX: 'hidden'
        }}>

            {/* Header Centrado */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto 2rem auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    marginBottom: '0.25rem',
                    lineHeight: 1.2
                }}>
                    Evaluación del <span style={{ color: '#8B5CF6' }}>Tribunal</span> ⚖️
                </h1>
            </div>

            {/* Lista de Proyectos */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem',
                        backgroundColor: 'white',
                        borderRadius: '30px',
                        border: '4px dashed #E2E8F0',
                        color: '#94A3B8'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>⚖️</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Todo al día</h3>
                        <p>No tienes evaluaciones pendientes</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {projects.map((project, idx) => {
                            const variant = VARIANTS[idx % VARIANTS.length];
                            return (
                                <div key={project.id} style={{
                                    backgroundColor: variant.bg,
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    border: '3px solid white',
                                    maxWidth: '100%'
                                }}>
                                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255,255,255,0.5)',
                                            fontSize: '1.1rem',
                                            fontWeight: 800,
                                            marginBottom: '0.75rem',
                                            color: '#1E293B'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 900,
                                            color: '#0F172A',
                                            marginBottom: '1.25rem',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.2
                                        }}>
                                            {project.title}
                                        </h2>

                                        {/* Grid de Alumnos */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                            gap: '1rem'
                                        }}>
                                            {project.students.map((student) => (
                                                <div key={student.id} style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    padding: '1.25rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                                    width: '100%',
                                                    maxWidth: '240px'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#F1F5F9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.25rem',
                                                        fontWeight: 900,
                                                        marginBottom: '0.75rem',
                                                        color: '#64748B'
                                                    }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.1rem' }}>{student.name}</h3>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '1rem' }}>Estudiante</p>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
                                                        <Link
                                                            href={`/dashboard/tribunal/${project.id}/escrita?studentId=${student.id}`}
                                                            style={{
                                                                padding: '0.5rem',
                                                                borderRadius: '10px',
                                                                backgroundColor: variant.bg,
                                                                color: variant.btn1,
                                                                textAlign: 'center',
                                                                fontWeight: 800,
                                                                fontSize: '0.8rem',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '0.2rem'

                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1rem' }}>📝</span> Escrita
                                                        </Link>
                                                        <Link
                                                            href={`/dashboard/tribunal/${project.id}/oral?studentId=${student.id}`}
                                                            style={{
                                                                padding: '0.5rem',
                                                                borderRadius: '10px',
                                                                backgroundColor: variant.bg,
                                                                color: variant.btn2,
                                                                textAlign: 'center',
                                                                fontWeight: 800,
                                                                fontSize: '0.8rem',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '0.2rem'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1rem' }}>🎤</span> Oral
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
