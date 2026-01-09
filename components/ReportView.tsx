'use client';

import { Project } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Props {
    project: Project;
}

export default function ReportView({ project }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState(project.students[0]?.id || '');
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

    // Fallback if no report yet
    const studentName = project.students.find(s => s.id === selectedStudentId)?.name || 'Estudiante';

    return (
        <div className="animate-in w-full" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 80px' }}>
            <div className="flex justify-end gap-3 mb-6 no-print">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Imprimir Informe
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Alumnos Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-4 no-print">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ver informe de:</h3>
                    <div className="flex flex-col gap-2">
                        {project.students.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStudentId(s.id)}
                                className={`text-left px-6 py-4 rounded-2xl transition-all font-black ${selectedStudentId === s.id
                                        ? 'text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white text-slate-600 border-2 border-slate-50 hover:border-indigo-100'
                                    }`}
                                style={selectedStudentId === s.id ? { background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' } : {}}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {loading ? (
                        <div className="card p-20 flex flex-col items-center justify-center bg-white rounded-[32px]">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-indigo-600 font-bold">Calculando notas finales...</p>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-8">
                            <div className="card text-white overflow-hidden p-0 border-none shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '40px' }}>
                                <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <div className="relative z-10 text-center md:text-left">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-4">Informe Final Consolidado</span>
                                        <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Poppins' }}>{studentName}</h1>
                                        <p className="text-xl text-slate-300 font-medium">{project.title}</p>
                                    </div>
                                    <div className="relative z-10 p-8 rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 text-center min-w-[180px]">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Puntuación Total</div>
                                        <div className="text-7xl font-black" style={{ fontFamily: 'Poppins' }}>{reportData.total}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <ScoreCard label="Escrita (50%)" score={reportData.written.score} final={reportData.written.final} color="#6366F1" />
                                <ScoreCard label="Oral (30%)" score={reportData.oral.score} final={reportData.oral.final} color="#EC4899" />
                                <ScoreCard label="Tutoría (20%)" score={reportData.tutor.score} final={reportData.tutor.final} color="#14B8A6" />
                            </div>

                            <div className="card p-10 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border-none">
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3" style={{ fontFamily: 'Poppins' }}>
                                    <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">💬</span>
                                    Feedback de Evaluación
                                </h3>
                                <div className="space-y-4">
                                    {reportData.evaluations.length === 0 ? (
                                        <p className="text-slate-400 italic">No hay comentarios registrados todavía.</p>
                                    ) : (
                                        reportData.evaluations.map((ev: any, i: number) => ev.feedback && (
                                            <div key={i} className="p-6 rounded-[24px] bg-slate-50 border-2 border-slate-50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ev.type} evaluation</span>
                                                </div>
                                                <p className="text-slate-700 font-medium italic">"{ev.feedback}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card p-32 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                            <div className="text-6xl mb-8 opacity-20">📊</div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2" style={{ fontFamily: 'Poppins' }}>Faltan Calificaciones</h3>
                            <p className="text-slate-300 font-bold">Aún no se han registrado evaluaciones para este alumno.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreCard({ label, score, final, color }: { label: string, score: number, final: number, color: string }) {
    return (
        <div className="card p-8 bg-white rounded-[32px] border-none shadow-xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -mr-12 -mt-12 transition-transform group-hover:scale-125" style={{ background: color }}></div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{label}</h3>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black" style={{ fontFamily: 'Poppins', color: color }}>{score}</span>
                <span className="text-slate-400 font-black text-sm">/ 10</span>
            </div>
            <div className="text-sm font-bold text-slate-500">Ponderado: <span className="text-slate-900">+{final} pts</span></div>
        </div>
    );
}
