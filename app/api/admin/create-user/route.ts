import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password, name, roles } = await req.json();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        // 1. Create the user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, roles }
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. Insert into public.users table (or update if already exists from seed)
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authUser.user.id,
                email,
                name,
                roles,
                needs_password_reset: true
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            // Cleanup the auth user if DB fails
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, user: authUser.user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
