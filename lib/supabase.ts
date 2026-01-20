import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'undefined' &&
    supabaseAnonKey !== 'undefined';

// We initialize the real client ONLY if we have valid-looking keys.
// Otherwise, we export a safe mock that won't crash the browser at startup.
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : ({
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            getSession: async () => ({ data: { session: null } }),
            signInWithPassword: async () => ({ error: { message: 'Configuración de Supabase incompleta' } }),
            signOut: async () => { },
            signInWithOAuth: async () => ({ error: { message: 'Configuración de Supabase incompleta' } }),
            signUp: async () => ({ error: { message: 'Configuración de Supabase incompleta' } }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { message: 'Configuración de Supabase incompleta' } }),
                    order: () => ({ data: [], error: null }),
                }),
                order: () => ({ data: [], error: null }),
                then: (cb: any) => cb({ data: [], error: null }),
            }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ data: [], error: null }) }) }),
            delete: () => ({ eq: () => ({ data: null, error: null }) }),
        }),
    } as any);

if (typeof window !== 'undefined' && !isConfigured) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing in the browser environment.');
}
