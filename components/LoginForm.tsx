'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const { login, isLoading } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email);
        } catch (err) {
            setError('Error al iniciar sesión. Verifica el email.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-md text-center">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Poppins' }}>
                        ¡Hola de nuevo! 👋
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Accede al panel de evaluación de proyectos.
                    </p>
                </div>

                <div className="bg-[#FFF7ED] rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-orange-900/50 ml-4">Email Corporativo</label>
                            <input
                                type="email"
                                required
                                className="w-full p-4 rounded-2xl bg-white border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-lg shadow-sm placeholder:text-slate-300 text-slate-800"
                                placeholder="usuario@escuela.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-100 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-2xl bg-[#F97316] text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200"
                        >
                            {isLoading ? 'Entrando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>

                <div className="mt-12 opacity-60">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Usuarios de prueba disponibles en la base de datos
                    </p>
                </div>
            </div>
        </div>
    );
}
