// TOTAL MOCK VERSION - NO IMPORTS FROM @SUPABASE/SUPABASE-JS

const mock = {
    auth: { admin: {} },
    from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({}) }) })
    })
} as any;

console.log('--- SUPABASE ADMIN LIB: RUNNING IN TOTAL MOCK MODE (NO IMPORTS) ---');

export const supabaseAdmin = mock;
