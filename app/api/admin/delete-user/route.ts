import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        // 1. Delete from public.users table (cascading might handle related data)
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('DB Delete Error:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        // 2. Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.warn('Auth Delete Warning (User might not exist in Auth):', authError.message);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
