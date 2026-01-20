import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId, name, roles } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        // 1. Update Supabase Auth Metadata (if user exists in Auth)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { name, roles } }
        );

        if (authError) {
            console.warn('Auth Update Warning (User might not exist in Auth):', authError.message);
        }

        // 2. Update public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .update({ name, roles })
            .eq('id', userId);

        if (dbError) {
            console.error('DB Update Error:', dbError);
            return NextResponse.json({ error: `Error en Base de Datos: ${dbError.message}` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            authUpdated: !authError,
            message: authError ? 'Actualizado en BD (Auth saltado)' : 'Actualizado completamente'
        });
    } catch (error: any) {
        console.error('Catch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
