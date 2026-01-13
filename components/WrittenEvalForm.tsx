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
            padding: '3rem 2rem 10rem 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Header Moderno */}
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Evaluando a: <span style={{ color: '#8B5CF6' }}>{student.name}</span>
                </h1>
                <p style={{ color: '#64748B', fontWeight: 600 }}>Proyecto: {project.title}</p>
            </div>

            {/* A. CONTENIDO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>A. Contenido (Máx 9 Puntos)</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Valore cada ítem de 0 a 10 según la calidad del trabajo. Pasa el ratón por cada ítem para ver la rúbrica.</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {rubric.contentItems.map(item => (
                        <div key={item.id}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '2rem',
                                padding: '1.5rem 2rem',
                                borderRadius: '20px',
                                backgroundColor: hoveredItem === item.id ? '#F8FAFC' : 'white',
                                border: '2px solid',
                                borderColor: hoveredItem === item.id ? '#E2E8F0' : '#F1F5F9',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {item.label}
                                    {item.levels && <span style={{ fontSize: '1rem', cursor: 'help', opacity: 0.5 }}>ℹ️</span>}
                                </label>
                                {item.description && <p style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.description}</p>}

                                {/* Tooltip Rubrica */}
                                {hoveredItem === item.id && item.levels && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '2rem',
                                        backgroundColor: '#1E293B',
                                        color: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        width: '400px',
                                        zIndex: 100,
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94A3B8', marginBottom: '1rem', textTransform: 'uppercase' }}>Rúbrica: {item.label}</h4>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {item.levels.map((level, i) => (
                                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                                                    <span style={{ fontWeight: 800, color: '#8B5CF6' }}>{level.range}</span>
                                                    <span style={{ opacity: 0.9 }}>{level.description}</span>
                                                </div>
                                            ))}
                                        </div>
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
                                        width: '100px',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        border: '2px solid #E2E8F0',
                                        fontSize: '1.25rem',
                                        fontWeight: 900,
                                        textAlign: 'center',
                                        outline: 'none',
                                        color: '#3B82F6',
                                        backgroundColor: 'white'
                                    }}
                                    value={contentScores[item.id] || ''}
                                    onChange={(e) => {
                                        const val = Math.min(10, Math.max(0, Number(e.target.value)));
                                        setContentScores(prev => ({ ...prev, [item.id]: val }));
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* B. FORMATO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '4rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>B. Formato (Máx 1 Punto)</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Verifique el cumplimiento de normas de estilo.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
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
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.2rem' }}>
                            Nota Provisional
                        </span>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {calculateTotal()}
                        </div>
                    </div>
                    <div style={{ height: '40px', width: '2px', backgroundColor: '#E2E8F0' }}></div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>
                        Basado en Contenido (90%) <br /> y Formato (10%)
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '16px',
                            border: '2px solid #E2E8F0',
                            backgroundColor: 'white',
                            color: '#64748B',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            padding: '1rem 2.5rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                            color: 'white',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
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
