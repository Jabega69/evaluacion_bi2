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
    const [editingProject, setEditingProject] = useState<Project | null>(null);
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
                api.users.getAll()
            ]);
            setProjects(pData);
            setAllUsers(uData);
        } finally {
            setLoading(false);
        }
    };

    const tutors = allUsers.filter(u => u.roles?.includes('tutor'));
    const tribunals = allUsers.filter(u => u.roles?.includes('tribunal'));

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        const validStudents = studentNames.filter(name => name.trim() !== '');

        if (!title || !tutorId || selectedTribunals.length !== 3 || validStudents.length === 0) {
            alert('Por favor, completa el título, tutor, exactamente 3 miembros de tribunal y al menos un alumno.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingProject) {
                await api.projects.updateFull({
                    projectId: editingProject.id,
                    title,
                    tutorId,
                    studentNames: validStudents,
                    tribunalIds: selectedTribunals
                });
            } else {
                await api.projects.create({
                    title,
                    tutorId,
                    studentNames: validStudents,
                    tribunalIds: selectedTribunals
                });
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar el proyecto');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProject = async (id: string, title: string) => {
        if (!confirm(`¿Seguro que quieres eliminar "${title}"?`)) return;
        try {
            await api.projects.delete(id);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar');
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setTitle(project.title);
        setTutorId(project.tutorId);
        setSelectedTribunals(project.tribunalIds || []);
        const names = ['', '', ''];
        project.students.forEach((s, i) => { if (i < 3) names[i] = s.name; });
        setStudentNames(names);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingProject(null);
        setTitle('');
        setTutorId('');
        setSelectedTribunals([]);
        setStudentNames(['', '', '']);
    };

    const toggleTribunal = (id: string) => {
        if (id === tutorId) return;
        setSelectedTribunals(prev => {
            if (prev.includes(id)) return prev.filter(t => t !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Cargando Sistema</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-['Inter',sans-serif]">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-xl border-2 border-white p-8 rounded-[3rem] shadow-xl shadow-indigo-100/50">
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Panel <span className="text-indigo-600">Admin</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">Gestión de Investigaciones Académicas</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="mt-6 md:mt-0 group relative overflow-hidden bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            <span className="text-2xl">+</span> NUEVO PROYECTO
                        </span>
                    </button>
                </header>

                {/* Dashboard Stats / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-slate-100">
                            <span className="text-8xl mb-6 grayscale opacity-20">📚</span>
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Sin proyectos activos</h3>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="group relative bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 overflow-hidden">
                                {/* Gradient Overlay on hover */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                            INVESTIGACIÓN
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(project)} className="p-2 hover:bg-slate-50 rounded-lg text-lg">✏️</button>
                                            <button onClick={() => handleDeleteProject(project.id, project.title)} className="p-2 hover:bg-red-50 rounded-lg text-lg text-red-500">🗑️</button>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 leading-tight min-h-[4.5rem] line-clamp-3">
                                        {project.title}
                                    </h3>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {project.students.map((s, i) => (
                                                <div key={s.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm" title={s.name}>
                                                    {s.name.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                        <Link
                                            href={`/dashboard/admin/reports/${project.id}`}
                                            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2"
                                        >
                                            Resultados ➔
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <header className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-3xl font-black text-slate-900">
                                {editingProject ? 'Editar' : 'Nueva'} <span className="text-indigo-600">Investigación</span>
                            </h2>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors">&times;</button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10">
                            <form onSubmit={handleAddProject} className="space-y-12">
                                <div className="space-y-4 text-center">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Título de la Obra</label>
                                    <input
                                        required
                                        className="w-full text-center text-3xl font-black text-slate-900 bg-slate-50 border-4 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl p-8 outline-none transition-all placeholder:opacity-20"
                                        placeholder="TÍTULO AQUÍ..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {studentNames.map((name, i) => (
                                        <div key={i} className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 text-center block">Alumno 0{i + 1}</label>
                                            <input
                                                className="w-full text-center font-bold p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 outline-none transition-all"
                                                placeholder="Nombre..."
                                                value={name}
                                                onChange={(e) => {
                                                    const n = [...studentNames];
                                                    n[i] = e.target.value;
                                                    setStudentNames(n);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-slate-100">
                                    <div className="col-span-1 space-y-4">
                                        <label className="text-xs font-black text-orange-500 uppercase block text-center">Tutor</label>
                                        <select
                                            required
                                            className="w-full bg-orange-50 text-orange-700 font-black p-4 rounded-2xl outline-none border-2 border-transparent focus:border-orange-200"
                                            value={tutorId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setTutorId(id);
                                                setSelectedTribunals(prev => prev.filter(t => t !== id));
                                            }}
                                        >
                                            <option value="">Elegir...</option>
                                            {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-3 space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase block text-center tracking-widest">Tribunal (Elige 3)</label>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {tribunals.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    disabled={t.id === tutorId}
                                                    onClick={() => toggleTribunal(t.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTribunals.includes(t.id)
                                                        ? 'bg-slate-900 text-white scale-105 shadow-lg'
                                                        : t.id === tutorId ? 'opacity-20 grayscale' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <footer className="pt-12 text-center">
                                    <button
                                        disabled={isSaving || !title || !tutorId || selectedTribunals.length !== 3 || studentNames.filter(n => n.trim() !== '').length === 0}
                                        type="submit"
                                        className="bg-indigo-600 text-white px-16 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-30 transition-all uppercase tracking-widest"
                                    >
                                        {isSaving ? 'Guardando...' : `${editingProject ? 'Actualizar' : 'Crear'} Investigación 🚀`}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
