'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project, User } from '@/types';
import Link from 'next/link';

// Ucademy-inspired palettes
const CARD_VARIANTS = [
    { bg: '#FFEDD5', btn: '#F97316', label: 'orange' }, // Calido
    { bg: '#DBEAFE', btn: '#3B82F6', label: 'blue' },   // Azul
    { bg: '#DCFCE7', btn: '#10B981', label: 'green' },  // Verde
    { bg: '#FEF9C3', btn: '#EAB308', label: 'yellow' }  // Amarillo
];

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
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-slate-400">Cargando...</p>
        </div>
    );

    return (
        <div className="animate-in w-full min-h-screen p-8 md:p-12 lg:p-16 max-w-[1800px] mx-auto">

            {/* Header Simple y Funcional */}
            <div className="text-center mb-16 w-full">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-800 mb-4" style={{ fontFamily: 'Poppins' }}>
                    Panel de Investigaciones
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-base md:text-lg mb-16">
                    Gestión Académica
                </p>

                <button
                    onClick={() => setShowModal(true)}
                    className="group relative inline-flex items-center gap-4 px-16 py-7 rounded-full font-black text-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.2)',
                        borderBottom: '6px solid #1D4ED8',
                        color: '#FFFFFF'
                    }}
                >
                    <span className="bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-inner" style={{ color: '#FFFFFF' }}>
                        +
                    </span>
                    <span style={{ color: '#FFFFFF' }}>Nueva Investigación</span>
                </button>
            </div>

            {/* Grid de Tarjetas Estilo Ucademy (Pastel + Bold Button) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
                {projects.map((p, idx) => {
                    const variant = CARD_VARIANTS[idx % CARD_VARIANTS.length];
                    return (
                        <div key={p.id} className="group relative rounded-[32px] overflow-hidden transition-all hover:-translate-y-2 flex flex-col h-[400px]"
                            style={{ background: variant.bg }}>

                            {/* Card Content */}
                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 mb-6 rounded-full bg-white/50 flex items-center justify-center text-5xl shadow-sm group-hover:scale-110 transition-transform">
                                    {idx % 2 === 0 ? '📝' : '🔬'}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2 line-clamp-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                                    {p.title}
                                </h3>
                                <p className="text-sm font-bold text-slate-500/80 uppercase tracking-wider">
                                    {p.students?.length} Alumnos
                                </p>

                                <div className="mt-6 flex -space-x-2 justify-center">
                                    {p.students?.slice(0, 3).map((s, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-transparent flex items-center justify-center text-[10px] font-bold shadow-sm" title={s.name}>
                                            {s.name.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Action Button */}
                            <Link
                                href={`/dashboard/admin/reports/${p.id}`}
                                className="w-full py-5 text-center text-white font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                style={{ background: variant.btn }}
                            >
                                Ver Informe ➜
                            </Link>
                        </div>
                    );
                })}

                {/* Empty State Card */}
                {projects.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="text-6xl mb-4 opacity-20">📂</div>
                        <h3 className="text-2xl font-bold text-slate-300">No hay proyectos activos</h3>
                    </div>
                )}
            </div>

            {/* Modal Rediseñado (Mantiene funcionalidad pero adapta estética) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4 overflow-y-auto">
                    <button
                        onClick={() => setShowModal(false)}
                        className="fixed top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white hover:text-rose-500 transition-all text-3xl font-light z-50 flex items-center justify-center backdrop-blur-md"
                    >
                        &times;
                    </button>

                    <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in">
                        <div className="p-12 text-center bg-slate-50 border-b border-slate-100">
                            <h2 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Poppins' }}>Lanzar Proyecto 🚀</h2>
                            <p className="text-slate-500 font-medium">Configura los detalles de la nueva investigación</p>
                        </div>

                        <form onSubmit={handleAddProject} className="p-10 md:p-14 space-y-12 max-w-6xl mx-auto">
                            <div className="space-y-4">
                                <label className="block text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">Título</label>
                                <input
                                    required
                                    className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white outline-none transition-all text-xl font-bold text-center text-slate-800 placeholder:text-slate-300"
                                    placeholder="Ej: Historia del Arte Moderno"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">Alumnos</label>
                                    <div className="space-y-3">
                                        {studentNames.map((name, i) => (
                                            <input
                                                key={i}
                                                required={i === 0}
                                                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-[#3B82F6] focus:bg-white outline-none transition-all font-semibold text-center"
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

                                <div className="space-y-4">
                                    <label className="block text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tutor</label>
                                    <select
                                        required
                                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-[#F97316] outline-none transition-all font-bold text-center appearance-none cursor-pointer"
                                        value={tutorId}
                                        onChange={(e) => setTutorId(e.target.value)}
                                    >
                                        <option value="">Selecciona Tutor...</option>
                                        {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Tribunal - Tarjetas Grandes Estilo Classroom */}
                                <div className="space-y-6">
                                    <label className="block text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tribunal Evaluador</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tribunals.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => toggleTribunal(t.id)}
                                                className={`relative rounded-[32px] p-6 cursor-pointer transition-all hover:-translate-y-1 flex flex-col items-center text-center min-h-[180px] justify-center ${selectedTribunals.includes(t.id)
                                                    ? 'bg-purple-600 text-white shadow-xl scale-105'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4 ${selectedTribunals.includes(t.id) ? 'bg-white/20 text-white' : 'bg-white text-purple-600'
                                                    }`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <h3 className="text-lg font-black mb-1">{t.name}</h3>
                                                <p className={`text-xs font-bold uppercase tracking-wider ${selectedTribunals.includes(t.id) ? 'text-white/70' : 'text-slate-400'
                                                    }`}>
                                                    Evaluador
                                                </p>
                                                {selectedTribunals.includes(t.id) && (
                                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-purple-600 flex items-center justify-center font-black">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedTribunals.length === 0 && (
                                        <p className="text-center text-sm text-rose-500 font-bold">Selecciona al menos un evaluador</p>
                                    )}
                                </div>
                            </div>

                            <button
                                disabled={isSaving || selectedTribunals.length === 0}
                                type="submit"
                                className="w-full py-6 rounded-2xl bg-[#10B981] text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-200"
                            >
                                {isSaving ? 'Guardando...' : 'Crear Proyecto Ahora'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
