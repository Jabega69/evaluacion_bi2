'use client';

import { useState } from 'react';
import { TutorRubric, Project, Student } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
    rubric: TutorRubric;
    project: Project;
    student: Student;
    tutorId: string;
}

export default function TutorEvalForm({ rubric, project, student, tutorId }: Props) {
    const router = useRouter();
    const [scores, setScores] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);

    const calculateTotal = () => {
        // 5 items * 2 pts = 10 pts max
        return Object.values(scores).reduce((a, b) => a + b, 0);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await api.submissions.submitTutor({
            id: crypto.randomUUID(),
            projectId: project.id,
            tutorId: tutorId,
            scores, // We should also store which student is being evaluated, simplified here to project context
            submittedAt: new Date().toISOString()
        });
        router.push('/dashboard/tutor');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 border-b pb-2 dark:border-slate-600">Evaluación del Tutor (Máx 10 Puntos)</h3>
                <p className="text-sm text-slate-500 mb-6">Valore cada ítem de 0 a 2.</p>

                <div className="space-y-6">
                    {rubric.items.map(item => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-50 dark:border-slate-700 pb-4">
                            <div className="md:col-span-2">
                                <label className="font-medium text-slate-900 dark:text-slate-100">{item.label}</label>
                            </div>
                            <div>
                                <div className="flex gap-2">
                                    {[0, 1, 2].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setScores(prev => ({ ...prev, [item.id]: val }))}
                                            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${scores[item.id] === val
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t p-4 z-10 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-slate-500 uppercase">Nota Actual</span>
                        <div className="text-2xl font-bold text-indigo-600">{calculateTotal()} <span className="text-sm text-slate-400">/ 10</span></div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Enviando...' : 'Finalizar Tutoría'}
                    </button>
                </div>
            </div>
            <div className="h-24"></div>
        </div>
    );
}
