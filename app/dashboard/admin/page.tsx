'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project, User } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [tutorId, setTutorId] = useState('');
    const [studentNames, setStudentNames] = useState(['', '', '']); // Uppgraded to 3
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pData, uData] = await Promise.all([
                api.projects.getAll(),
                api.auth.getAllUsers()
            ]);
            setProjects(pData);
            setUsers(uData.filter(u => u.role === 'tutor'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !tutorId) return;

        setIsSaving(true);
        try {
            await api.projects.create({
                title,
                tutorId,
                studentNames: studentNames.filter(name => name.trim() !== '')
            });
            setShowModal(false);
            setTitle('');
            setTutorId('');
            setStudentNames(['', '', '']);
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold animate-pulse">Cargando gestión de proyectos...</p>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '60px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section - Estilo Premium Centrado */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-gray-100 pb-12">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                        </span>
                        Panel de Administración
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
                        Gestión de <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Proyectos</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl">
                        Control centralizado de investigaciones, asignación de tutores y seguimiento de alumnos.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-white transition-all overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}></div>
                    <span className="relative text-2xl">+</span>
                    <span className="relative">Nuevo Proyecto</span>
                </button>
            </div>

            {/* Modal de Nuevo Proyecto - Estilo LoginForm */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in overflow-hidden border border-white/20">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Poppins' }}>Crear Proyecto</h2>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Introduzca los datos básicos</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all text-3xl font-light shadow-sm"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddProject} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Título de la investigación
                                </label>
                                <input
                                    required
                                    className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-lg bg-slate-50/50"
                                    placeholder="Ej: Análisis de Riesgos en Ciberseguridad"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                    Tutor del proyecto
                                </label>
                                <select
                                    required
                                    className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 appearance-none outline-none transition-all font-bold text-lg bg-slate-50/50"
                                    value={tutorId}
                                    onChange={(e) => setTutorId(e.target.value)}
                                >
                                    <option value="">Selecciona un tutor docente...</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Alumnos participantes
                                    <span className="text-[10px] ml-auto bg-slate-100 px-2 py-1 rounded-md text-slate-500">Mínimo 1 / Máximo 3</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {studentNames.map((name, i) => (
                                        <div key={i} className="relative flex items-center">
                                            <span className="absolute left-5 font-black text-slate-300 text-sm">#{i + 1}</span>
                                            <input
                                                required={i === 0}
                                                className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-slate-50 focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30"
                                                placeholder={`Nombre completo del alumno...`}
                                                value={name}
                                                onChange={(e) => {
                                                    const newNames = [...studentNames];
                                                    newNames[i] = e.target.value;
                                                    setStudentNames(newNames);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 p-5 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="flex-3 p-5 rounded-2xl font-black text-white transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', flex: 2, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}
                                >
                                    {isSaving ? 'Guardando en la base de datos...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Cards - Estilo Nuevo */}
            <div className="space-y-6">
                {projects.map((project) => (
                    <div key={project.id} className="card group p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/10"
                        style={{ background: 'white', borderRadius: '32px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div className="flex flex-col lg:flex-row items-stretch">
                            {/* Color Bar lateral */}
                            <div className="w-2 lg:w-3" style={{ background: 'linear-gradient(to bottom, #6366F1, #EC4899)' }}></div>

                            {/* Proyect Info */}
                            <div className="flex-1 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                            Activo
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                                            Ref: {project.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 line-clamp-2" style={{ fontFamily: 'Poppins', lineHeight: 1.2 }}>
                                        {project.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-500">
                                                Tutor ID: <span className="text-slate-900">{project.tutorId.slice(0, 8)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Alumnos List */}
                                <div className="flex-none min-w-[280px]">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center md:text-left">Alumnos Evaluados</h4>
                                    <div className="flex flex-col gap-3">
                                        {project.students?.map((s, idx) => (
                                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-sm">
                                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                                                    0{idx + 1}
                                                </div>
                                                <span className="text-sm font-black text-slate-700">{s.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex-none flex items-center justify-center px-4">
                                    <Link
                                        href={`/dashboard/admin/reports/${project.id}`}
                                        className="group relative flex items-center justify-center w-20 h-20 rounded-[28px] bg-slate-50 text-slate-400 hover:text-white transition-all overflow-hidden border-2 border-slate-100 hover:border-indigo-500"
                                    >
                                        <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}></div>
                                        <svg className="relative z-10" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                        <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center text-6xl mb-8 shadow-inner">📁</div>
                        <h3 className="text-3xl font-black text-slate-400 mb-2" style={{ fontFamily: 'Poppins' }}>Base de datos vacía</h3>
                        <p className="text-slate-300 font-bold mb-8">Comienza creando tu primer proyecto de investigación</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
                        >
                            Crear proyecto ahora
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-in {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
