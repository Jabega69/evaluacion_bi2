import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Strict validation helper
const isValid = (val: any): val is string => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null' || trimmed.length < 10) return false;
    return true;
};

let clientInstance: any = null;

// Only even attempt to call createClient if keys look like real Supabase keys
if (isValid(url) && isValid(key)) {
    try {
        console.log('[Supabase Client] Initializing with detected keys...');
        clientInstance = createClient(url, key);
    } catch (e: any) {
        console.error('[Supabase Client] CRITICAL: Initialization threw error:', e.message);
    }
}

// Ensure the exported object has at least the basic auth methods to avoid crashes in AuthProvider
// but also ensure it doesn't try to actually do anything if not configured.
const mockClient = {
    auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Configuración faltante' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Configuración faltante' } }),
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
    console.warn('[Supabase Client] API keys are missing or invalid. Application is running in mock mode.');
}
