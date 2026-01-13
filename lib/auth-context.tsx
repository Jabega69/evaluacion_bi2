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

    // Internal counters to manage overlap
    const pendingOps = useRef(0);
    const lastFetchedEmail = useRef<string | null>(null);
    const isFetching = useRef<boolean>(false);

    const startOp = () => {
        pendingOps.current++;
        setIsLoading(true);
    };

    const endOp = () => {
        pendingOps.current--;
        if (pendingOps.current <= 0) {
            pendingOps.current = 0;
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    await fetchUserRole(session.user.email);
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                // Initial load finishing
                setIsLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth state change:', event, session?.user?.email);
            if (session?.user?.email) {
                await fetchUserRole(session.user.email);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                lastFetchedEmail.current = null;
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Promise-based deduplication
    const activeFetch = useRef<Promise<void> | null>(null);

    const fetchUserRole = async (email: string, retryCount = 0): Promise<void> => {
        if (!email) {
            setIsLoading(false);
            return;
        }

        // Dedup: if there's an active fetch for this email, wait for it
        // BUT don't join if it's a retry (internal call)
        if (activeFetch.current && lastFetchedEmail.current === email && retryCount === 0) {
            console.log('[AuthContext] Joining existing fetch for:', email);
            return activeFetch.current;
        }

        const fetchPromise = (async () => {
            console.log(`[AuthContext] fetchUserRole starting for ${email} (attempt ${retryCount + 1})`);
            startOp();
            isFetching.current = true;
            lastFetchedEmail.current = email;

            try {
                const { data: users, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email);

                if (error) {
                    if (error.message?.includes('AbortError') && retryCount < 3) {
                        console.log(`[AuthContext] AbortError detected, retrying (count ${retryCount + 1})...`);
                        // Clear active fetch before retrying to allow the new one to run
                        activeFetch.current = null;
                        isFetching.current = false;
                        await new Promise(r => setTimeout(r, 800));
                        return await fetchUserRole(email, retryCount + 1);
                    }
                    console.error('[AuthContext] Error fetching user profile:', error);
                    setUser(null);
                } else {
                    const data = users && users.length > 0 ? users[0] : null;
                    if (data) {
                        console.log('[AuthContext] Profile found for:', data.name);
                        const roles = data.roles || (data.role ? [data.role] : []);
                        setUser({
                            ...data,
                            roles: roles,
                            activeRole: roles.length === 1 ? roles[0] : undefined
                        });
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
                activeFetch.current = null;
                endOp();
                console.log('[AuthContext] fetchUserRole finished');
            }
        })();

        // Only set activeFetch if it's the primary call
        if (retryCount === 0) {
            activeFetch.current = fetchPromise;
        }
        return fetchPromise;
    };

    const setActiveRole = (role: Role) => {
        if (user) {
            setUser({ ...user, activeRole: role });
        }
    };

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login called for:', email);
        startOp();
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
            // Important: we don't endOp here, we let the onAuthStateChange + fetchUserRole handle it
            // or we manually wait for it here. Let's wait for it.
            await fetchUserRole(email);
            return { success: true };
        } catch (err) {
            console.error('[AuthContext] Unexpected error during login:', err);
            return { success: false, error: 'An unexpected error occurred' };
        } finally {
            endOp();
        }
    };

    const loginWithGoogle = async () => {
        startOp();
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) console.error('Google Auth Error:', error);
        } finally {
            endOp();
        }
    };

    const signUp = async (email: string, password: string) => {
        startOp();
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } finally {
            endOp();
        }
    };

    const logout = async () => {
        startOp();
        try {
            await supabase.auth.signOut();
            setUser(null);
            lastFetchedEmail.current = null;
            router.push('/');
        } finally {
            endOp();
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
