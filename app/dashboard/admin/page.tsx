'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const data = await api.projects.getByTutor('tutor-1');
            setProjects(data);
            setLoading(false);
        }
        init();
    }, []);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">Gestión de Proyectos</h2>
                    <p className="text-slate-500 mt-1">Supervisión general del proceso de calificación</p>
                </div>
                <button className="btn btn-primary">
                    <span className="text-lg">+</span> Nuevo Proyecto
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Proyecto
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Alumnos
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{project.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">ID: {project.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2">
                                        {project.students.map(s => (
                                            <div key={s.id} className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                                                {s.name.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="badge badge-green">
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <Link
                                        href={`/dashboard/admin/reports/${project.id}`}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 transition-all text-xs font-semibold bg-white shadow-sm hover:shadow-md"
                                    >
                                        Ver Informe
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
