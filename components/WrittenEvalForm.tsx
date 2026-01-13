'use client';

import { useState } from 'react';
import { WrittenRubric, Project, Student } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
    rubric: WrittenRubric;
    project: Project;
    student: Student;
    graderId: string;
}

export default function WrittenEvalForm({ rubric, project, student, graderId }: Props) {
    const router = useRouter();
    const [contentScores, setContentScores] = useState<Record<string, number>>({});
    const [formatScores, setFormatScores] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const calculateTotal = () => {
        const contentSum = Object.values(contentScores).reduce((a, b) => a + b, 0);
        const formatSum = Object.values(formatScores).filter(v => v).length;

        const maxContentRaw = rubric.contentItems.reduce((a, b) => a + b.maxScore, 0);
        const contentScaled = (contentSum / maxContentRaw) * 9;

        const maxFormatRaw = rubric.formatItems.length;
        const formatScaled = (formatSum / maxFormatRaw) * 1;

        return (contentScaled + formatScaled).toFixed(2);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.submissions.submitWritten({
                id: crypto.randomUUID(),
                projectId: project.id,
                studentId: student.id,
                graderId: graderId,
                contentScores,
                formatScores,
                submittedAt: new Date().toISOString()
            });
            router.push('/dashboard/tribunal');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la evaluación');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            padding: '2rem 1rem 8rem 1rem',
            maxWidth: '900px',
            margin: '0 auto',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Header Moderno */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9',
                textAlign: 'center'
            }}>
                <span style={{
                    backgroundColor: '#8B5CF6',
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
                    Evaluación Escrita
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Evaluando a: <span style={{ color: '#8B5CF6' }}>{student.name}</span>
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Proyecto: {project.title}</p>
            </div>

            {/* A. CONTENIDO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.2rem' }}>A. Contenido (Máx 9 Puntos)</h2>
                    <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>Valore de 0 a 10. Pasa el ratón para ver la rúbrica.</p>
                </div>

                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {rubric.contentItems.map((item, idx) => {
                        // Determinamos si es un item superior para mostrar el tooltip hacia abajo
                        const isTopItem = idx < 4 || ['c1', 'c2', 'c3', 'c4'].includes(item.id);

                        return (
                            <div key={item.id}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '16px',
                                    backgroundColor: hoveredItem === item.id ? '#F8FAFC' : 'white',
                                    border: '1px solid',
                                    borderColor: hoveredItem === item.id ? '#E2E8F0' : '#F1F5F9',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    alignItems: 'center'
                                }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {item.label}
                                        {item.levels && <span style={{ fontSize: '0.8rem', cursor: 'help', opacity: 0.5 }}>ℹ️</span>}
                                    </label>
                                    {item.description && <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.description}</p>}

                                    {/* Tooltip Rubrica Inteligente */}
                                    {hoveredItem === item.id && item.levels && (
                                        <div style={{
                                            position: 'absolute',
                                            // Lógica blindada con Spread: Solo aplicamos la propiedad necesaria
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: isTopItem ? '#334155' : '#1E293B', // Debug distinction
                                            color: 'white',
                                            padding: '1.2rem',
                                            borderRadius: '16px',
                                            width: '450px',
                                            maxWidth: '85vw',
                                            zIndex: 9999,
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                                            border: '1px solid #334155',
                                            ...(isTopItem
                                                ? { top: 'calc(100% + 15px)' }
                                                : { bottom: 'calc(100% + 15px)' }
                                            )
                                        }}>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>
                                                Rúbrica (v2.0): {item.label}
                                            </h4>
                                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                                                {item.levels.map((level, i) => (
                                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '45px 1fr', gap: '0.75rem', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                                        <span style={{ fontWeight: 800, color: '#8B5CF6', textAlign: 'right' }}>{level.range}</span>
                                                        <span style={{ opacity: 0.9 }}>{level.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Triángulo del Tooltip */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '10px solid transparent',
                                                borderRight: '10px solid transparent',
                                                ...(isTopItem
                                                    ? { bottom: '100%', borderBottom: '10px solid #1E293B' }
                                                    : { top: '100%', borderTop: '10px solid #1E293B' }
                                                )
                                            }}></div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        placeholder="0-10"
                                        style={{
                                            width: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            border: '2px solid #E2E8F0',
                                            fontSize: '1.1rem',
                                            fontWeight: 900,
                                            textAlign: 'center',
                                            outline: 'none',
                                            color: '#3B82F6',
                                            backgroundColor: '#F8FAFC'
                                        }}
                                        value={contentScores[item.id] || ''}
                                        onChange={(e) => {
                                            const val = Math.min(10, Math.max(0, Number(e.target.value)));
                                            setContentScores(prev => ({ ...prev, [item.id]: val }));
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* B. FORMATO */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '3rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #F1F5F9'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>B. Formato (Máx 1 Punto)</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {rubric.formatItems.map(item => (
                            <label key={item.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.25rem 1.5rem',
                                borderRadius: '16px',
                                backgroundColor: formatScores[item.id] ? '#F0FDF4' : 'white',
                                border: '2px solid',
                                borderColor: formatScores[item.id] ? '#BBF7D0' : '#F1F5F9',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <span style={{ fontWeight: 700, color: formatScores[item.id] ? '#15803D' : '#475569' }}>{item.label}</span>
                                <input
                                    type="checkbox"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        accentColor: '#10B981',
                                        cursor: 'pointer'
                                    }}
                                    checked={formatScores[item.id] || false}
                                    onChange={(e) => {
                                        setFormatScores(prev => ({ ...prev, [item.id]: e.target.checked }));
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Floating Action Bar Premium */}
                {/* Floating Action Bar - Compacto */}
                <div style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 2rem)',
                    maxWidth: '900px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    zIndex: 1000
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.1rem' }}>
                                Nota Provisional
                            </span>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {calculateTotal()}
                            </div>
                        </div>
                        <div style={{ height: '30px', width: '1px', backgroundColor: '#E2E8F0' }}></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', lineHeight: 1.2 }}>
                            Contenido (90%) <br /> Formato (10%)
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => router.back()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: 'white',
                                color: '#64748B',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                                color: 'white',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {submitting ? '...' : (
                                <>
                                    <span>✓</span>
                                    <span>Finalizar Evaluación</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            );
}
