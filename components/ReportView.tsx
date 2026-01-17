'use client';

import { Project, WrittenRubric, OralRubric, TutorRubric } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { generateDetailedPDF } from '@/lib/pdf-generator';


interface Props {
    project: Project;
}

export default function ReportView({ project }: Props) {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const initialStudentId = searchParams.get('studentId');

    const [selectedStudentId, setSelectedStudentId] = useState(
        initialStudentId || (project.students[0]?.id || '')
    );
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'standard' | 'expert'>('standard');
    const [rubrics, setRubrics] = useState<{ written: WrittenRubric | null, oral: OralRubric | null, tutor: TutorRubric | null }>({
        written: null,
        oral: null,
        tutor: null
    });

    useEffect(() => {
        loadRubrics();
    }, []);

    useEffect(() => {
        if (selectedStudentId) {
            loadReport(selectedStudentId);
        }
    }, [selectedStudentId]);

    const loadRubrics = async () => {
        const [w, o, t] = await Promise.all([
            api.rubrics.getWritten(),
            api.rubrics.getOral(),
            api.rubrics.getTutor()
        ]);
        setRubrics({ written: w, oral: o as any, tutor: t as any });
    };

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

    const handleExportPDF = (preview: boolean = false) => {
        if (!reportData || !project) return;
        generateDetailedPDF(
            reportData,
            project,
            studentName,
            rubrics,
            isAdmin || false,
            user?.id,
            preview
        );
    };


    const studentName = project.students.find(s => s.id === selectedStudentId)?.name || 'Estudiante';

    // Determinar qué puede ver cada uno
    const isAdmin = user?.roles.includes('admin');

    return (
        <div className="animate-in w-full" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem' }}>
            {/* Header Actions */}
            <div className="no-print" style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #F1F5F9',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                        {viewMode === 'standard' ? 'Acta de Resultados' : 'Informe Detallado'} 📑 <span style={{ fontSize: '0.6rem', verticalAlign: 'middle', opacity: 0.3 }}>v2.4</span>
                    </h2>
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        {viewMode === 'standard' ? 'Documento oficial de evaluación académica' : 'Análisis exhaustivo por ítem y evaluador'}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#F8FAFC',
                    padding: '0.4rem',
                    borderRadius: '20px',
                    border: '1px solid #F1F5F9'
                }}>
                    <button
                        onClick={() => setViewMode(viewMode === 'standard' ? 'expert' : 'standard')}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '14px',
                            fontWeight: 900,
                            fontSize: '0.7rem',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'expert' ? '#4F46E5' : 'white',
                            color: viewMode === 'expert' ? 'white' : '#64748B',
                            boxShadow: viewMode === 'expert' ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        {viewMode === 'standard' ? '🔬 Modo Experto' : '📄 Modo Acta'}
                    </button>

                    <div style={{ width: '1px', height: '20px', backgroundColor: '#E2E8F0', margin: '0 0.25rem' }}></div>

                    <button
                        onClick={() => handleExportPDF(true)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '14px',
                            fontWeight: 900,
                            fontSize: '0.7rem',
                            backgroundColor: 'white',
                            color: '#059669',
                            border: '1px solid #D1FAE5',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        👁️ Ver PDF
                    </button>

                    <button
                        onClick={() => handleExportPDF(false)}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '14px',
                            backgroundColor: '#EEF2FF',
                            color: '#4F46E5',
                            border: '1px solid #E0E7FF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Descargar PDF"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>

                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '14px',
                            backgroundColor: 'white',
                            color: '#94A3B8',
                            border: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Imprimir"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="no-print" style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08rem', color: '#94A3B8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366F1' }}></span>
                        Seleccionar Alumno
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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

            <div className="flex-1" style={{ width: '100%', paddingBottom: '2.5rem' }}>
                {loading ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '32px',
                        height: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #F1F5F9',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '5px solid #EEF2FF',
                            borderTop: '5px solid #4F46E5',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '1rem'
                        }}></div>
                        <p style={{ color: '#0F172A', fontWeight: 800, fontSize: '1rem' }}>Generando informe detallado...</p>
                    </div>
                ) : reportData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-in">
                        {viewMode === 'standard' ? (
                            <>
                                {/* STANDARD VIEW */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                                    borderRadius: '32px',
                                    padding: '2.5rem',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2rem'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20%',
                                        right: '-10%',
                                        width: '300px',
                                        height: '300px',
                                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                                        borderRadius: '50%'
                                    }} />

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '2rem',
                                        position: 'relative',
                                        zIndex: 10
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                padding: '0.4rem 0.8rem',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                letterSpacing: '0.12em',
                                                textTransform: 'uppercase',
                                                color: '#818CF8',
                                                marginBottom: '1rem'
                                            }}>Expediente de Evaluación</div>
                                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                                {studentName}
                                            </h1>
                                            <p style={{ fontSize: '1.1rem', color: '#94A3B8', fontWeight: 600, opacity: 0.8 }}>
                                                {project.title}
                                            </p>
                                        </div>

                                        <div style={{
                                            backgroundColor: 'rgba(255,255,255,0.07)',
                                            backdropFilter: 'blur(12px)',
                                            borderRadius: '28px',
                                            padding: '1.5rem 2rem',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            textAlign: 'center',
                                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#818CF8', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Calificación Final</div>
                                            <div style={{ fontSize: '4rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.05em', color: '#FFFFFF' }}>
                                                {reportData.total}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#6366F1', fontWeight: 800, marginTop: '0.4rem' }}>SOBRE 10.00</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.25rem'
                                }}>
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

                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '32px',
                                    padding: '2rem',
                                    border: '1px solid #F1F5F9',
                                    boxShadow: '0 15px 30px -15px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Calificaciones por Evaluador */}
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>📋</span> Calificaciones de los Evaluadores
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                gap: '1rem'
                                            }}>
                                                {reportData.evaluations.map((ev: any, i: number) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1.25rem',
                                                        borderRadius: '20px',
                                                        backgroundColor: '#F8FAFC',
                                                        border: '1px solid #F1F5F9'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '12px',
                                                                backgroundColor: ev.type === 'written' ? '#EEF2FF' : (ev.type === 'oral' ? '#FFF1F2' : '#F0FDF4'),
                                                                color: ev.type === 'written' ? '#4F46E5' : (ev.type === 'oral' ? '#E11D48' : '#166534'),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1rem',
                                                                fontWeight: 900
                                                            }}>
                                                                {ev.type === 'written' ? 'W' : (ev.type === 'oral' ? 'O' : 'T')}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>{ev.graderName}</div>
                                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{ev.type}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A' }}>
                                                            {ev.totalScore}<span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 800, marginLeft: '0.2rem' }}>/10</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Line Separator */}
                                        <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9' }}></div>

                                        {/* Observaciones */}
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>✒️</span> Observaciones del Tribunal
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {reportData.evaluations.filter((ev: any) => ev.feedback).length === 0 ? (
                                                    <div style={{
                                                        padding: '3rem 2rem',
                                                        textAlign: 'center',
                                                        backgroundColor: '#F8FAFC',
                                                        borderRadius: '24px',
                                                        border: '2px dashed #E2E8F0',
                                                        color: '#94A3B8'
                                                    }}>
                                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😴</div>
                                                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>No se han registrado observaciones todavía.</p>
                                                    </div>
                                                ) : (
                                                    reportData.evaluations.map((ev: any, i: number) => ev.feedback && (
                                                        <div key={i} style={{
                                                            padding: '1.5rem',
                                                            borderRadius: '24px',
                                                            backgroundColor: '#F8FAFC',
                                                            border: '1px solid #F1F5F9'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 900,
                                                                color: '#94A3B8',
                                                                marginBottom: '0.75rem',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                letterSpacing: '0.05em'
                                                            }}>
                                                                <span>{ev.graderName.toUpperCase()}</span>
                                                                <span style={{
                                                                    color: ev.type === 'written' ? '#6366F1' : (ev.type === 'oral' ? '#F43F5E' : '#10B981'),
                                                                    backgroundColor: 'white',
                                                                    padding: '0.2rem 0.5rem',
                                                                    borderRadius: '6px',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                }}>{ev.type.toUpperCase()}</span>
                                                            </div>
                                                            <p style={{ fontSize: '1rem', color: '#334155', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>"{ev.feedback}"</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <ExpertView
                                reportData={reportData}
                                rubrics={rubrics}
                                isAdmin={isAdmin}
                                currentUserId={user?.id}
                            />
                        )}
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
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{Number(score).toFixed(2)}</span>
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
                <div style={{ fontSize: '1rem', fontWeight: 900, color: color }}>+{Number(totalPoints).toFixed(2)}</div>
            </div>
        </div>
    );
}

function ExpertView({ reportData, rubrics, isAdmin, currentUserId }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
                backgroundColor: '#4F46E5',
                borderRadius: '24px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
            }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Auditoría de Puntuaciones</h3>
                <p style={{ color: '#E0E7FF', fontSize: '0.9rem', fontWeight: 600 }}>Desglose técnico de cada componente de la rúbrica.</p>
            </div>

            {/* Resumen de evaluadores */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid #F1F5F9',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                overflowX: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #F8FAFC' }}>
                            <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8' }}>Evaluador</th>
                            <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8' }}>Tipo</th>
                            <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8', textAlign: 'center' }}>Nota Base 10</th>
                            <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8', textAlign: 'right' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: '#475569' }}>
                        {reportData.evaluations.map((ev: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 800 }}>{ev.graderName}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '8px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        backgroundColor: ev.type === 'written' ? '#EEF2FF' : (ev.type === 'oral' ? '#FFF1F2' : '#F0FDF4'),
                                        color: ev.type === 'written' ? '#4F46E5' : (ev.type === 'oral' ? '#E11D48' : '#166534'),
                                    }}>{ev.type}</span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>{ev.totalScore}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {(isAdmin || ev.grader_id === currentUserId) ? (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6366F1', backgroundColor: '#EEF2FF', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>DETALLE VISIBLE</span>
                                    ) : (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>SOLO TOTAL</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Desglose de Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reportData.evaluations.map((ev: any, i: number) => {
                    const canViewDetails = isAdmin || ev.grader_id === currentUserId;
                    if (!canViewDetails) return null;

                    return (
                        <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '32px',
                            padding: '2rem',
                            border: '1px solid #F1F5F9',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366F1' }}></span>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desglose por Ítem</div>
                                    </div>
                                    <h5 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B' }}>{ev.graderName} <span style={{ color: '#94A3B8', fontWeight: 600 }}>({ev.type})</span></h5>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Puntuación</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0F172A' }}>{ev.totalScore}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 700 }}>/10</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {ev.type === 'written' && rubrics.written && (
                                    <>
                                        {rubrics.written.contentItems.map((item: any) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', backgroundColor: '#F8FAFC' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{item.label}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 950, color: '#4F46E5' }}>{ev.scores.contentScores?.[item.id] || 0} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>/10</span></span>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #F1F5F9' }}>
                                            <h6 style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '1rem' }}>Formato y Estilo</h6>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                {rubrics.written.formatItems.map((item: any) => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '14px', backgroundColor: 'white', border: '1px solid #F1F5F9' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>{item.label}</span>
                                                        <span>{ev.scores.formatScores?.[item.id] ? "✅" : "❌"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {ev.type === 'oral' && rubrics.oral && (
                                    <>
                                        {rubrics.oral.blocks.map((item: any) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', backgroundColor: '#F8FAFC' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{item.label}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 950, color: '#E11D48' }}>{ev.scores.blockScores?.[item.id] || 0} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>/{item.maxScore}</span></span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', backgroundColor: '#FFF1F2', border: '1px solid #FFE4E6', marginTop: '1rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#BE123C' }}>Puntuación por Tiempo</span>
                                            <span style={{ fontSize: '1rem', fontWeight: 950, color: '#BE123C' }}>+{ev.scores.timeScore || 0} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>/1.0</span></span>
                                        </div>
                                    </>
                                )}
                                {ev.type === 'tutor' && rubrics.tutor && (
                                    <>
                                        {rubrics.tutor.items.map((item: any) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', backgroundColor: '#F8FAFC' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{item.label}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 950, color: '#059669' }}>{ev.scores.scores?.[item.id] || 0} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>/2</span></span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
