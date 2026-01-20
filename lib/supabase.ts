import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValid = (key: any) => {
    if (typeof key !== 'string') return false;
    const k = key.trim();
    return k.length > 20 && k !== 'undefined' && k !== 'null';
};

// Lazy initialization to avoid top-level crashes
let _realSupabase: any = null;

const getClient = () => {
    if (_realSupabase) return _realSupabase;

    if (isValid(supabaseUrl) && isValid(supabaseAnonKey)) {
        try {
            console.log('[Supabase] Initializing client...');
            _realSupabase = createClient(supabaseUrl, supabaseAnonKey);
            return _realSupabase;
        } catch (e: any) {
            console.error('[Supabase Init Error] Synchronous crash:', e.message);
        }
    }
    return null;
};

export const supabase = new Proxy({}, {
    get: (target, prop) => {
        const client = getClient();
        if (!client) {
            const msg = `Supabase Client Error: Keys are missing or invalid. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Current URL status: ${!!supabaseUrl}, Key status: ${!!supabaseAnonKey}`;
            if (typeof window !== 'undefined') {
                // Prevent multiple alerts/logs
                if (!(window as any)._supabaseErrorLogged) {
                    console.error(msg);
                    (window as any)._supabaseErrorLogged = true;
                }
            }
            // Return a "dead" object for common auth methods to prevent immediate crash if possible,
            // but eventually we must throw if the app logic depends on it.
            if (prop === 'auth') {
                return {
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    getSession: async () => ({ data: { session: null } }),
                    signInWithPassword: async () => ({ error: { message: msg } }),
                    signOut: async () => { }
                };
            }
            throw new Error(msg);
        }
        return client[prop];
    }
}) as ReturnType<typeof createClient>;
