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
        <div className="animate-in w-full min-h-screen p-8 md:p-12 lg:p-20 overflow-x-hidden">

            {/* Contenedor Centrado de la Página */}
            <div className="max-w-[1600px] mx-auto flex flex-col items-center w-full">

                {/* Header Simple y Funcional */}
                <div className="text-center mb-20 w-full flex flex-col items-center">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-800 mb-6" style={{ fontFamily: 'Poppins', letterSpacing: '-0.04em' }}>
                        Panel de Investigaciones
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-lg lg:text-xl mb-20">
                        Gestión Académica
                    </p>

                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative inline-flex items-center gap-6 px-20 py-8 rounded-[40px] font-black text-3xl transition-all hover:-translate-y-2 active:translate-y-0 text-white shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5)',
                            borderBottom: '8px solid #1D4ED8'
                        }}
                    >
                        <span className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                            +
                        </span>
                        <span>Nueva Investigación</span>
                    </button>
                </div>

                {/* Grid de Tarjetas de Proyectos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12 w-full mt-12">
                    {projects.map((p, idx) => {
                        const variant = CARD_VARIANTS[idx % CARD_VARIANTS.length];
                        return (
                            <div key={p.id} className="group relative rounded-[45px] overflow-hidden transition-all hover:-translate-y-3 flex flex-col h-[450px] shadow-xl hover:shadow-2xl"
                                style={{ background: variant.bg }}>

                                <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-32 h-32 mb-8 rounded-[40px] bg-white/60 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                                        {idx % 2 === 0 ? '📝' : '🔬'}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-3 line-clamp-2 leading-[1.1]" style={{ fontFamily: 'Poppins' }}>
                                        {p.title}
                                    </h3>
                                    <p className="text-base font-black text-slate-500/60 uppercase tracking-widest">
                                        {p.students?.length} Estudiantes
                                    </p>
                                </div>

                                <Link
                                    href={`/dashboard/admin/reports/${p.id}`}
                                    className="w-full py-7 text-center text-white font-black text-xl hover:brightness-110 transition-all flex items-center justify-center gap-3"
                                    style={{ background: variant.btn }}
                                >
                                    Ver Informe Completo ➜
                                </Link>
                            </div>
                        );
                    })}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-32 bg-slate-50 rounded-[60px] border-8 border-dashed border-slate-100">
                            <div className="text-9xl mb-8 grayscale opacity-10">📂</div>
                            <h3 className="text-4xl font-black text-slate-200" style={{ fontFamily: 'Poppins' }}>No hay proyectos activos</h3>
                            <p className="text-slate-300 font-bold mt-4 text-xl">¡Comienza pulsando el botón azul!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL GIGANTE Y CENTRADO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-[3000] flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-[1500px] bg-white rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 relative border-[16px] border-white">

                        {/* Botón de Cerrar */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-10 right-10 w-20 h-20 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-5xl font-light z-50 flex items-center justify-center shadow-xl hover:scale-110"
                        >
                            &times;
                        </button>

                        <div className="p-20 text-center bg-slate-50/80 border-b-4 border-slate-100">
                            <h2 className="text-7xl lg:text-8xl font-black text-slate-900 mb-6" style={{ fontFamily: 'Poppins', letterSpacing: '-0.04em' }}>
                                Lanzar <span className="text-blue-600">Investigación</span> 🚀
                            </h2>
                            <p className="text-2xl text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed">
                                Diseña una nueva ruta de conocimiento asignando estudiantes y expertos.
                            </p>
                        </div>

                        <form onSubmit={handleAddProject} className="p-16 lg:p-24 space-y-24 max-w-[1300px] mx-auto">

                            {/* TÍTULO - EXTREMADAMENTE GRANDE */}
                            <div className="space-y-8 text-center">
                                <label className="block text-lg font-black uppercase tracking-[0.5em] text-slate-400">Título de la Obra</label>
                                <input
                                    required
                                    className="w-full p-12 rounded-[40px] bg-slate-50 border-4 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-5xl md:text-6xl font-black text-center text-slate-800 placeholder:text-slate-200 shadow-inner"
                                    style={{ fontFamily: 'Poppins' }}
                                    placeholder="ESCRIBE EL TÍTULO AQUÍ..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* EQUIPO DE ALUMNOS - 3 COLUMNAS CON TARJETAS GIGANTES */}
                            <div className="space-y-10">
                                <label className="block text-center text-lg font-black uppercase tracking-[0.5em] text-slate-400">Equipo de Estudiantes</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {studentNames.map((name, i) => (
                                        <div key={i} className="relative rounded-[50px] p-2" style={{
                                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                            padding: '8px' // EL FILO CHULO MÁS GRANDE
                                        }}>
                                            <div className="bg-white rounded-[42px] p-10 h-full flex flex-col items-center shadow-xl">
                                                <div className="w-20 h-20 rounded-[28px] bg-slate-50 text-blue-600 flex items-center justify-center font-black text-3xl mb-8 shadow-inner">
                                                    0{i + 1}
                                                </div>
                                                <input
                                                    required={i === 0}
                                                    className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white outline-none transition-all font-black text-center text-3xl placeholder:text-slate-200"
                                                    placeholder="NOMBRE"
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

                            {/* TUTOR Y TRIBUNAL - DISTRIBUCIÓN HORIZONTAL */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t-4 border-slate-50 pt-24">

                                {/* TUTOR - 4 COLUMNAS */}
                                <div className="lg:col-span-4 space-y-8">
                                    <label className="block text-center text-lg font-black uppercase tracking-[0.4em] text-slate-400">Profesor Tutor</label>
                                    <div className="bg-slate-50 rounded-[50px] p-12 border-4 border-slate-100 flex flex-col items-center justify-center h-full min-h-[300px]">
                                        <div className="text-7xl mb-10">👨‍🏫</div>
                                        <select
                                            required
                                            className="w-full p-8 rounded-[30px] bg-white border-4 border-transparent focus:border-orange-400 outline-none transition-all font-black text-2xl text-center appearance-none cursor-pointer shadow-lg"
                                            value={tutorId}
                                            onChange={(e) => setTutorId(e.target.value)}
                                        >
                                            <option value="">Elegir Tutor...</option>
                                            {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* TRIBUNAL SELECCIONABLE - 8 COLUMNAS (3 COLUMNAS INTERNAS) */}
                                <div className="lg:col-span-8 space-y-8">
                                    <label className="block text-center text-lg font-black uppercase tracking-[0.4em] text-slate-400">Miembros del Tribunal</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {tribunals.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => toggleTribunal(t.id)}
                                                className={`relative rounded-[50px] p-10 cursor-pointer transition-all hover:-translate-y-3 flex flex-col items-center text-center justify-center min-h-[280px] ${selectedTribunals.includes(t.id)
                                                        ? 'bg-slate-900 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] scale-105'
                                                        : 'bg-white border-4 border-slate-100 text-slate-700 hover:border-blue-200'
                                                    }`}
                                            >
                                                <div className={`w-24 h-24 rounded-[35px] flex items-center justify-center text-4xl font-black mb-6 transition-all ${selectedTribunals.includes(t.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-blue-600'
                                                    }`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Poppins' }}>{t.name}</h3>
                                                <p className={`text-xs font-black uppercase tracking-widest ${selectedTribunals.includes(t.id) ? 'text-blue-400' : 'text-slate-400'
                                                    }`}>
                                                    EXPERTO EVALUADOR
                                                </p>
                                                {selectedTribunals.includes(t.id) && (
                                                    <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black animate-in zoom-in">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* BOTÓN FINAL - CENTRADO Y GIGANTE */}
                            <div className="flex justify-center pt-12 pb-8">
                                <button
                                    disabled={isSaving || selectedTribunals.length === 0}
                                    type="submit"
                                    className="group relative px-28 py-10 rounded-[40px] bg-[#10B981] text-white font-black text-4xl hover:scale-110 active:scale-95 transition-all shadow-[0_35px_70px_-15px_rgba(16,185,129,0.5)] disabled:opacity-30 disabled:grayscale"
                                    style={{ fontFamily: 'Poppins' }}
                                >
                                    {isSaving ? 'PLANIFICANDO...' : '¡LANZAR INVESTIGACIÓN! 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
