'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { generateProjectListPDF } from '@/lib/pdf-generator';

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            const data = await api.projects.getAll();
            setProjects(data);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    const handleExport = () => {
        generateProjectListPDF(projects);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando proyectos...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Listado de Proyectos</h1>
                    <p className="text-slate-500 mt-2 font-medium">Asignaciones de tribunales y cronograma de exposiciones</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <span className="text-xl">📑</span> Descargar PDF
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proyecto / Alumnos</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tribunal Asignado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tutor/a</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Exposición</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-sm mb-1">{project.title}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {project.students.map(s => (
                                                <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {project.tribunalNames && project.tribunalNames.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {project.tribunalNames.map((name, i) => (
                                                    <span key={i} className="text-slate-700 font-medium">• {name}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                        {project.tutorName || <span className="text-slate-400 italic">Sin asignar</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {project.presentationDate ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">
                                                    {new Date(project.presentationDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="text-slate-500 text-xs">
                                                    {new Date(project.presentationDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {project.presentationLocation && (
                                                    <span className="text-indigo-500 text-xs mt-0.5 font-medium">📍 {project.presentationLocation}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No hay proyectos registrados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
