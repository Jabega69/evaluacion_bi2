import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Strict validation helper
const isValid = (val: string): boolean => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null' || trimmed.length < 10) return false;
    return true;
};

let clientInstance: any = null;

// Only attempt to call createClient if keys look legitimate
if (isValid(url) && isValid(key)) {
    try {
        clientInstance = createClient(url, key);
    } catch (e: any) {
        if (typeof window !== 'undefined') console.error('[Supabase Client] Init Error:', e.message);
    }
}

// Ensure the exported object has at least the basic auth methods to avoid crashes in AuthProvider
const mockClient = {
    auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase no configurado' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase no configurado' } }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
                order: () => ({ data: [], error: null }),
            }),
            order: () => ({ data: [], error: null }),
            then: (cb: any) => cb({ data: [], error: null }),
        }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ data: [], error: null }) }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
        upsert: () => ({ data: null, error: null }),
    }),
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
    }
} as any;

export const supabase = clientInstance || mockClient;

if (typeof window !== 'undefined' && !clientInstance) {
    console.warn('[Supabase Client] Usando modo simulado por falta de llaves de API.');
}
