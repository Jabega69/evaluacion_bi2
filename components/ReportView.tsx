'use client';

import { Project } from '@/types';
import { useState } from 'react';

const MOCK_STUDENT_RESULTS = {
    's1': {
        name: 'Juan Pérez',
        written: { score: 8.5, max: 10, final: 4.25 },
        oral: { score: 9.0, max: 10, final: 2.7 },
        tutor: { score: 10, max: 10, final: 2.0 },
        total: 8.95
    },
    's2': {
        name: 'Maria López',
        written: { score: 8.5, max: 10, final: 4.25 },
        oral: { score: 7.5, max: 10, final: 2.25 },
        tutor: { score: 9.0, max: 10, final: 1.8 },
        total: 8.30
    },
    's3': {
        name: 'Pedro Gomez',
        written: { score: 9.0, max: 10, final: 4.5 },
        oral: { score: 8.0, max: 10, final: 2.4 },
        tutor: { score: 10, max: 10, final: 2.0 },
        total: 8.90
    }
};

interface Props {
    project: Project;
}

export default function ReportView({ project }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState(project.students[0].id);
    const results = MOCK_STUDENT_RESULTS[selectedStudentId as keyof typeof MOCK_STUDENT_RESULTS] || MOCK_STUDENT_RESULTS['s1'];

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="animate-in w-full" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 80px' }}>
            {/* Action Buttons - Sin gris, con azul/degradado */}
            <div className="flex justify-end gap-3 mb-6 no-print">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{
                        background: 'white',
                        border: '2px solid #6366F1',
                        color: '#6366F1',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#6366F1';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Imprimir
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all text-white"
                    style={{
                        background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Descargar PDF
                </button>
            </div>

            <div className="flex gap-8 items-start">
                {/* Sidebar for Student Selection */}
                <div className="w-64 flex-shrink-0 space-y-3 no-print">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Alumnos del Proyecto</h3>
                    {project.students.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`text-left px-5 py-4 rounded-xl transition-all font-semibold w-full ${selectedStudentId === s.id
                                    ? 'text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            style={selectedStudentId === s.id ? {
                                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            } : {}}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                {/* Main Report Content */}
                <div className="flex-1">
                    {/* Hero Card */}
                    <div className="card mb-8" style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        padding: '40px',
                        color: 'white'
                    }}>
                        <div className="flex items-end justify-between gap-6">
                            <div className="flex-1">
                                <span className="badge mb-4" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Informe Individual</span>
                                <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Poppins' }}>{results.name}</h1>
                                <p className="text-lg opacity-90">{project.title}</p>
                            </div>
                            <div className="text-center px-8 py-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Nota Final</div>
                                <div className="text-6xl font-black" style={{ fontFamily: 'Poppins' }}>{results.total}</div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="card card-purple" style={{ padding: '24px' }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Escrita (50%)</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black" style={{ fontFamily: 'Poppins', color: '#8B5CF6' }}>{results.written.score}</span>
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/ 10</span>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Aporta {results.written.final} pts</p>
                        </div>
                        <div className="card card-pink" style={{ padding: '24px' }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Oral (30%)</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black" style={{ fontFamily: 'Poppins', color: '#EC4899' }}>{results.oral.score}</span>
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/ 10</span>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Aporta {results.oral.final} pts</p>
                        </div>
                        <div className="card card-teal" style={{ padding: '24px' }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Tutoría (20%)</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black" style={{ fontFamily: 'Poppins', color: '#14B8A6' }}>{results.tutor.score}</span>
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/ 10</span>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Aporta {results.tutor.final} pts</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '32px' }}>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
                            <span>💬</span> Feedback Consolidado
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl" style={{ background: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Tribunal</div>
                                <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>"Muy buen desempeño en la defensa oral, demostrando dominio del tema."</p>
                            </div>
                            <div className="p-4 rounded-xl" style={{ background: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Tribunal</div>
                                <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>"El trabajo escrito cumple con todos los requisitos formales."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .sidebar {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
          body {
            background: white !important;
          }
          .card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
        </div>
    );
}
