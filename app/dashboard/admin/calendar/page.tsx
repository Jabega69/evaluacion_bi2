'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';

export default function CalendarPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null); // project id being saved

    // Local state for edits before saving
    const [edits, setEdits] = useState<Record<string, { date: string, location: string }>>({});

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        setLoading(true);
        const data = await api.projects.getAll();

        // Sort by date (asc) handling nulls last
        data.sort((a, b) => {
            if (!a.presentationDate) return 1;
            if (!b.presentationDate) return -1;
            return new Date(a.presentationDate).getTime() - new Date(b.presentationDate).getTime();
        });

        const pad = (n: number) => String(n).padStart(2, '0');

        // Init edits state
        const initialEdits: any = {};
        data.forEach(p => {
            let localDateStr = '';
            if (p.presentationDate) {
                // Convertir el timestamp del servidor a la hora local exacta del navegador
                const date = new Date(p.presentationDate);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = pad(date.getMonth() + 1);
                    const day = pad(date.getDate());
                    const hours = pad(date.getHours());
                    const minutes = pad(date.getMinutes());
                    localDateStr = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }

            initialEdits[p.id] = {
                date: localDateStr,
                location: p.presentationLocation || ''
            };
        });
        setEdits(initialEdits);
        setProjects(data);
        setLoading(false);
    }

    async function handleSave(projectId: string) {
        setSubmitting(projectId);
        const edit = edits[projectId];

        let dateToSave = null;
        if (edit.date && edit.date.includes('T')) {
            // Extraemos los componentes de la fecha local del input
            const [datePart, timePart] = edit.date.split('T');

            // Obtenemos el offset actual del navegador en formato ISO (ej: +01:00)
            const dateObj = new Date();
            const offsetMinutes = -dateObj.getTimezoneOffset();
            const sign = offsetMinutes >= 0 ? '+' : '-';
            const absOffset = Math.abs(offsetMinutes);
            const hh = String(Math.floor(absOffset / 60)).padStart(2, '0');
            const mm = String(absOffset % 60).padStart(2, '0');
            const offsetStr = `${sign}${hh}:${mm}`;

            // Construimos la cadena ISO completa incluyendo el offset local
            // Esto asegura que la base de datos reciba exactamente lo que ve el usuario
            dateToSave = `${datePart}T${timePart}:00${offsetStr}`;
        }

        try {
            await api.projects.schedule({
                projectId,
                presentationDate: dateToSave,
                presentationLocation: edit.location
            });
            await loadProjects(); // Refresh summary
            // alert('Guardado con éxito');
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar');
        } finally {
            setSubmitting(null);
        }
    }

    const handleChange = (projectId: string, field: 'date' | 'location', value: string) => {
        setEdits(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                [field]: value
            }
        }));
    };

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto 3rem auto',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    marginBottom: '1rem'
                }}>
                    Agenda de <span style={{ color: '#8B5CF6' }}>Exposiciones</span> 🗓️
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748B',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}>
                    Planificación de defensas y tribunales
                </p>
            </div>

            {/* Resumen de Ocupación (Calendario Visual) */}
            {!loading && projects.some(p => p.presentationDate) && (
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto 3rem auto',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E2E8F0'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚩</span> Horarios Ocupados
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {Array.from(new Set(projects
                            .filter(p => p.presentationDate)
                            .map(p => new Date(p.presentationDate!).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }))
                        )).map(dateStr => (
                            <div key={dateStr} style={{
                                backgroundColor: '#FEF2F2', // Fondo rojo muy claro
                                border: '1px solid #FECACA',
                                borderRadius: '16px',
                                padding: '1rem'
                            }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    {dateStr}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {projects
                                        .filter(p => p.presentationDate && new Date(p.presentationDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) === dateStr)
                                        .map(p => {
                                            const time = new Date(p.presentationDate!).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={p.id} style={{
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.1rem'
                                                }}>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{time}</span>
                                                    <span>{p.title}</span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', fontWeight: 500 }}>
                        * Evita agendar nuevas defensas en los horarios marcados en rojo para prevenir conflictos.
                    </p>
                </div>
            )}

            {/* List */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#CBD5E1', fontSize: '1.5rem', fontWeight: 700 }}>
                        Cargando agenda...
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', border: '4px dashed #E2E8F0', borderRadius: '24px' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94A3B8' }}>No hay proyectos para agendar</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {projects.map(p => (
                            <div key={p.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '2rem',
                                display: 'grid',
                                gridTemplateColumns: 'minmax(300px, 1fr) auto',
                                gap: '2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #F1F5F9',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>{p.title}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {p.students.map(s => (
                                            <span key={s.id} style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: '#F3F4F6',
                                                borderRadius: '99px',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: '#4B5563'
                                            }}>
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.25rem' }}>
                                                Fecha y Hora
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={edits[p.id]?.date || ''}
                                                onChange={(e) => handleChange(p.id, 'date', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '10px',
                                                    border: '2px solid #E2E8F0',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    color: '#334155'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.25rem' }}>
                                                Ubicación / Aula
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Aula Magna, Zoom..."
                                                value={edits[p.id]?.location || ''}
                                                onChange={(e) => handleChange(p.id, 'location', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '10px',
                                                    border: '2px solid #E2E8F0',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    color: '#334155'
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSave(p.id)}
                                            disabled={submitting === p.id}
                                            style={{
                                                alignSelf: 'flex-end',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: submitting === p.id ? '#CBD5E1' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                                color: 'white',
                                                fontWeight: 800,
                                                cursor: submitting === p.id ? 'not-allowed' : 'pointer',
                                                boxShadow: submitting === p.id ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)'
                                            }}
                                        >
                                            {submitting === p.id ? '...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
