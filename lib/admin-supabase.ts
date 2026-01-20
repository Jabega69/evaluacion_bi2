import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isServer = typeof window === 'undefined';
const isConfigured = isServer &&
    supabaseUrl &&
    supabaseServiceKey &&
    supabaseUrl !== 'undefined' &&
    supabaseServiceKey !== 'undefined';

export const supabaseAdmin = isConfigured
    ? createClient(supabaseUrl, supabaseServiceKey)
    : ({
        auth: {
            admin: {
                createUser: async () => ({ data: { user: null }, error: { message: 'Admin client not configured' } }),
                deleteUser: async () => ({ error: { message: 'Admin client not configured' } }),
                updateUserById: async () => ({ error: { message: 'Admin client not configured' } }),
            }
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { message: 'Admin client not configured' } }),
                    limit: () => ({ data: [], error: null }),
                }),
                limit: () => ({ data: [], error: null }),
                order: () => ({ data: [], error: null }),
            }),
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: null, error: null })
                })
            }),
            update: () => ({
                eq: () => ({
                    select: () => ({ data: [], error: null })
                })
            }),
            delete: () => ({
                eq: () => ({ data: null, error: null })
            }),
            upsert: () => ({ data: null, error: null }),
        })
    } as any);

if (isServer && !isConfigured) {
    console.warn('Supabase Admin: Not initialized (Server-side) - check SUPABASE_SERVICE_ROLE_KEY');
}
