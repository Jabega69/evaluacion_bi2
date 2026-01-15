'use client';

import { Project } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface Props {
    project: Project;
}

export default function ReportView({ project }: Props) {
    const searchParams = useSearchParams();
    const initialStudentId = searchParams.get('studentId');

    const [selectedStudentId, setSelectedStudentId] = useState(
        initialStudentId || (project.students[0]?.id || '')
    );
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedStudentId) {
            loadReport(selectedStudentId);
        }
    }, [selectedStudentId]);

    const loadReport = async (studentId: string) => {
        setLoading(true);
        try {
            const data = await api.projects.getReport(project.id, studentId);
            setReportData(data);
        } catch (err) {
            console.error('Error loading report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const studentName = project.students.find(s => s.id === selectedStudentId)?.name || 'Estudiante';

    return (
        <div className="animate-in w-full" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-10 no-print">
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                        Resultados Finales
                    </h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Consulta y exportación del acta de evaluación</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all bg-white border-2 border-slate-100 text-slate-900 shadow-sm hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md active:scale-95"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Imprimir Informe / Exportar PDF
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Alumnos Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-4 no-print">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <h3 style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem', color: '#94A3B8', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Alumnos del Proyecto
                        </h3>
                        <div className="flex flex-col gap-2">
                            {project.students.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStudentId(s.id)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1.25rem 1.5rem',
                                        borderRadius: '20px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        position: 'relative',
                                        backgroundColor: selectedStudentId === s.id ? '#F8FAFC' : 'transparent',
                                    }}
                                    className={`group ${selectedStudentId === s.id ? 'active-student' : ''}`}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 900,
                                        backgroundColor: selectedStudentId === s.id ? '#6366F1' : '#F1F5F9',
                                        color: selectedStudentId === s.id ? 'white' : '#64748B',
                                        transition: 'all 0.3s'
                                    }}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 800,
                                            fontSize: '0.95rem',
                                            color: selectedStudentId === s.id ? '#0F172A' : '#475569',
                                            transition: 'all 0.3s'
                                        }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Ver reporte</div>
                                    </div>
                                    {selectedStudentId === s.id && (
                                        <div style={{
                                            width: '6px',
                                            height: '24px',
                                            backgroundColor: '#6366F1',
                                            borderRadius: '10px',
                                            position: 'absolute',
                                            right: '12px'
                                        }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full pb-20">
                    {loading ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '40px',
                            height: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #F1F5F9'
                        }}>
                            <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                            <p style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.2rem' }}>Auditando notas finales...</p>
                            <p style={{ color: '#94A3B8', fontWeight: 500, marginTop: '0.5rem' }}>Sincronizando con actas oficiales</p>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-8 animate-in">
                            {/* Main Score Header */}
                            <div style={{
                                background: 'linear-gradient(145deg, #0F172A 0%, #334155 100%)',
                                borderRadius: '48px',
                                padding: '4rem',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.4)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-10%',
                                    right: '-10%',
                                    width: '400px',
                                    height: '400px',
                                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }} />

                                <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                                    <div className="text-center md:text-left flex-1">
                                        <div style={{
                                            display: 'inline-flex',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            letterSpacing: '0.15rem',
                                            textTransform: 'uppercase',
                                            color: '#818CF8',
                                            marginBottom: '1.5rem'
                                        }}>Extracto de Evaluación Académica</div>
                                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                                            {studentName}
                                        </h1>
                                        <p style={{ fontSize: '1.25rem', color: '#94A3B8', fontWeight: 500, maxWidth: '600px' }}>
                                            {project.title}
                                        </p>
                                    </div>

                                    <div style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '40px',
                                        padding: '2.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        minWidth: '220px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#818CF8', marginBottom: '0.5rem' }}>Puntuación Final</div>
                                        <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em' }}>
                                            {reportData.total}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 700, marginTop: '0.5rem' }}>Baremo sobre 10.0</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Cards */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <DetailScore
                                    label="Evaluación Escrita"
                                    weight="50%"
                                    score={reportData.written.score}
                                    totalPoints={reportData.written.final}
                                    color="#6366F1"
                                    emoji="📄"
                                />
                                <DetailScore
                                    label="Defensa Oral"
                                    weight="30%"
                                    score={reportData.oral.score}
                                    totalPoints={reportData.oral.final}
                                    color="#F43F5E"
                                    emoji="🎙️"
                                />
                                <DetailScore
                                    label="Seguimiento Tutor"
                                    weight="20%"
                                    score={reportData.tutor.score}
                                    totalPoints={reportData.tutor.final}
                                    color="#10B981"
                                    emoji="👥"
                                />
                            </div>

                            {/* Feedback Section */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '40px',
                                padding: '3.5rem',
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 20px 40px -20px rgba(0,0,0,0.05)'
                            }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '2rem' }}>✒️</span> Observaciones del Tribunal
                                </h3>

                                <div className="space-y-6">
                                    {reportData.evaluations.filter((ev: any) => ev.feedback).length === 0 ? (
                                        <div style={{
                                            padding: '3rem',
                                            textAlign: 'center',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: '32px',
                                            border: '2px dashed #E2E8F0'
                                        }}>
                                            <p style={{ color: '#94A3B8', fontWeight: 700, fontSize: '1.1rem' }}>No se han registrado observaciones adicionales.</p>
                                        </div>
                                    ) : (
                                        reportData.evaluations.map((ev: any, i: number) => ev.feedback && (
                                            <div key={i} style={{
                                                padding: '2rem',
                                                borderRadius: '32px',
                                                backgroundColor: '#F8FAFC',
                                                border: '1px solid #F1F5F9',
                                                position: 'relative'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '10px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        backgroundColor: ev.type === 'written' ? '#EEF2FF' : (ev.type === 'oral' ? '#FFF1F2' : '#F0FDF4'),
                                                        color: ev.type === 'written' ? '#4F46E5' : (ev.type === 'oral' ? '#E11D48' : '#166534')
                                                    }}>
                                                        Comentario: {ev.type}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: '1.1rem',
                                                    color: '#334155',
                                                    fontWeight: 500,
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.6
                                                }}>"{ev.feedback}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '6rem 2rem',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            borderRadius: '48px',
                            border: '4px dashed #F1F5F9'
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>📊</div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#94A3B8', marginBottom: '1rem' }}>Expediente en Proceso</h3>
                            <p style={{ color: '#CBD5E1', fontWeight: 600, fontSize: '1.2rem' }}>Las actas de este alumno aún no están cerradas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailScore({ label, weight, score, totalPoints, color, emoji }: { label: string, weight: string, score: number, totalPoints: number, color: string, emoji: string }) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '40px',
            padding: '2.5rem',
            border: '1px solid #F1F5F9',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            transition: 'transform 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }} className="hover:scale-[1.02]">
            <div style={{
                position: 'absolute',
                top: -10,
                right: -10,
                fontSize: '4rem',
                opacity: 0.05,
                transform: 'rotate(15deg)'
            }}>{emoji}</div>

            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05rem'
                    }}>
                        {label} <span style={{ color: color }}>({weight})</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{score}</span>
                    <span style={{ color: '#CBD5E1', fontWeight: 800, fontSize: '1.2rem' }}>/10</span>
                </div>
            </div>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 700 }}>Puntos netos:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: color }}>+{totalPoints}</div>
            </div>
        </div>
    );
}
