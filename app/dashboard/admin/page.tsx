'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project, User } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [tutorId, setTutorId] = useState('');
    const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
    const [studentNames, setStudentNames] = useState(['', '', '']);
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
            setAllUsers(uData);
        } finally {
            setLoading(false);
        }
    };

    const tutors = allUsers.filter(u => u.role === 'tutor');
    const tribunals = allUsers.filter(u => u.role === 'tribunal');

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !tutorId || selectedTribunals.length === 0) return;

        setIsSaving(true);
        try {
            await api.projects.create({
                title,
                tutorId,
                studentNames: studentNames.filter(name => name.trim() !== ''),
                tribunalIds: selectedTribunals
            });
            setShowModal(false);
            resetForm();
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setTutorId('');
        setSelectedTribunals([]);
        setStudentNames(['', '', '']);
    };

    const toggleTribunal = (id: string) => {
        setSelectedTribunals(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold animate-pulse">Cargando gestión de proyectos...</p>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '60px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-gray-100 pb-12">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
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

            {/* Modal de Nuevo Proyecto */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
                    <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl animate-in my-8 overflow-hidden border border-white/20">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Poppins' }}>Crear Proyecto</h2>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Configuración del proyecto y tribunal</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all text-3xl font-light shadow-sm"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddProject} className="p-10 space-y-10">
                            {/* Titulo y Tutor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                        Título
                                    </label>
                                    <input
                                        required
                                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30"
                                        placeholder="Título del proyecto..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                        Tutor docente
                                    </label>
                                    <select
                                        required
                                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30"
                                        value={tutorId}
                                        onChange={(e) => setTutorId(e.target.value)}
                                    >
                                        <option value="">Seleccionar tutor...</option>
                                        {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Alumnos */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                    Alumnos participantes
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {studentNames.map((name, i) => (
                                        <input
                                            key={i}
                                            required={i === 0}
                                            className="w-full p-4 rounded-xl border-2 border-slate-50 focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30 text-sm"
                                            placeholder={`Alumno ${i + 1}`}
                                            value={name}
                                            onChange={(e) => {
                                                const newNames = [...studentNames];
                                                newNames[i] = e.target.value;
                                                setStudentNames(newNames);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tribunal Assignment */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                    Asignar Tribunal (Mín. 1)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {tribunals.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => toggleTribunal(t.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedTribunals.includes(t.id)
                                                    ? 'border-indigo-500 bg-indigo-50/50'
                                                    : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="font-bold text-slate-700">{t.name}</span>
                                            {selectedTribunals.includes(t.id) && (
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-5 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">Descartar</button>
                                <button
                                    disabled={isSaving || selectedTribunals.length === 0}
                                    type="submit"
                                    className="flex-3 p-5 rounded-2xl font-black text-white transition-all disabled:opacity-50 hover:scale-[1.01]"
                                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', flex: 2, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}
                                >
                                    {isSaving ? 'Creando...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Cards List */}
            <div className="space-y-6">
                {projects.map((project) => (
                    <div key={project.id} className="card group p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50"
                        style={{ background: 'white', borderRadius: '32px' }}>
                        <div className="flex flex-col lg:flex-row items-stretch">
                            <div className="w-2 lg:w-3" style={{ background: 'linear-gradient(to bottom, #6366F1, #EC4899)' }}></div>
                            <div className="flex-1 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Activo</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {project.id.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4" style={{ fontFamily: 'Poppins' }}>{project.title}</h3>
                                    <div className="text-sm font-bold text-slate-500">Tutor: <span className="text-slate-900">{allUsers.find(u => u.id === project.tutorId)?.name || 'Desconocido'}</span></div>
                                </div>

                                <div className="flex-none min-w-[250px]">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Alumnos</h4>
                                    <div className="flex flex-col gap-2">
                                        {project.students?.map((s) => (
                                            <div key={s.id} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-700">{s.name}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-none flex items-center justify-center px-4">
                                    <Link href={`/dashboard/admin/reports/${project.id}`} className="group relative flex items-center justify-center w-20 h-20 rounded-[28px] bg-slate-50 text-slate-400 hover:text-white transition-all overflow-hidden border-2 border-slate-100 hover:border-indigo-500">
                                        <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}></div>
                                        <svg className="relative z-10" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
