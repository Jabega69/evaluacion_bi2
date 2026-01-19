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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-20 h-20 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6 shadow-xl" />
            <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.3em]">Sincronizando...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-12 lg:p-20 font-['Inter',sans-serif]">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-50/50 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/5 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Centro de Distribución
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
                            Envíos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 underline decoration-blue-200 decoration-8 underline-offset-8">Inteligentes</span>
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                            Automatiza la entrega de documentación vinculando tu cuenta de Google Drive para bajar el archivo y Gmail para enviarlo.
                        </p>
                    </div>

                    <a
                        href="/api/auth/google/login"
                        className="group relative flex items-center gap-4 px-10 py-6 bg-slate-900 border-none text-white rounded-[2.5rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-200/50 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            <span className="text-3xl transition-transform group-hover:rotate-12 group-hover:scale-125">🔑</span>
                            VINCULAR GOOGLE
                        </span>
                    </a>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {projects.length === 0 ? (
                        <div className="col-span-full py-40 text-center bg-white/50 backdrop-blur-xl rounded-[4rem] border-4 border-dashed border-slate-100">
                            <span className="text-9xl mb-8 block opacity-10">📫</span>
                            <h3 className="text-3xl font-black text-slate-300 uppercase tracking-widest">Buzón Vacío</h3>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} className="group relative bg-white rounded-[3.5rem] border-2 border-slate-50 p-10 shadow-sm transition-all hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-4 hover:border-blue-100 flex flex-col justify-between overflow-hidden">
                                {/* Aesthetic detail */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/30 rounded-full blur-3xl group-hover:bg-blue-200/20 transition-colors" />

                                <div className="relative space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                            📄
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Ready to sync</div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                                            {project.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {project.students.map(s => (
                                                <span key={s.id} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-lg">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinatarios:</p>
                                        <div className="space-y-2">
                                            {project.tribunalEmails?.map((email, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-600">P{i + 1}</div>
                                                    <span className="text-[11px] font-bold text-slate-600 truncate">{email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 relative">
                                    {status[project.id] === 'success' ? (
                                        <div className="flex items-center justify-center gap-3 py-5 bg-green-500 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-green-100 animate-in zoom-in">
                                            ✅ ENVIADO CORRECTAMENTE
                                        </div>
                                    ) : status[project.id] === 'error' ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center gap-3 py-5 bg-red-500 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-red-100">
                                                ❌ HA FALLADO EL ENVÍO
                                            </div>
                                            <button
                                                onClick={() => setStatus(prev => ({ ...prev, [project.id]: 'idle' }))}
                                                className="w-full text-center text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                                            >
                                                Tocar para reintentar
                                            </button>
                                        </div>
                                    ) : status[project.id] === 'sending' ? (
                                        <div className="flex items-center justify-center gap-4 py-8 bg-slate-900 text-white rounded-[2rem] font-black text-sm">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            PROCESANDO...
                                        </div>
                                    ) : (
                                        <GooglePicker
                                            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
                                            developerKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
                                            onFileSelected={(file) => {
                                                setSelectedFile(file);
                                                setConfirmingProject(project);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmingProject && selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl space-y-10 animate-in slide-in-from-bottom-10">
                        <div className="space-y-4 text-center">
                            <span className="text-6xl">📨</span>
                            <h2 className="text-3xl font-black text-slate-900">Confirmar Envío</h2>
                            <p className="text-slate-500 font-medium">Vas a enviar la memoria a los miembros del tribunal.</p>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Archivo Seleccionado:</p>
                                <p className="text-lg font-black text-blue-600 truncate">📄 {selectedFile.name}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Destinatarios ({confirmingProject.tribunalEmails?.length}):</p>
                                <div className="space-y-2">
                                    {confirmingProject.tribunalEmails?.map((email, i) => (
                                        <p key={i} className="text-sm font-bold text-slate-700">{email}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setConfirmingProject(null); setSelectedFile(null); }}
                                className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black hover:bg-slate-200 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleDistribute}
                                className="flex-2 py-5 bg-blue-600 text-white rounded-3xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105"
                            >
                                SÍ, ENVIAR AHORA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
