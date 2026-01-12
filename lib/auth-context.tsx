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
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Session check error:', error);
                setIsLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user?.email) {
                await fetchUserRole(session.user.email);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
                return;
            }

            if (data) {
                // Defensive check: handle both 'roles' (new) and 'role' (old) during transition
                const roles = data.roles || (data.role ? [data.role] : []);
                const userData: User = {
                    ...data,
                    roles: roles,
                    activeRole: roles.length === 1 ? roles[0] : undefined
                };
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Unexpected error in fetchUserRole:', err);
            setUser(null);
        } finally {
            setIsLoading(false);
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
