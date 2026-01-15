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
        <div className="animate-in w-full" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem' }}>
            {/* Header Actions - More compact */}
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.1rem' }}>
                        Resultados Finales
                    </h2>
                    <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.85rem' }}>Acta de evaluación oficial</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        title="Imprimir Informe"
                        className="p-3 rounded-xl transition-all bg-white border-2 border-slate-100 text-slate-600 shadow-sm hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md active:scale-95 flex items-center justify-center"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                    <button
                        onClick={handlePrint}
                        title="Exportar PDF"
                        className="p-3 rounded-xl transition-all bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md active:scale-95 flex items-center justify-center border-2 border-indigo-600"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Alumnos Sidebar - Narrower and more compact items */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-4 no-print">
                    <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
                        <h3 style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08rem', color: '#94A3B8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Alumnos del Proyecto
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            {project.students.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStudentId(s.id)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        position: 'relative',
                                        backgroundColor: selectedStudentId === s.id ? '#F8FAFC' : 'transparent',
                                    }}
                                    className={`group ${selectedStudentId === s.id ? 'active-student' : ''}`}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: 900,
                                        backgroundColor: selectedStudentId === s.id ? '#6366F1' : '#F1F5F9',
                                        color: selectedStudentId === s.id ? 'white' : '#64748B',
                                        transition: 'all 0.3s'
                                    }}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            color: selectedStudentId === s.id ? '#0F172A' : '#475569',
                                            transition: 'all 0.3s',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>{s.name}</div>
                                    </div>
                                    {selectedStudentId === s.id && (
                                        <div style={{
                                            width: '4px',
                                            height: '16px',
                                            backgroundColor: '#6366F1',
                                            borderRadius: '10px',
                                            position: 'absolute',
                                            right: '8px'
                                        }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full pb-10">
                    {loading ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '32px',
                            height: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #F1F5F9'
                        }}>
                            <div className="w-12 h-12 border-[5px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p style={{ color: '#0F172A', fontWeight: 800, fontSize: '1rem' }}>Sincronizando notas...</p>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6 animate-in">
                            {/* Main Score Header - More Compact */}
                            <div style={{
                                background: 'linear-gradient(145deg, #0F172A 0%, #334155 100%)',
                                borderRadius: '32px',
                                padding: '2rem 3rem',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.3)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20%',
                                    right: '-10%',
                                    width: '300px',
                                    height: '300px',
                                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }} />

                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                    <div className="text-center md:text-left flex-1">
                                        <div style={{
                                            display: 'inline-flex',
                                            padding: '0.35rem 0.75rem',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            borderRadius: '8px',
                                            fontSize: '0.6rem',
                                            fontWeight: 900,
                                            letterSpacing: '0.1rem',
                                            textTransform: 'uppercase',
                                            color: '#818CF8',
                                            marginBottom: '1rem'
                                        }}>Extracto de Evaluación Académica</div>
                                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                            {studentName}
                                        </h1>
                                        <p style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 500 }}>
                                            {project.title}
                                        </p>
                                    </div>

                                    <div style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '24px',
                                        padding: '1.25rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        minWidth: '130px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#818CF8', marginBottom: '0.1rem' }}>Puntuación</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
                                            {reportData.total}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginTop: '0.1rem' }}>Base 10.0</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Cards - Smaller */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <DetailScore
                                    label="Escrita"
                                    weight="50%"
                                    score={reportData.written.score}
                                    totalPoints={reportData.written.final}
                                    color="#6366F1"
                                    emoji="📄"
                                />
                                <DetailScore
                                    label="Oral"
                                    weight="30%"
                                    score={reportData.oral.score}
                                    totalPoints={reportData.oral.final}
                                    color="#F43F5E"
                                    emoji="🎙️"
                                />
                                <DetailScore
                                    label="Tutoría"
                                    weight="20%"
                                    score={reportData.tutor.score}
                                    totalPoints={reportData.tutor.final}
                                    color="#10B981"
                                    emoji="👥"
                                />
                            </div>

                            {/* Feedback Section - More compact padding */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '32px',
                                padding: '2rem',
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 15px 30px -15px rgba(0,0,0,0.05)'
                            }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>✒️</span> Observaciones
                                </h3>

                                <div className="space-y-4">
                                    {reportData.evaluations.filter((ev: any) => ev.feedback).length === 0 ? (
                                        <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '16px' }}>No hay observaciones registradas.</p>
                                    ) : (
                                        reportData.evaluations.map((ev: any, i: number) => ev.feedback && (
                                            <div key={i} style={{
                                                padding: '1.25rem',
                                                borderRadius: '20px',
                                                backgroundColor: '#F8FAFC',
                                                border: '1px solid #F1F5F9',
                                            }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.6rem',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: ev.type === 'written' ? '#EEF2FF' : (ev.type === 'oral' ? '#FFF1F2' : '#F0FDF4'),
                                                    color: ev.type === 'written' ? '#4F46E5' : (ev.type === 'oral' ? '#E11D48' : '#166534'),
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {ev.type}
                                                </span>
                                                <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5 }}>"{ev.feedback}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            borderRadius: '32px',
                            border: '3px dashed #F1F5F9'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#94A3B8' }}>Expediente en Proceso</h3>
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
            borderRadius: '24px',
            padding: '1.25rem',
            border: '1px solid #F1F5F9',
            boxShadow: '0 10px 20px -5px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
        }} className="hover:scale-[1.02] transition-transform">
            <div style={{
                position: 'absolute',
                top: -5,
                right: -5,
                fontSize: '2.5rem',
                opacity: 0.04,
                transform: 'rotate(15deg)'
            }}>{emoji}</div>

            <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {label} <span style={{ color: color }}>({weight})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{score}</span>
                    <span style={{ color: '#CBD5E1', fontWeight: 800, fontSize: '0.9rem' }}>/10</span>
                </div>
            </div>

            <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Puntos:</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: color }}>+{totalPoints}</div>
            </div>
        </div>
    );
}
