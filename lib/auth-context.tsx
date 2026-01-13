'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

    const lastFetchedEmail = useRef<string | null>(null);
    const isFetching = useRef<boolean>(false);

    const fetchUserRole = async (email: string, retryCount = 0) => {
        if (!email) return;

        // If we are already fetching, don't start another one
        if (isFetching.current) {
            console.log('[AuthContext] Already fetching profile, skipping overlapping call');
            return;
        }

        console.log(`[AuthContext] fetchUserRole starting for ${email} (attempt ${retryCount + 1})`);
        isFetching.current = true;
        setIsLoading(true);

        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (error) {
                // If it's an AbortError, retry after a short delay
                if (error.message?.includes('AbortError') && retryCount < 3) {
                    console.log('[AuthContext] AbortError detected, retrying in 500ms...');
                    isFetching.current = false;
                    setTimeout(() => fetchUserRole(email, retryCount + 1), 500);
                    return;
                }

                console.error('[AuthContext] Error fetching user profile:', error);
                setUser(null);
            } else {
                const data = users && users.length > 0 ? users[0] : null;
                if (data) {
                    console.log('[AuthContext] Profile found for:', data.name);
                    const roles = data.roles || (data.role ? [data.role] : []);
                    const userData: User = {
                        ...data,
                        roles: roles,
                        activeRole: roles.length === 1 ? roles[0] : undefined
                    };
                    setUser(userData);
                    lastFetchedEmail.current = email;
                } else {
                    console.warn('[AuthContext] No profile record found for:', email);
                    setUser(null);
                }
            }
        } catch (err) {
            console.error('[AuthContext] Unexpected error in fetchUserRole:', err);
            setUser(null);
        } finally {
            isFetching.current = false;
            setIsLoading(false);
            console.log('[AuthContext] fetchUserRole finished');
        }
    };

    const setActiveRole = (role: Role) => {
        if (user) {
            setUser({ ...user, activeRole: role });
        }
    };

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login called for:', email);
        setIsLoading(true);
        try {
            console.log('[AuthContext] Attempting signInWithPassword...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('[AuthContext] Login error:', error.message);
                return { success: false, error: error.message };
            }

            console.log('[AuthContext] Login successful, session created');
            return { success: true };
        } catch (err) {
            console.error('[AuthContext] Unexpected error during login:', err);
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
