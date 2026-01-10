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
                api.users.getAll()
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
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#F9FAFB', // Fondo base claro
            fontFamily: "'Poppins', sans-serif"
        }}>

            {/* Cabecera Principal - Estilo Garantizado */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto 3rem auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#0F172A', // Slate 900
                    marginBottom: '1rem',
                    lineHeight: 1.2
                }}>
                    Panel de <span style={{ color: '#2563EB' }}>Investigaciones</span> 🔬
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748B', // Slate 500
                    fontWeight: 600,
                    marginBottom: '2rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}>
                    Gestión Académica y Control de Proyectos
                </p>

                {/* Botón Nueva Investigación - Estilo 3D Manual */}
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: 'white',
                        padding: '1rem 2.5rem',
                        borderRadius: '50px',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '1.5rem' }}>+</span> Nueva Investigación
                </button>
            </div>

            {/* Contenido Principal */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '30px',
                        border: '4px dashed #E2E8F0',
                        color: '#94A3B8'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.5 }}>📂</div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#CBD5E1', marginBottom: '0.5rem' }}>No hay proyectos activos</h3>
                        <p style={{ fontWeight: 600 }}>¡Comienza pulsando el botón azul superior!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Grid responsivo
                        gap: '2rem'
                    }}>
                        {projects.map((project) => (
                            <div key={project.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #F1F5F9',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '99px',
                                        backgroundColor: '#EFF6FF',
                                        color: '#2563EB',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        marginBottom: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Proyecto
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        marginBottom: '0.5rem',
                                        lineHeight: 1.3
                                    }}>
                                        {project.title}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                                        {project.students.length} Estudiante{project.students.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: '#F8FAFC',
                                    borderTop: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <Link href={`/dashboard/admin/reports/${project.id}`} style={{
                                        color: '#2563EB',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'none'
                                    }}>
                                        Ver Detalles →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL GIGANTE - CON ESTILOS INLINE PARA GARANTIZAR LAYOUT (VERSIÓN COMPACTA) */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1100px', // Reducido de 1400px
                        backgroundColor: 'white',
                        borderRadius: '24px', // Reducido de 40px
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        border: '8px solid white', // Reducido de 12px
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '95vh'
                    }}>

                        {/* Header del Modal */}
                        <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    width: '40px', // Reducido
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#F1F5F9',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                &times;
                            </button>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem', fontFamily: 'Poppins' }}>
                                Lanzar <span style={{ color: '#2563EB' }}>Investigación</span> 🚀
                            </h2>
                            <p style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 600 }}>
                                Diseña una nueva ruta de conocimiento asignando estudiantes y expertos.
                            </p>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <form onSubmit={handleAddProject} style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* TÍTULO */}
                                <div style={{ textAlign: 'center' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: '0.5rem' }}>Título de la Obra</label>
                                    <input
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '1rem', // Reducido de 2rem
                                            borderRadius: '16px',
                                            backgroundColor: '#F8FAFC',
                                            border: '2px solid #E2E8F0',
                                            fontSize: '1.5rem', // Reducido de 2.5rem
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            color: '#1E293B',
                                            outline: 'none',
                                            fontFamily: 'Poppins'
                                        }}
                                        placeholder="ESCRIBE EL TÍTULO AQUÍ..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* ALUMNOS - GRID DE 3 COLUMNAS REAL */}
                                <div>
                                    <label style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: '1rem' }}>Equipo de Estudiantes</label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1rem', // Reducido de 2rem
                                        width: '100%'
                                    }}>
                                        {studentNames.map((name, i) => (
                                            <div key={i} style={{
                                                position: 'relative',
                                                borderRadius: '20px',
                                                padding: '4px',
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)', // FILO CHULO
                                                boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.2)'
                                            }}>
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    padding: '1rem', // Reducido
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.75rem'
                                                }}>
                                                    <div style={{
                                                        width: '40px', // Reducido
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#EFF6FF',
                                                        color: '#2563EB',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1rem',
                                                        fontWeight: 800
                                                    }}>
                                                        0{i + 1}
                                                    </div>
                                                    <input
                                                        required={i === 0}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#F8FAFC',
                                                            border: 'none',
                                                            textAlign: 'center',
                                                            fontSize: '1rem', // Reducido
                                                            fontWeight: 600,
                                                            color: '#334155',
                                                            outline: 'none'
                                                        }}
                                                        placeholder="Nombre Alumno"
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

                                {/* PROFESORES - GRID DE 4 COLUMNAS (1 Tutor + 3 Tribunal) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', borderTop: '2px solid #F1F5F9', paddingTop: '2rem' }}>

                                    {/* TUTOR */}
                                    <div>
                                        <label style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: '1rem' }}>Profesor Tutor</label>
                                        <div style={{
                                            backgroundColor: '#FFF7ED',
                                            borderRadius: '20px',
                                            padding: '1.5rem',
                                            border: '2px solid #FFEDD5',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%'
                                        }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👨‍🏫</div>
                                            <select
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'white',
                                                    border: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    color: '#EA580C',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                                                }}
                                                value={tutorId}
                                                onChange={(e) => setTutorId(e.target.value)}
                                            >
                                                <option value="">Elegir Tutor...</option>
                                                {tutors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* TRIBUNAL */}
                                    <div>
                                        <label style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: '1rem' }}>Miembros del Tribunal</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            {tribunals.map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => toggleTribunal(t.id)}
                                                    style={{
                                                        position: 'relative',
                                                        borderRadius: '20px',
                                                        padding: '1rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        backgroundColor: selectedTribunals.includes(t.id) ? '#1E293B' : 'white',
                                                        color: selectedTribunals.includes(t.id) ? 'white' : '#334155',
                                                        border: selectedTribunals.includes(t.id) ? 'none' : '2px solid #F1F5F9',
                                                        transform: selectedTribunals.includes(t.id) ? 'scale(1.02)' : 'scale(1)',
                                                        boxShadow: selectedTribunals.includes(t.id) ? '0 10px 20px -5px rgba(0,0,0,0.3)' : 'none'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '50px', // Reducido
                                                        height: '50px',
                                                        borderRadius: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.25rem',
                                                        fontWeight: 800,
                                                        marginBottom: '0.5rem',
                                                        backgroundColor: selectedTribunals.includes(t.id) ? '#3B82F6' : '#F1F5F9',
                                                        color: selectedTribunals.includes(t.id) ? 'white' : '#3B82F6'
                                                    }}>
                                                        {t.name.charAt(0)}
                                                    </div>
                                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.1rem', fontFamily: 'Poppins', lineHeight: '1.2' }}>{t.name}</h3>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                                                        Evaluador
                                                    </p>
                                                    {selectedTribunals.includes(t.id) && (
                                                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: '#10B981', fontSize: '1rem', fontWeight: 900 }}>✓</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* BOTÓN FINAL */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <button
                                        disabled={isSaving || selectedTribunals.length === 0}
                                        type="submit"
                                        style={{
                                            padding: '1rem 3rem',
                                            borderRadius: '30px',
                                            backgroundColor: '#10B981',
                                            color: 'white',
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            border: 'none',
                                            cursor: selectedTribunals.length === 0 ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
                                            fontFamily: 'Poppins',
                                            opacity: selectedTribunals.length === 0 ? 0.5 : 1
                                        }}
                                    >
                                        {isSaving ? 'PLANIFICANDO...' : '¡LANZAR INVESTIGACIÓN! 🚀'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
