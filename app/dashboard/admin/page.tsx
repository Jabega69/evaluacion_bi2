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
            <p className="text-2xl font-black text-indigo-600 animate-pulse" style={{ fontFamily: 'Poppins' }}>CARGANDO...</p>
        </div>
    );

    return (
        <div className="animate-in w-full min-h-screen flex flex-col items-center p-10">

            {/* Header Section - CENTRADO TOTAL */}
            <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center mb-16 space-y-8">
                <div>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: 'Poppins' }}>
                        MIS <span className="text-indigo-600">INVESTIGACIONES</span>
                    </h1>
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-[0.3em]">PANEL DE GESTIÓN ACADÉMICA</p>
                </div>

                {/* BOTÓN BLANCO ÚNICO */}
                <button
                    onClick={() => setShowModal(true)}
                    className="group px-12 py-6 rounded-[30px] bg-white border-2 border-indigo-50 text-indigo-900 font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.2)] hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] flex items-center gap-4"
                >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 text-2xl">+</span>
                    <span>CREAR NUEVO PROYECTO</span>
                </button>
            </div>

            {/* Project List - Grid Centrada y Limpia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
                {projects.map((p) => (
                    <div key={p.id} className="group flex flex-col items-center bg-white rounded-[40px] p-8 text-center border-4 border-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-3xl mb-6 text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                            🎓
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight w-full" style={{ fontFamily: 'Poppins' }}>{p.title}</h3>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {p.students?.map((s) => (
                                <span key={s.id} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                    {s.name}
                                </span>
                            ))}
                        </div>

                        <Link
                            href={`/dashboard/admin/reports/${p.id}`}
                            className="mt-auto px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-wide hover:bg-indigo-600 transition-colors w-full"
                        >
                            VER INFORME
                        </Link>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center p-20 opacity-50">
                    <p className="text-2xl font-black text-slate-300 font-poppins">NO HAY PROYECTOS ACTIVOS</p>
                </div>
            )}


            {/* MODAL DE NUEVO PROYECTO - CENTRADO Y VISTOSO */}
            {showModal && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center p-4 overflow-y-auto">

                    {/* Botón de Cerrar Flotante */}
                    <button
                        onClick={() => setShowModal(false)}
                        className="fixed top-8 right-8 w-16 h-16 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 font-light text-4xl transition-all z-50 flex items-center justify-center shadow-lg"
                    >
                        &times;
                    </button>

                    <div className="w-full max-w-4xl animate-in space-y-12 py-12">

                        <div className="text-center space-y-4">
                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: 'Poppins' }}>NUEVO PROYECTO</h2>
                            <div className="h-2 w-32 bg-indigo-500 mx-auto rounded-full"></div>
                        </div>

                        <form onSubmit={handleAddProject} className="space-y-16 w-full flex flex-col items-center">

                            {/* 1. TÍTULO - EXTRAMADAMENTE GRANDE */}
                            <div className="w-full space-y-4 text-center">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">TÍTULO DEL PROYECTO</label>
                                <input
                                    required
                                    className="w-full h-32 text-center text-4xl md:text-5xl font-black text-slate-800 bg-transparent border-b-8 border-slate-200 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-200"
                                    style={{ fontFamily: 'Poppins' }}
                                    placeholder="ESCRIBE AQUÍ..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* 2. ALUMNOS - TARJETAS FLOTANTES GRANDES */}
                            <div className="w-full space-y-8 text-center">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">ALUMNOS PARTICIPANTES</label>
                                <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                                    {studentNames.map((name, i) => (
                                        <div key={i} className="relative transition-transform hover:scale-105">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-200">0{i + 1}</span>
                                            <input
                                                required={i === 0}
                                                className="w-full h-24 pl-20 pr-8 rounded-[30px] bg-white shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] border-4 border-transparent focus:border-indigo-500 outline-none text-2xl font-black text-slate-800 placeholder:text-slate-300 text-left"
                                                style={{ fontFamily: 'Poppins' }}
                                                placeholder="NOMBRE DEL ALUMNO"
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

                            {/* 3. SELECCIÓN DE PROFESORES - CARDS CENTRALES */}
                            <div className="w-full space-y-8 text-center pt-8">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">TUTOR & TRIBUNAL</label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                                    {/* Select Tutor */}
                                    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mb-4">👨‍🏫</div>
                                        <h3 className="text-xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins' }}>TUTOR</h3>
                                        <select
                                            required
                                            className="w-full p-4 rounded-xl bg-slate-50 font-bold text-lg text-center outline-none border-2 border-transparent focus:border-teal-400 appearance-none leading-tight"
                                            value={tutorId}
                                            onChange={(e) => setTutorId(e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Select Tribunal */}
                                    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mb-4">⚖️</div>
                                        <h3 className="text-xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins' }}>TRIBUNAL</h3>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {tribunals.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => toggleTribunal(t.id)}
                                                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${selectedTribunals.includes(t.id)
                                                            ? 'bg-purple-600 text-white shadow-lg scale-105'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedTribunals.length === 0 && <span className="text-xs text-rose-500 font-bold mt-2">Selecciona al menos uno</span>}
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON - BLANCO Y GIGANTE */}
                            <button
                                disabled={isSaving || selectedTribunals.length === 0}
                                type="submit"
                                className="w-full md:w-auto px-20 py-8 rounded-[40px] bg-indigo-600 text-white font-black text-3xl tracking-wide shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all text-center"
                                style={{ fontFamily: 'Poppins' }}
                            >
                                {isSaving ? 'GUARDANDO...' : 'CREAR AHORA'}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
