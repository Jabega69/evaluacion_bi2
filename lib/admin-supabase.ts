import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isValid = (key: any) => {
    if (typeof key !== 'string') return false;
    const k = key.trim();
    return k.length > 20 && k !== 'undefined' && k !== 'null';
};

let _realAdmin: any = null;

const getAdmin = () => {
    if (_realAdmin) return _realAdmin;

    const isServer = typeof window === 'undefined';
    if (isServer && isValid(supabaseUrl) && isValid(supabaseServiceKey)) {
        try {
            console.log('[Supabase Admin] Initializing server-side client...');
            _realAdmin = createClient(supabaseUrl, supabaseServiceKey);
            return _realAdmin;
        } catch (e: any) {
            console.error('[Supabase Admin Init Error]:', e.message);
        }
    }
    return null;
};

export const supabaseAdmin = new Proxy({}, {
    get: (target, prop) => {
        const client = getAdmin();
        if (!client) {
            const isServer = typeof window === 'undefined';
            const msg = isServer
                ? 'Supabase Admin Error: SUPABASE_SERVICE_ROLE_KEY is missing or invalid on the server.'
                : 'Security Error: You are trying to use the Supabase Admin client on the browser. This is strictly forbidden.';
            throw new Error(msg);
        }
        return client[prop];
    }
}) as ReturnType<typeof createClient>;
