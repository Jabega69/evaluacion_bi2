import { googleAuthClient, getRedirectUri } from '@/lib/google-api';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const host = req.headers.get('host') || 'localhost:3000';
    const REDIRECT_URI = getRedirectUri(host);

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const { tokens } = await googleAuthClient.getToken({
            code,
            redirect_uri: REDIRECT_URI
        });

        const state = searchParams.get('state');
        console.log('Google Auth Callback - State (UserId):', state);

        if (state) {
            // Usamos supabaseAdmin para ignorar RLS y asegurar la actualización
            const { error } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', state);

            if (error) {
                console.error('Error updating user tokens:', error);
                throw error;
            }
            console.log('Successfully linked Google tokens for user:', state);
        } else {
            console.warn('Google Auth Callback: No state (userId) provided. Tokens not saved.');
        }

        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error', req.url));
    }
}
