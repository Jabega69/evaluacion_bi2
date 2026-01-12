'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    setActiveRole: (role: Role) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    await fetchUserRole(session.user.email);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user?.email) {
                await fetchUserRole(session.user.email);
            } else {
                setUser(null);
                // router.push('/'); // Optional: Force redirect on logout
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (email: string) => {
        // Fetch role from public.users
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (data) {
            const userData = data as User;
            // If only one role, set it as active automatically
            if (userData.roles?.length === 1) {
                userData.activeRole = userData.roles[0];
            }
            setUser(userData);
        } else {
            console.warn('User authenticated but not found in public.users');
            setUser(null);
        }
    };

    const setActiveRole = (role: Role) => {
        if (user) {
            setUser({ ...user, activeRole: role });
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: 'An unexpected error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
        if (error) console.error('Google Auth Error:', error);
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password
        });
        setIsLoading(false);
        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, signUp, logout, setActiveRole, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
