// TOTAL MOCK VERSION - NO IMPORTS FROM @SUPABASE/SUPABASE-JS
// This is a diagnostic version to see if the crash persists without the library call.

const mock = {
    auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase is in Diagnostic Mock Mode' } }),
        signOut: async () => { },
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                order: () => ({ data: [], error: null }),
            }),
            order: () => ({ data: [], error: null }),
            then: (cb: any) => cb({ data: [], error: null }),
        }),
    })
} as any;

console.log('--- SUPABASE LIB: RUNNING IN TOTAL MOCK MODE (NO IMPORTS) ---');

export const supabase = mock;
