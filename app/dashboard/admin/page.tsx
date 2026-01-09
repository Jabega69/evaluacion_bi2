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
        <div className="animate-in" style={{ padding: '60px 80px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            {/* Action Bar - Muy visible y centrada */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 bg-white p-10 rounded-[40px] shadow-2xl border-4 border-white">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl font-black text-slate-900 mb-3" style={{ fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
                        Mis <span className="text-indigo-600">Investigaciones</span>
                    </h1>
                    <p className="text-slate-400 font-black text-sm uppercase tracking-[0.3em]">Gestión Central de Evaluaciones</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-4 px-12 py-6 rounded-3xl font-black text-white transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 z-10"
                    style={{
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        fontSize: '18px'
                    }}
                >
                    <span className="text-3xl">+</span>
                    <span>CREAR PROYECTO</span>
                </button>
            </div>

            {/* Modal de Nuevo Proyecto - Estilo Classroom / Inputs Grandes */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6 overflow-y-auto">
                    <div className="bg-[#f1f5f9] rounded-[60px] w-full max-w-6xl shadow-2xl animate-in my-10 overflow-hidden border-[12px] border-white">
                        <div className="p-12 border-b border-white/50 flex justify-between items-center bg-white/30">
                            <div>
                                <h2 className="text-5xl font-black text-slate-900" style={{ fontFamily: 'Poppins' }}>Nuevo Proyecto</h2>
                                <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.4em] mt-3">Panel de configuración académica</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-16 h-16 rounded-3xl flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 hover:scale-110 transition-all text-5xl font-light shadow-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddProject} className="p-12 space-y-16">
                            {/* Titulo - Input Gigante */}
                            <div className="space-y-6 text-center max-w-4xl mx-auto">
                                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block">Título de la Investigación</label>
                                <input
                                    required
                                    className="w-full px-10 py-8 h-24 rounded-[32px] border-8 border-white focus:border-indigo-500 outline-none transition-all font-black text-3xl text-center shadow-2xl bg-white text-slate-800"
                                    placeholder="ESCRIBE EL TÍTULO AQUÍ..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Alumnos - Cajas Blancas Grandes */}
                                <div className="space-y-8">
                                    <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block px-4">Alumnos Participantes</label>
                                    <div className="space-y-4">
                                        {studentNames.map((name, i) => (
                                            <div key={i} className="group">
                                                <input
                                                    required={i === 0}
                                                    className="w-full px-8 py-6 rounded-[28px] border-4 border-white focus:border-indigo-400 outline-none transition-all font-bold text-xl shadow-xl bg-white text-slate-700"
                                                    placeholder={`Nombre del Alumno ${i + 1}...`}
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

                                {/* Tutor - Caja Blanca Grande */}
                                <div className="space-y-8">
                                    <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block px-4">Tutor Académico</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            className="w-full px-8 py-6 h-[76px] rounded-[28px] border-4 border-white focus:border-indigo-400 outline-none transition-all font-bold text-xl shadow-xl bg-white text-slate-700 appearance-none cursor-pointer"
                                            value={tutorId}
                                            onChange={(e) => setTutorId(e.target.value)}
                                        >
                                            <option value="">Selecciona tutor encargado...</option>
                                            {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold bg-white/50 p-4 rounded-2xl border-2 border-white text-center italic">
                                        El tutor asignado será el responsable de calificar la actitud y el seguimiento semanal.
                                    </p>
                                </div>
                            </div>

                            {/* Tribunal - Estilo Imagen Classroom */}
                            <div className="space-y-10">
                                <div className="text-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Seleccionar Tribunal (Evaluadores)</label>
                                    <div className="h-2 w-24 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {tribunals.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => toggleTribunal(t.id)}
                                            className={`relative h-60 rounded-[40px] border-[6px] cursor-pointer transition-all flex flex-col p-8 bg-white shadow-xl hover:-translate-y-2 ${selectedTribunals.includes(t.id)
                                                    ? 'border-indigo-500 ring-12 ring-indigo-50/50'
                                                    : 'border-white hover:border-slate-100'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-auto">
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-800 leading-tight mb-2">{t.name}</h4>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Docente / Evaluador</span>
                                                </div>
                                                <div className="text-slate-100">
                                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${selectedTribunals.includes(t.id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'
                                                    }`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${selectedTribunals.includes(t.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-50 text-slate-100'
                                                    }`}>
                                                    {selectedTribunals.includes(t.id) ? '✓' : '...'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-8 pt-12 border-t-4 border-white">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-8 rounded-[32px] font-black text-slate-400 hover:text-slate-600 hover:bg-white transition-all text-2xl">Cancelar</button>
                                <button
                                    disabled={isSaving || selectedTribunals.length === 0}
                                    type="submit"
                                    className="flex-[2] p-8 rounded-[32px] font-black text-white transition-all disabled:opacity-50 text-2xl shadow-2xl"
                                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                                >
                                    {isSaving ? 'GUARDANDO...' : '¡LISTO, CREAR PROYECTO!'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project List - Estilo Classroom Mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((p) => (
                    <div key={p.id} className="group relative bg-white rounded-[48px] border-[6px] border-white shadow-xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-3 flex flex-col min-h-[440px]">
                        {/* Cabecera Estilo Classroom */}
                        <div className="p-10 border-b-2 border-slate-50 relative overflow-hidden flex-1">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-[1.1] mb-2 line-clamp-2" style={{ fontFamily: 'Poppins' }}>{p.title}</h3>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.students?.length} Estudiantes asignados</span>
                                </div>
                                <div className="text-slate-100 group-hover:text-indigo-100 transition-colors">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-500 mt-4 italic leading-relaxed">
                                Las evaluaciones escritas, orales y el seguimiento del tutor de este proyecto se consolidarán en el informe final.
                            </p>
                        </div>

                        {/* Pie con botón de Informe */}
                        <div className="p-10 bg-slate-50/50 rounded-b-[42px] border-t-2 border-white">
                            <Link
                                href={`/dashboard/admin/reports/${p.id}`}
                                className="w-full py-6 rounded-3xl bg-white border-4 border-white text-slate-900 font-black flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-lg text-lg group/btn"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/btn:scale-110 transition-transform"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                GENERAR INFORME
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center p-40 bg-white rounded-[80px] border-[10px] border-dashed border-slate-50 text-center">
                    <div className="text-[160px] mb-12 opacity-5 grayscale">🎓</div>
                    <h3 className="text-5xl font-black text-slate-300 mb-6" style={{ fontFamily: 'Poppins' }}>VACÍO</h3>
                    <p className="text-slate-200 text-2xl font-bold max-w-lg mb-12">No hay investigaciones registradas. Comienza creando una ahora mismo.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-16 py-8 rounded-3xl bg-indigo-600 text-white font-black text-xl shadow-2xl shadow-indigo-200 hover:scale-110 transition-all"
                    >
                        + CREAR PROYECTO
                    </button>
                </div>
            )}
        </div>
    );
}
