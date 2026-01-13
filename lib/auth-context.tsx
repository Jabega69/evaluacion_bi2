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

    const lastFetchedEmail = useRef<string | null>(null);
    const activeFetch = useRef<Promise<void> | null>(null);
    const fetchUserRole = async (email: string, retryCount = 0): Promise<void> => {
        if (!email) {
            setIsLoading(false);
            return;
        }

        // Simple guard to prevent multiple concurrent profile fetches
        if (activeFetch.current && lastFetchedEmail.current === email) {
            console.log('[AuthContext] Profile fetch already in progress for:', email);
            return activeFetch.current;
        }

        console.log(`[AuthContext] fetchUserRole starting for ${email} (attempt ${retryCount + 1})`);
        setIsLoading(true);
        lastFetchedEmail.current = email;

        const performFetch = async () => {
            try {
                // Add a 10s timeout to the database query
                const fetchPromise = supabase.from('users').select('*').eq('email', email);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 10000));

                const { data: users, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

                if (error) {
                    if (error.message?.includes('AbortError') && retryCount < 2) {
                        console.log(`[AuthContext] AbortError, retrying...`);
                        await new Promise(r => setTimeout(r, 1000));
                        activeFetch.current = null; // Reset before retry
                        return fetchUserRole(email, retryCount + 1);
                    }
                    console.error('[AuthContext] Error fetching profile:', error);
                    setUser(null);
                } else if (users && users.length > 0) {
                    const data = users[0];
                    console.log('[AuthContext] Profile loaded:', data.name);
                    const roles = data.roles || (data.role ? [data.role] : []);
                    setUser({
                        ...data,
                        roles,
                        activeRole: roles.length === 1 ? roles[0] : undefined
                    });
                } else {
                    console.warn('[AuthContext] No profile for:', email);
                    setUser(null);
                }
            } catch (err) {
                console.error('[AuthContext] Profile fetch exception:', err);
                setUser(null);
            } finally {
                activeFetch.current = null;
                setIsLoading(false);
                console.log('[AuthContext] fetchUserRole finished');
            }
        };

        activeFetch.current = performFetch();
        return activeFetch.current;
    };

    useEffect(() => {
        const checkInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    await fetchUserRole(session.user.email);
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                console.error('Initial session check failed', e);
                setIsLoading(false);
            }
        };

        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth session change:', event, session?.user?.email);
            if (session?.user?.email) {
                await fetchUserRole(session.user.email);
            } else {
                setUser(null);
                lastFetchedEmail.current = null;
                activeFetch.current = null;
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const setActiveRole = (role: Role) => {
        if (user) {
            setUser({ ...user, activeRole: role });
        }
    };

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login attempt for:', email);
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setIsLoading(false);
                return { success: false, error: error.message };
            }

            // We wait for the profile to be fetched (onAuthStateChange will also trigger it, 
            // but calling it here ensures we wait for success before returning)
            await fetchUserRole(email);
            return { success: true };
        } catch (err) {
            setIsLoading(false);
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) {
                console.error('Google Auth Error:', error);
                setIsLoading(false);
            }
        } catch (e) {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            setIsLoading(false);
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (e) {
            setIsLoading(false);
            return { success: false, error: 'Signup error' };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            lastFetchedEmail.current = null;
            activeFetch.current = null;
            router.push('/');
        } finally {
            setIsLoading(false);
        }
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
