import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isValid = (key: string) => key && key.length > 10 && key !== 'undefined';

const realAdmin = (typeof window === 'undefined' && isValid(supabaseUrl) && isValid(supabaseServiceKey))
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const proxyHandler = {
    get: (target: any, prop: string) => {
        if (!realAdmin) {
            const msg = typeof window !== 'undefined'
                ? 'Forbidden: Admin client called on browser'
                : 'Admin client not initialized (check service role key)';
            throw new Error(msg);
        }
        return (realAdmin as any)[prop];
    }
};

export const supabaseAdmin = new Proxy({}, proxyHandler) as ReturnType<typeof createClient>;

if (typeof window === 'undefined' && !realAdmin) {
    console.warn('--- SUPABASE ADMIN NOT INITIALIZED ---');
    console.warn('Check SUPABASE_SERVICE_ROLE_KEY if you are on the server.');
    console.warn('---');
}
