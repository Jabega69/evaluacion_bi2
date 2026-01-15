import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId, name, roles } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Update Supabase Auth Metadata (to keep it in sync for JWT)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { name, roles } }
        );

        if (authError) {
            console.error('Auth Update Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. Update public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .update({ name, roles })
            .eq('id', userId);

        if (dbError) {
            console.error('DB Update Error:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Catch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
