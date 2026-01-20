import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValid = (key: string) => key && key.length > 10 && key !== 'undefined';

const realSupabase = (isValid(supabaseUrl) && isValid(supabaseAnonKey))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to provide a better error instead of "cannot read property from of null"
const proxyHandler = {
    get: (target: any, prop: string) => {
        if (!realSupabase) {
            if (typeof window !== 'undefined') {
                console.error('CRITICAL: Supabase keys are missing. Please check your Vercel Environment Variables.');
            }
            throw new Error('Supabase client not initialized. Check your configuration.');
        }
        return (realSupabase as any)[prop];
    }
};

export const supabase = new Proxy({}, proxyHandler) as ReturnType<typeof createClient>;

if (typeof window !== 'undefined' && !realSupabase) {
    console.error('--- SUPABASE CONFIGURATION ERROR ---');
    console.error('The application will not function correctly without NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('---');
}
