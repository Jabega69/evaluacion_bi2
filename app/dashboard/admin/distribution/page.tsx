'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import GooglePicker from '@/components/GooglePicker';

export default function DistributionPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});
    const [selectedFile, setSelectedFile] = useState<{ id: string, name: string } | null>(null);
    const [confirmingProject, setConfirmingProject] = useState<Project | null>(null);

    useEffect(() => {
        loadProjects();
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

    const handleDistribute = async () => {
        if (!confirmingProject || !selectedFile) return;

        const projectId = confirmingProject.id;
        const file = selectedFile;

        setConfirmingProject(null);
        setSelectedFile(null);

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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al enviar');
            }

            setStatus(prev => ({ ...prev, [projectId]: 'success' }));
            setTimeout(() => {
                setStatus(prev => ({ ...prev, [projectId]: 'idle' }));
            }, 5000);
        } catch (error: any) {
            console.error(error);
            alert(`Error en el envío: ${error.message}`);
            setStatus(prev => ({ ...prev, [projectId]: 'error' }));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Cargando proyectos...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-12 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Centro de Distribución</h1>
                    <p className="text-slate-500 font-medium">Envía la documentación a los tribunales vinculando tu cuenta de Google.</p>
                </div>
                <a
                    href="/api/auth/google/login"
                    className="px-6 py-4 bg-blue-600 text-white rounded-xl text-lg font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                    🔑 Vincular Google
                </a>
            </div>

            <div className="space-y-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:border-blue-200">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-900 text-xl mb-3 truncate">{project.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">
                                    👥 {project.students.map(s => s.name).join(', ')}
                                </span>
                                <div className="flex flex-wrap gap-2 text-slate-500 bg-blue-50/50 px-3 py-1 rounded-lg">
                                    <span className="font-black text-blue-600 pr-2 border-r border-blue-100">📧 ENVÍO A:</span>
                                    {project.tribunalEmails?.length ? (
                                        project.tribunalEmails.map((email, i) => (
                                            <span key={i} className="font-bold">{email}{i < project.tribunalEmails!.length - 1 ? ',' : ''}</span>
                                        ))
                                    ) : (
                                        <span className="text-red-400">Sin emails configurados</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {status[project.id] === 'success' ? (
                                <span className="w-full md:w-auto text-center bg-green-500 text-white px-6 py-4 rounded-xl font-black text-sm">
                                    ✅ ENVIADO
                                </span>
                            ) : status[project.id] === 'error' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="bg-red-500 text-white px-6 py-4 rounded-xl font-black text-sm text-center">❌ FALLÓ</span>
                                    <button
                                        onClick={() => setStatus(prev => ({ ...prev, [project.id]: 'idle' }))}
                                        className="text-[10px] font-black underline uppercase text-slate-400"
                                    >Reintentar</button>
                                </div>
                            ) : status[project.id] === 'sending' ? (
                                <div className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 text-slate-400 rounded-xl font-black text-sm animate-pulse">
                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                    PROCESANDO...
                                </div>
                            ) : (
                                <div className="w-full md:w-auto">
                                    <GooglePicker
                                        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
                                        developerKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
                                        onFileSelected={(file) => {
                                            setSelectedFile(file);
                                            setConfirmingProject(project);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Confirmation Modal */}
            {confirmingProject && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in duration-200">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Confirmar Envío</h2>
                            <p className="text-slate-500 font-medium">Vas a enviar el reporte a los emails asignados.</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archivo:</p>
                                <p className="font-bold text-slate-700 truncate">{selectedFile.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destinatarios:</p>
                                <div className="flex flex-col gap-1">
                                    {confirmingProject.tribunalEmails?.map((email, i) => (
                                        <p key={i} className="font-bold text-blue-600 text-sm">{email}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setConfirmingProject(null); setSelectedFile(null); }}
                                className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-xl font-black hover:bg-slate-300 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleDistribute}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all font-sans"
                            >
                                SÍ, ENVIAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
