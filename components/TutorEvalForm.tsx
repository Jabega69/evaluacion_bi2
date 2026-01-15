'use client';

import { useState, useEffect } from 'react';
import { TutorRubric, Project, Student } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
    rubric: TutorRubric;
    project: Project;
    student: Student;
    tutorId: string;
    initialScores?: Record<string, number>;
}

export default function TutorEvalForm({ rubric, project, student, tutorId, initialScores = {} }: Props) {
    const router = useRouter();
    const [scores, setScores] = useState<Record<string, number>>(initialScores);
    const [submitting, setSubmitting] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        if (initialScores && Object.keys(initialScores).length > 0) {
            setScores(initialScores);
        }
    }, [initialScores]);

    const calculateTotal = () => {
        // 5 items * 2 pts = 10 pts max
        return Object.values(scores).reduce((a, b) => a + b, 0);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.submissions.submitTutor({
                id: crypto.randomUUID(),
                projectId: project.id,
                tutorId: tutorId,
                studentId: student.id,
                scores,
                submittedAt: new Date().toISOString()
            });
            router.push('/dashboard/tutor');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la evaluación');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            padding: '3rem 2rem 10rem 2rem',
            maxWidth: '1000px',
            margin: '0 auto',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Header Moderno-Orange */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '3rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9',
                textAlign: 'center'
            }}>
                <span style={{
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    padding: '0.4rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '1.5rem',
                    display: 'inline-block'
                }}>
                    Panel del Tutor
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Evaluando a: <span style={{ color: '#F59E0B' }}>{student.name}</span>
                </h1>
                <p style={{ color: '#64748B', fontWeight: 600 }}>Proyecto: {project.title}</p>
            </div>

            {/* EVALUACIÓN DEL TUTOR */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Seguimiento del Alumno (Máx 10 Puntos)</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Valore el desempeño continuo del estudiante durante el desarrollo del proyecto.</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {rubric.items.map(item => (
                        <div key={item.id}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '2rem',
                                padding: '1.5rem 2rem',
                                borderRadius: '20px',
                                backgroundColor: hoveredItem === item.id ? '#FFFBEB' : 'white',
                                border: '2px solid',
                                borderColor: hoveredItem === item.id ? '#FDE68A' : '#F1F5F9',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{item.label}</label>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {[0, 1, 2].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setScores(prev => ({ ...prev, [item.id]: val }))}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            backgroundColor: scores[item.id] === val ? '#F59E0B' : '#F1F5F9',
                                            color: scores[item.id] === val ? 'white' : '#64748B',
                                            fontSize: '1rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: scores[item.id] === val ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                                        }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Bar Orange */}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                left: '2rem',
                right: '2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '1.5rem 3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                zIndex: 1000
            }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.2rem' }}>
                        Calificación del Tutor
                    </span>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: '#F59E0B'
                    }}>
                        {calculateTotal()} <span style={{ fontSize: '1rem', color: '#CBD5E1' }}>/ 10</span>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                        padding: '1.25rem 4rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >
                    {submitting ? 'Guardando...' : (
                        <>
                            <span>✓</span>
                            <span>Finalizar Evaluación</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
