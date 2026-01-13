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
        // Check active session
        const checkSession = async () => {
            startOp();
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
                endOp();
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth state change:', event, session?.user?.email);
            if (session?.user?.email) {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    startOp();
                    await fetchUserRole(session.user.email);
                    endOp();
                } else {
                    // Just sync without full loading block if it's just a routine change
                    await fetchUserRole(session.user.email);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                lastFetchedEmail.current = null;
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (email: string, retryCount = 0) => {
        if (!email) return;

        // Skip if already fetching THIS specific email to avoid AbortError
        if (isFetching.current && lastFetchedEmail.current === email) {
            console.log('[AuthContext] Already fetching profile for this email, skipping');
            return;
        }

        console.log(`[AuthContext] fetchUserRole starting for ${email} (attempt ${retryCount + 1})`);
        isFetching.current = true;
        lastFetchedEmail.current = email;

        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (error) {
                if (error.message?.includes('AbortError') && retryCount < 3) {
                    console.log(`[AuthContext] AbortError detected, retrying...`);
                    isFetching.current = false;
                    await new Promise(r => setTimeout(r, 800));
                    return fetchUserRole(email, retryCount + 1);
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
