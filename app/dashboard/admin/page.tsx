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
    const [studentNames, setStudentNames] = useState(['', '']);
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
            setStudentNames(['', '']);
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '40px 80px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Poppins' }}>Gestión de Proyectos</h1>
                    <p className="text-gray-500 font-semibold text-lg">Administra los trabajos de investigación y sus tribunales</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
                    }}
                >
                    <span className="text-2xl">+</span> Nuevo proyecto
                </button>
            </div>

            {/* Modal de Nuevo Proyecto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>Crear nuevo proyecto</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                        </div>
                        <form onSubmit={handleAddProject} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Título del Proyecto</label>
                                <input
                                    required
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    placeholder="Ej: Análisis de Riesgos en Ciberseguridad"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Tutor Asignado</label>
                                <select
                                    required
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    value={tutorId}
                                    onChange={(e) => setTutorId(e.target.value)}
                                >
                                    <option value="">Selecciona un tutor...</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Alumnos (1 o 2)</label>
                                <div className="space-y-3">
                                    {studentNames.map((name, i) => (
                                        <input
                                            key={i}
                                            required={i === 0}
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                            placeholder={`Nombre del alumno ${i + 1}`}
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

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 p-4 rounded-xl font-bold border-2 border-gray-100 hover:bg-gray-50 transition-all text-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="flex-3 p-4 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', flex: 2 }}
                                >
                                    {isSaving ? 'Guardando...' : 'Crear proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card p-0" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden' }}>
                <table className="w-full border-collapse">
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Título del Proyecto</th>
                            <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Alumnos</th>
                            <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Tutor</th>
                            <th className="px-8 py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="text-lg font-bold text-slate-800 line-clamp-1">{project.title}</div>
                                    <div className="text-xs text-slate-400 mt-1 font-mono uppercase">ID: {project.id.slice(0, 8)}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {project.students?.map(s => (
                                            <span key={s.id} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-bold text-slate-600">ID Tutor: {project.tutorId.slice(0, 8)}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <Link
                                        href={`/dashboard/admin/reports/${project.id}`}
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white border-2 border-slate-100 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 transition-all text-sm font-bold shadow-sm"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Informe
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="text-6xl mb-4">📂</div>
                                    <div className="text-xl font-bold text-slate-400">No hay proyectos creados todavía</div>
                                    <button onClick={() => setShowModal(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Crear el primero ahora</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
