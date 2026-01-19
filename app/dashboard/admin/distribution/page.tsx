'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import GooglePicker from '@/components/GooglePicker';

export default function DistributionPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});

    useEffect(() => {
        loadProjects();
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    async function loadProjects() {
        const data = await api.projects.getAll();
        setProjects(data);
        setLoading(false);
    }

    const handleDistribute = async (projectId: string, file: { id: string, name: string }) => {
        setStatus(prev => ({ ...prev, [projectId]: 'sending' }));
        try {
            const response = await fetch('/api/admin/distribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    fileId: file.id,
                    fileName: file.name
                })
            });

            if (!response.ok) throw new Error('Error al enviar');

            setStatus(prev => ({ ...prev, [projectId]: 'success' }));
            setTimeout(() => {
                setStatus(prev => ({ ...prev, [projectId]: 'idle' }));
            }, 3000);
        } catch (error) {
            console.error(error);
            setStatus(prev => ({ ...prev, [projectId]: 'error' }));
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando proyectos...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Distribución de Proyectos</h1>
                    <p className="text-slate-500">Envía la documentación a los tribunales vía Email</p>
                </div>
                <a
                    href="/api/auth/google/login"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                    🔑 Vincular Google
                </a>
            </div>

            <div className="space-y-4">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center transition-all hover:shadow-md">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{project.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                <span>👥 {project.students.map(s => s.name).join(', ')}</span>
                                <span>👨‍🏫 Tribunal: {project.tribunalNames?.length || 0} miembros</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {status[project.id] === 'success' ? (
                                <span className="text-green-600 font-bold flex items-center gap-1 animate-in slide-in-from-right">
                                    ✅ Enviado con éxito
                                </span>
                            ) : status[project.id] === 'error' ? (
                                <span className="text-red-600 font-bold">❌ Error</span>
                            ) : status[project.id] === 'sending' ? (
                                <div className="flex items-center gap-2 text-slate-400 font-bold italic">
                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                    Enviando...
                                </div>
                            ) : (
                                <GooglePicker
                                    clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
                                    developerKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
                                    onFileSelected={(file) => handleDistribute(project.id, file)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
