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
    };

    return (
        <div className="animate-in" style={{ padding: '48px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="card mb-8" style={{ padding: '32px' }}>
                <div className="flex items-center gap-3 mb-3">
                    <span className="badge badge-pink">EVALUACIÓN ORAL</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {project.title}
                    </span>
                </div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins', color: 'var(--text-primary)' }}>
                    Evaluando a: {student.name}
                </h2>
            </div>

            <div className="card mb-6" style={{ padding: '32px' }}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Poppins' }}>Competencias Orales (Máx 9 Puntos)</h3>
                </div>

                <div className="space-y-6">
                    {rubric.blocks.map(item => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="md:col-span-9">
                                <label className="font-semibold text-base block mb-1" style={{ color: 'var(--text-primary)' }}>{item.label}</label>
                                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Máx: {item.maxScore} pts</div>
                            </div>
                            <div className="md:col-span-3">
                                <input
                                    type="number"
                                    min="0"
                                    max={item.maxScore}
                                    step="0.1"
                                    className="w-full p-3 text-center border-2 rounded-lg font-bold text-lg transition-all focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                                    style={{ borderColor: '#E5E7EB' }}
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

            <div className="card mb-32" style={{ padding: '32px' }}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Poppins' }}>Adecuación al Tiempo (Máx 1 Punto)</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {rubric.timeRanges.map((range, index) => (
                        <label key={index} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTimeRange === index
                                ? 'border-pink-500 bg-pink-50'
                                : 'bg-white border-gray-200 hover:border-pink-300'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <input
                                    type="radio"
                                    name="timeRange"
                                    className="mt-1 h-5 w-5 text-pink-600 border-2 focus:ring-pink-500"
                                    checked={selectedTimeRange === index}
                                    onChange={() => setSelectedTimeRange(index)}
                                />
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${range.score >= 1 ? 'bg-emerald-100 text-emerald-700' :
                                        range.score > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {range.score} pts
                                </span>
                            </div>
                            <span className="font-semibold text-sm">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Floating Action Bar - Sin gris */}
            <div className="fixed bottom-0 left-280 right-0 bg-white border-t-2 p-6 z-40" style={{ borderColor: '#E5E7EB', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }} className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>Nota Provisional</span>
                        <div className="text-5xl font-black" style={{ fontFamily: 'Poppins', background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {calculateTotal()}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-8 py-4 text-base rounded-xl font-bold transition-all"
                            style={{
                                background: 'white',
                                border: '2px solid #EC4899',
                                color: '#EC4899'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FDF2F8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-10 py-4 text-base rounded-xl font-bold text-white transition-all"
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
                            {submitting ? 'Guardando...' : '✓ Finalizar Evaluación'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
