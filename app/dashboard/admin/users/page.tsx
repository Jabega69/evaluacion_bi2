'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Role } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: [] as Role[]
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const data = await api.users.getAll();
        setUsers(data);
        setLoading(false);
    }

    function handleEdit(u: User) {
        setEditingUser(u);
        setFormData({
            name: u.name,
            email: u.email,
            password: '', // Password not needed for edit
            roles: u.roles || []
        });
        setShowModal(true);
    }

    async function handleDelete(id: string, name: string) {
        if (id === currentUser?.id) {
            alert('No puedes darte de baja a ti mismo por seguridad.');
            return;
        }

        if (!confirm(`¿Seguro que quieres dar de baja a ${name}? Se eliminará permanentemente de la plataforma.`)) return;

        const success = await api.users.delete(id);
        if (success) {
            loadUsers();
        } else {
            alert('Error al eliminar usuario. Es posible que el administrador principal no pueda ser eliminado.');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingUser) {
                // CHECK ACTIVITY before changing roles
                const activity = await api.users.checkActivity(editingUser.id);

                // If removing 'tutor' and they ARE a tutor
                if (editingUser.roles.includes('tutor') && !formData.roles.includes('tutor') && activity.isTutor) {
                    alert('No puedes quitar el rol de Tudor a este profesor porque ya tiene proyectos asignados como tutor.');
                    setSubmitting(false);
                    return;
                }

                // If removing 'tribunal' and they ARE in a tribunal
                if (editingUser.roles.includes('tribunal') && !formData.roles.includes('tribunal') && activity.isTribunal) {
                    alert('No puedes quitar el rol de Tribunal a este profesor porque ya está asignado a tribunales de evaluación.');
                    setSubmitting(false);
                    return;
                }

                const result = await api.users.update(editingUser.id, formData.name, formData.roles);
                if (result.success) {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', password: '', roles: [] });
                    loadUsers();
                } else {
                    alert('Error al actualizar usuario: ' + result.error);
                }
            } else {
                // CREATE Logic
                const response = await fetch('/api/admin/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    setShowModal(false);
                    setFormData({ name: '', email: '', password: '', roles: [] });
                    loadUsers();
                } else {
                    alert(result.error || 'Error al crear usuario');
                }
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setSubmitting(false);
        }
    }

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
                    Gestión de <span style={{ color: '#F59E0B' }}>Profesores</span> 🎓
                </h1>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: '', email: '', password: '', roles: [] });
                        setShowModal(true);
                    }}
                    style={{
                        marginTop: '2rem',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', // Orange/Amber
                        color: 'white',
                        padding: '1rem 2.5rem',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>+</span> Nuevo Profesor
                </button>
            </div>

            {/* List */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#CBD5E1', fontSize: '1.5rem', fontWeight: 700 }}>
                        Cargando claustro...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', border: '4px dashed #E2E8F0', borderRadius: '24px' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94A3B8' }}>No hay profesores registrados</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {users.map(u => (
                            <div key={u.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '1.5rem 2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #F1F5F9'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        backgroundColor: u.roles?.includes('admin') ? '#F1F5F9' : (u.roles?.includes('tutor') ? '#CCFBF1' : '#F3E8FF'),
                                        color: u.roles?.includes('admin') ? '#64748B' : (u.roles?.includes('tutor') ? '#0D9488' : '#7C3AED'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 900
                                    }}>
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>{u.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>{u.email}</span>
                                            {u.roles?.map(role => (
                                                <span key={role} style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: role === 'admin' ? '#E2E8F0' : (role === 'tutor' ? '#E0F2FE' : '#FAE8FF'),
                                                    color: role === 'admin' ? '#475569' : (role === 'tutor' ? '#0284C7' : '#A855F7'),
                                                }}>
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleEdit(u)}
                                        style={{
                                            padding: '0.75rem 1.25rem',
                                            borderRadius: '12px',
                                            color: '#475569',
                                            backgroundColor: '#F1F5F9',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id, u.name)}
                                        style={{
                                            padding: '0.75rem 1.25rem',
                                            borderRadius: '12px',
                                            color: '#EF4444',
                                            backgroundColor: '#FEF2F2',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s'
                                        }}
                                        className="hover:bg-red-100"
                                    >
                                        Dar de Baja
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '30px',
                        padding: '3rem',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '2rem', textAlign: 'center' }}>
                            {editingUser ? 'Editar Profesor' : 'Nuevo Profesor'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    autoComplete="off"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #E2E8F0',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="Ej. María García"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Email Corporativo</label>
                                <input
                                    required
                                    type="email"
                                    autoComplete="off"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #E2E8F0',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>

                            {!!editingUser ? null : (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Contraseña Temporal</label>
                                    <input
                                        required
                                        type="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: '2px solid #E2E8F0',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        placeholder="Clave inicial"
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>Roles Asignados</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { id: 'tutor', label: 'Tutor (Seguimiento)' },
                                        { id: 'tribunal', label: 'Tribunal (Evaluador)' },
                                        { id: 'admin', label: 'Administrador' }
                                    ].map((role) => (
                                        <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(role.id as Role)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        roles: checked
                                                            ? [...prev.roles, role.id as Role]
                                                            : prev.roles.filter(r => r !== role.id)
                                                    }));
                                                }}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontSize: '1rem', color: '#1e293b' }}>{role.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #E2E8F0',
                                        background: 'white',
                                        color: '#64748B',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        flex: 2,
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: submitting ? '#94A3B8' : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        cursor: submitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {submitting ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Profesor')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
