import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isServer = typeof window === 'undefined';

const isValid = (val: string): boolean => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null' || trimmed.length < 10) return false;
    return true;
};

let adminInstance: any = null;

if (isServer && isValid(url) && isValid(key)) {
    try {
        adminInstance = createClient(url, key);
    } catch (e: any) {
        console.error('[Supabase Admin] Init error:', e.message);
    }
}

const mockAdmin = {
    auth: {
        admin: {
            createUser: async () => ({ data: { user: null }, error: { message: 'Admin not configured' } }),
            deleteUser: async () => ({ error: { message: 'Admin not configured' } }),
            updateUserById: async () => ({ error: { message: 'Admin not configured' } }),
            listUsers: async () => ({ data: { users: [] }, error: null }),
        }
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: { message: 'Admin not configured' } }),
                limit: () => ({ data: [], error: null }),
            }),
            limit: () => ({ data: [], error: null }),
            order: () => ({ data: [], error: null }),
        }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ data: [], error: null }) }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
        upsert: () => ({ data: null, error: null }),
    })
} as any;

export const supabaseAdmin = adminInstance || mockAdmin;

if (isServer && !adminInstance) {
    console.warn('[Supabase Admin] No inicializado: Falta SUPABASE_SERVICE_ROLE_KEY.');
}
