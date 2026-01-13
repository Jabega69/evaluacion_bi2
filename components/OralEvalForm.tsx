'use client';

import { useState } from 'react';
import { OralRubric, Project, Student } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
    rubric: OralRubric;
    project: Project;
    student: Student;
    graderId: string;
}

export default function OralEvalForm({ rubric, project, student, graderId }: Props) {
    const router = useRouter();
    const [blockScores, setBlockScores] = useState<Record<string, number>>({});
    const [selectedTimeRange, setSelectedTimeRange] = useState<number>(-1);
    const [submitting, setSubmitting] = useState(false);
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

    const calculateTotal = () => {
        const blocksSum = Object.values(blockScores).reduce((a, b) => a + b, 0);

        let timeScore = 0;
        if (selectedTimeRange !== -1) {
            timeScore = rubric.timeRanges[selectedTimeRange].score;
        }

        return (blocksSum + timeScore).toFixed(2);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.submissions.submitOral({
                id: crypto.randomUUID(),
                projectId: project.id,
                studentId: student.id,
                graderId: graderId,
                blockScores,
                timeScore: selectedTimeRange !== -1 ? rubric.timeRanges[selectedTimeRange].score : 0,
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
            {/* Header Moderno-Pink */}
            {/* Header Moderno-Pink */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem 2rem',
                marginBottom: '3rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9',
                textAlign: 'center'
            }}>
                <span style={{
                    backgroundColor: '#EC4899',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '99px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '1.5rem',
                    display: 'inline-block'
                }}>
                    Evaluación Oral
                </span>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Evaluando a: <span style={{ color: '#EC4899' }}>{student.name}</span>
                </h1>
                <p style={{ color: '#64748B', fontSize: '1.25rem', fontWeight: 600 }}>Proyecto: {project.title}</p>
            </div>

            {/* COMPETENCIAS ORALES */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Competencias Orales (Máx 9 Puntos)</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Valore cada bloque según el desempeño del estudiante durante la exposición.</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {rubric.blocks.map(item => (
                        <div key={item.id}
                            onMouseEnter={() => setHoveredBlock(item.id)}
                            onMouseLeave={() => setHoveredBlock(null)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '2rem',
                                padding: '1.5rem 2rem',
                                borderRadius: '20px',
                                backgroundColor: hoveredBlock === item.id ? '#FFF1F2' : 'white',
                                border: '2px solid',
                                borderColor: hoveredBlock === item.id ? '#FECDD3' : '#F1F5F9',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.25rem' }}>{item.label}</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EC4899', textTransform: 'uppercase' }}>Máximo: {item.maxScore} pts</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min="0"
                                    max={item.maxScore}
                                    step="0.1"
                                    placeholder="0-9"
                                    style={{
                                        width: '100px',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        border: '2px solid #E2E8F0',
                                        fontSize: '1.25rem',
                                        fontWeight: 900,
                                        textAlign: 'center',
                                        outline: 'none',
                                        color: '#D946EF',
                                        backgroundColor: 'white'
                                    }}
                                    value={blockScores[item.id] !== undefined ? blockScores[item.id] : ''}
                                    onChange={(e) => {
                                        const val = Math.min(item.maxScore, Math.max(0, Number(e.target.value)));
                                        setBlockScores(prev => ({ ...prev, [item.id]: val }));
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TIEMPO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '30px',
                padding: '3rem',
                marginBottom: '4rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Adecuación al Tiempo (Máx 1 Punto)</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Seleccione el rango de duración de la ponencia.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {rubric.timeRanges.map((range, index) => (
                        <div key={index}
                            onClick={() => setSelectedTimeRange(index)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '20px',
                                backgroundColor: selectedTimeRange === index ? '#1E293B' : 'white',
                                color: selectedTimeRange === index ? 'white' : '#1E293B',
                                border: '2px solid',
                                borderColor: selectedTimeRange === index ? '#1E293B' : '#F1F5F9',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', opacity: selectedTimeRange === index ? 0.7 : 0.5 }}>{range.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{range.score} pts</div>
                            {selectedTimeRange === index && (
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#EC4899', fontSize: '0.8rem' }}>✓</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Bar Pink-Orange */}
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
                            background: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {calculateTotal()}
                        </div>
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
                            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                            color: 'white',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.3)',
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
