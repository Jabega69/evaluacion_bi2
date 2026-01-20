import { googleAuthClient, getRedirectUri } from '@/lib/google-api';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // contain userId
    const host = req.headers.get('host') || 'localhost:3000';
    const REDIRECT_URI = getRedirectUri(host);

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        console.log('Google Auth Callback: Getting tokens...');
        const { tokens } = await googleAuthClient.getToken({
            code,
            redirect_uri: REDIRECT_URI
        });

        // Extraer email del id_token de Google
        let googleEmail = '';
        if (tokens.id_token) {
            try {
                const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString());
                googleEmail = payload.email;
                console.log('Google Auth Callback: Email from token:', googleEmail);
            } catch (e) {
                console.error('Error decoding id_token:', e);
            }
        }

        // 1. Intentar actualizar por EMAIL (es lo más fiable)
        if (googleEmail) {
            console.log('Google Auth Callback: Attempting update by email:', googleEmail);
            const { data: updatedByEmail, error: errorEmail } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('email', googleEmail)
                .select();

            if (!errorEmail && updatedByEmail && updatedByEmail.length > 0) {
                console.log('Google Auth Callback: Linked successfully by Email');
                return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
            }
        }

        // 2. Fallback: Intentar por ID (state)
        if (state) {
            console.log('Google Auth Callback: Attempting update by ID:', state);
            const { data: updatedById, error: errorId } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', state)
                .select();

            if (!errorId && updatedById && updatedById.length > 0) {
                console.log('Google Auth Callback: Linked successfully by ID');
                return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
            }
        }

        console.error('Google Auth Callback: No matching user found in "users" table for email:', googleEmail, 'or ID:', state);
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error&reason=not_found', req.url));

    } catch (error: any) {
        console.error('Google Auth Callback: CRITICAL ERROR:', error.message);
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error&reason=' + encodeURIComponent(error.message), req.url));
    }
}
