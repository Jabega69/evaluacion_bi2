import { googleAuthClient } from '@/lib/google-api';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Podríamos usar esto para seguridad adicional

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const { tokens } = await googleAuthClient.getToken(code);

        // Guardamos los tokens en el usuario administrador actual
        // Para simplificar, asumimos que el admin que hace esto es el único que distribuye
        // En una app multi-admin, guardaríamos esto por userId.

        // Obtenemos el usuario de la sesión (aquí simplificado, en producción usaríamos auth de supabase)
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', user.id);

            if (error) throw error;
        }

        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${APP_URL}/dashboard/admin?google=success`);
    } catch (error: any) {
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(`${APP_URL}/dashboard/admin?google=error`);
    }
}
