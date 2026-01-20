import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This should ONLY be used on the server
export const supabaseAdmin = (typeof window === 'undefined' && supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null as any;

if (typeof window === 'undefined' && (!supabaseUrl || !supabaseServiceKey)) {
    console.error('SERVER ERROR: Missing Supabase Admin credentials');
}
