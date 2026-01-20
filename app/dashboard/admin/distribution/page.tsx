'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import GooglePicker from '@/components/GooglePicker';
import { useAuth } from '@/lib/auth-context';
import { useSearchParams } from 'next/navigation';

export default function DistributionPage() {
    const { user: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});
    const [selectedFile, setSelectedFile] = useState<{ id: string, name: string } | null>(null);
    const [confirmingProject, setConfirmingProject] = useState<Project | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [targetProjectId, setTargetProjectId] = useState<string | null>(null);

    useEffect(() => {
        const googleStatus = searchParams.get('google');
        if (googleStatus === 'success') {
            alert('✅ Cuenta vinculada correctamente con Google Drive.');
        } else if (googleStatus === 'error') {
            alert('❌ Error al vincular con Google Drive.');
        }

        loadProjects();
        if (!document.getElementById('google-gsi-client')) {
            const script = document.createElement('script');
            script.id = 'google-gsi-client';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.body.appendChild(script);
        }
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando Distribución...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="flex flex-col items-center text-center gap-8 bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mt-48" />

                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider mx-auto">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                            Admin Console
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                            Centro de <span className="text-blue-600">Distribución</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Gestiona el envío automático de reportes finales a los tribunales asignados.
                        </p>
                    </div>

                    {!currentUser ? (
                        <div className="flex items-center gap-4 px-10 py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-black animate-pulse cursor-not-allowed">
                            <span className="text-2xl">⏳</span>
                            VERIFICANDO SESIÓN...
                        </div>
                    ) : (
                        <a
                            href={`/api/auth/google/login?userId=${currentUser.id}`}
                            className="relative z-10 group flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black transition-all hover:bg-black hover:scale-[1.05] active:scale-95 shadow-2xl shadow-slate-200 whitespace-nowrap text-sm tracking-widest"
                        >
                            <span className="text-2xl group-hover:rotate-12 transition-transform">🔑</span>
                            VINCULAR GOOGLE DRIVE
                        </a>
                    )}
                </header>

                {/* Projects Grid/List */}
                <div className="grid grid-cols-1 gap-6">
                    {projects.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-32 text-center border-4 border-dashed border-slate-100">
                            <span className="text-6xl block mb-4">empty</span>
                            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">No hay proyectos activos</h3>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            📄
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                {project.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.students.map(s => (
                                                    <span key={s.id} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 items-center pt-2">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                            <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">Tribunales:</span>
                                            <div className="flex gap-2">
                                                {project.tribunalEmails?.map((email, i) => (
                                                    <div key={i} className="group/email relative">
                                                        <div className="w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 cursor-help">
                                                            {email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/email:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                                            {email}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase italic">
                                            {project.tribunalEmails?.length || 0} destinatarios configurados
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-auto shrink-0">
                                    {status[project.id] === 'success' ? (
                                        <div className="flex items-center justify-center gap-3 px-10 py-5 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-100 animate-in zoom-in">
                                            <span>✅</span> ENTREGADO
                                        </div>
                                    ) : status[project.id] === 'error' ? (
                                        <div className="space-y-2">
                                            <div className="px-10 py-5 bg-red-500 text-white font-black rounded-2xl text-center shadow-lg shadow-red-100">
                                                ❌ FALLÓ
                                            </div>
                                            <button
                                                onClick={() => setStatus(prev => ({ ...prev, [project.id]: 'idle' }))}
                                                className="w-full text-[10px] font-black underline uppercase text-slate-400 hover:text-slate-900 transition-colors text-center"
                                            >
                                                Reintentar envío
                                            </button>
                                        </div>
                                    ) : status[project.id] === 'sending' ? (
                                        <div className="flex items-center justify-center gap-4 px-10 py-5 bg-slate-900 text-white font-black rounded-2xl animate-pulse">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ENVIANDO...
                                        </div>
                                    ) : (
                                        <div className="w-full lg:w-auto flex justify-center">
                                            <button
                                                onClick={() => {
                                                    setTargetProjectId(project.id);
                                                    setIsPickerOpen(true);
                                                }}
                                                className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
                                            >
                                                <div className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
                                                </div>
                                                SELECCIONAR MEMORIA
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <GooglePicker
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
                developerKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onFileSelected={(file) => {
                    const project = projects.find(p => p.id === targetProjectId);
                    if (project) {
                        setSelectedFile(file);
                        setConfirmingProject(project);
                    }
                }}
            />

            {/* Premium Confirmation Modal */}
            {confirmingProject && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in slide-in-from-bottom-4 duration-400">

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-4 text-blue-600 rotate-3">
                                📧
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Confirmar Distribución</h2>
                            <p className="text-slate-500 text-sm font-medium">Vas a enviar el reporte oficial a los tribunales.</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block ml-1">Archivo seleccionado</label>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <span className="text-2xl">📄</span>
                                    <span className="font-bold text-slate-700 text-sm truncate">{selectedFile.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block ml-1">Tribunal de evaluación</label>
                                <div className="space-y-1.5">
                                    {confirmingProject.tribunalEmails?.map((email, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200">
                                            <span className="text-blue-500 shrink-0">@</span>
                                            <span className="truncate">{email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => { setConfirmingProject(null); setSelectedFile(null); }}
                                className="flex-1 order-2 sm:order-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black transition-all hover:bg-slate-200 hover:text-slate-700 text-xs"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleDistribute}
                                className="flex-1 order-1 sm:order-2 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200 text-xs"
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
