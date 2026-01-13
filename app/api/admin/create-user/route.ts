import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password, name, roles } = await req.json();

        // 1. Initialize Supabase with Service Role Key (Server-side only)
        // This allows creating users without signing them in
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Create the user in Supabase Auth
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

        // 3. Insert into public.users table (or update if already exists from seed)
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authUser.user.id,
                email,
                name,
                roles,
                needs_password_reset: false
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
