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
    };

    return (
        <div className="animate-in" style={{ padding: '48px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="card mb-8" style={{ padding: '32px' }}>
                <div className="flex items-center gap-3 mb-3">
                    <span className="badge badge-purple">EVALUACIÓN ESCRITA</span>
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
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Poppins' }}>A. Contenido (Máx 9 Puntos)</h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Valore cada ítem de 0 a 10 según la calidad del trabajo.</p>
                </div>

                <div className="space-y-6">
                    {rubric.contentItems.map(item => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="md:col-span-9">
                                <label className="font-semibold text-base block mb-1" style={{ color: 'var(--text-primary)' }}>{item.label}</label>
                                {item.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>}
                            </div>
                            <div className="md:col-span-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    placeholder="0-10"
                                    className="w-full p-3 text-center border-2 rounded-lg font-bold text-lg transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                    style={{ borderColor: '#E5E7EB' }}
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

            <div className="card mb-32" style={{ padding: '32px' }}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Poppins' }}>B. Formato (Máx 1 Punto)</h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Verifique el cumplimiento de normas de estilo.</p>
                </div>

                <div className="space-y-3">
                    {rubric.formatItems.map(item => (
                        <label key={item.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                            <span className="font-semibold text-base group-hover:text-purple-600 transition-colors">
                                {item.label}
                            </span>
                            <input
                                type="checkbox"
                                className="h-6 w-6 rounded border-2 text-purple-600 focus:ring-purple-500 transition-all"
                                checked={formatScores[item.id] || false}
                                onChange={(e) => {
                                    setFormatScores(prev => ({ ...prev, [item.id]: e.target.checked }));
                                }}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Floating Action Bar - Sin gris */}
            <div className="fixed bottom-0 left-280 right-0 bg-white border-t-2 p-6 z-40" style={{ borderColor: '#E5E7EB', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }} className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>Nota Provisional</span>
                        <div className="text-5xl font-black" style={{ fontFamily: 'Poppins', background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {calculateTotal()}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-8 py-4 text-base rounded-xl font-bold transition-all"
                            style={{
                                background: 'white',
                                border: '2px solid #6366F1',
                                color: '#6366F1'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F3F4F6';
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
                                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
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
