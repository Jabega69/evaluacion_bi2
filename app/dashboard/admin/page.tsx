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
        <div className="animate-in w-full min-h-screen p-8 md:p-12 lg:p-16 max-w-[1700px] mx-auto flex flex-col items-center">

            {/* Header Simple y Funcional - CENTRADO */}
            <div className="text-center mb-16 w-full flex flex-col items-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-800 mb-4" style={{ fontFamily: 'Poppins' }}>
                    Panel de Investigaciones
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-base md:text-lg mb-16">
                    Gestión Académica
                </p>

                <button
                    onClick={() => setShowModal(true)}
                    className="group relative inline-flex items-center gap-4 px-16 py-7 rounded-full font-black text-2xl transition-all hover:-translate-y-1 active:translate-y-0 text-white"
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.2)',
                        borderBottom: '6px solid #1D4ED8'
                    }}
                >
                    <span className="bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-inner">
                        +
                    </span>
                    <span>Nueva Investigación</span>
                </button>
            </div>

            {/* Grid de Tarjetas Estilo Ucademy (Pastel + Bold Button) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 w-full">
                {projects.map((p, idx) => {
                    const variant = CARD_VARIANTS[idx % CARD_VARIANTS.length];
                    return (
                        <div key={p.id} className="group relative rounded-[32px] overflow-hidden transition-all hover:-translate-y-2 flex flex-col h-[400px] shadow-sm hover:shadow-xl"
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
                    <div className="col-span-full text-center py-20 bg-white/50 rounded-[40px] border-4 border-dashed border-slate-200">
                        <div className="text-8xl mb-6 grayscale opacity-20">📂</div>
                        <h3 className="text-3xl font-black text-slate-300" style={{ fontFamily: 'Poppins' }}>No hay proyectos activos</h3>
                        <p className="text-slate-400 font-bold mt-2">¡Comienza creando el primero!</p>
                    </div>
                )}
            </div>

            {/* Modal Rediseñado TOTALMENTE - CENTRADO Y 3 COLUMNAS */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-[1400px] bg-white rounded-[60px] shadow-2xl overflow-hidden animate-in border-[12px] border-white relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-8 right-8 w-16 h-16 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-4xl font-light z-50 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95"
                        >
                            &times;
                        </button>

                        <div className="p-16 text-center bg-slate-50/50 border-b border-slate-100">
                            <h2 className="text-6xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
                                Lanzar Proyecto <span className="text-indigo-600">Investigador</span> 🚀
                            </h2>
                            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
                                Define el futuro académico creando una nueva investigación y asignando los mejores recursos.
                            </p>
                        </div>

                        <form onSubmit={handleAddProject} className="p-16 space-y-20">
                            {/* Título - Full Width e Impactante */}
                            <div className="space-y-6 text-center max-w-5xl mx-auto">
                                <label className="block text-sm font-black uppercase tracking-[0.4em] text-slate-400">Título de la Obra</label>
                                <input
                                    required
                                    className="w-full p-8 rounded-[32px] bg-white border-4 border-slate-100 focus:border-indigo-500 outline-none transition-all text-4xl font-black text-center text-slate-800 placeholder:text-slate-200 shadow-xl"
                                    style={{ fontFamily: 'Poppins' }}
                                    placeholder="TÍTULO DE LA INVESTIGACIÓN..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Alumnos - 3 Columnas con Tarjetas de Filo Chulo */}
                            <div className="space-y-8">
                                <label className="block text-center text-sm font-black uppercase tracking-[0.4em] text-slate-400">Equipo de Estudiantes</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {studentNames.map((name, i) => (
                                        <div key={i} className="group relative rounded-[40px] p-2" style={{
                                            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                                            padding: '4px' // El "filo chulo"
                                        }}>
                                            <div className="bg-white rounded-[36px] p-8 h-full flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-500 flex items-center justify-center font-black text-xl mb-6 shadow-inner">
                                                    0{i + 1}
                                                </div>
                                                <input
                                                    required={i === 0}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all font-black text-center text-xl placeholder:text-slate-300"
                                                    placeholder="NOMBRE COMPLETO"
                                                    value={name}
                                                    onChange={(e) => {
                                                        const newNames = [...studentNames];
                                                        newNames[i] = e.target.value;
                                                        setStudentNames(newNames);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tutor y Tribunal - 3 Columnas Horizontal */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                                {/* Tutor - Columna Izquierda */}
                                <div className="lg:col-span-1 space-y-6">
                                    <label className="block text-center text-sm font-black uppercase tracking-[0.4em] text-slate-400">Profesor Tutor</label>
                                    <div className="bg-white rounded-[40px] p-8 border-4 border-slate-50 shadow-xl h-full flex flex-col justify-center">
                                        <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center text-4xl mb-6 mx-auto shadow-inner">👨‍🏫</div>
                                        <select
                                            required
                                            className="w-full p-6 h-20 rounded-[24px] bg-slate-50 border-2 border-transparent focus:border-orange-400 outline-none transition-all font-black text-center text-lg appearance-none cursor-pointer"
                                            value={tutorId}
                                            onChange={(e) => setTutorId(e.target.value)}
                                        >
                                            <option value="">Elegir Tutor...</option>
                                            {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Tribunal - 3 Columnas (Total 4 col grid) */}
                                <div className="lg:col-span-3 space-y-6">
                                    <label className="block text-center text-sm font-black uppercase tracking-[0.4em] text-slate-400">Tribunal Evaluador</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {tribunals.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => toggleTribunal(t.id)}
                                                className={`relative rounded-[40px] p-8 cursor-pointer transition-all hover:-translate-y-2 flex flex-col items-center text-center min-h-[200px] justify-center group ${selectedTribunals.includes(t.id)
                                                        ? 'bg-[#1E293B] text-white shadow-2xl scale-105'
                                                        : 'bg-white border-4 border-slate-50 text-slate-700 hover:border-indigo-100 hover:shadow-xl'
                                                    }`}
                                            >
                                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black mb-4 transition-all ${selectedTribunals.includes(t.id) ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-indigo-500 group-hover:bg-indigo-50'
                                                    }`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <h3 className="text-xl font-black mb-1" style={{ fontFamily: 'Poppins' }}>{t.name}</h3>
                                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedTribunals.includes(t.id) ? 'text-indigo-400' : 'text-slate-400'
                                                    }`}>
                                                    Miembro Principal
                                                </p>
                                                {selectedTribunals.includes(t.id) && (
                                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black animate-in zoom-in">
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
