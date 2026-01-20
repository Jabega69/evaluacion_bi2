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

        // 1. Intento por ID (state)
        if (state) {
            console.log('Google Auth: Attempting update by ID:', state);
            const { error, count } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', state)
                .select();

            if (!error && count && count > 0) {
                console.log('Google Auth: Linked by ID successfully');
                return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
            }
            if (error) console.error('Google Auth: ID update error:', error);
        }

        // 2. Fallback por Email (decodificando id_token)
        if (tokens.id_token) {
            try {
                const payloadBase64 = tokens.id_token.split('.')[1];
                const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
                const decodedToken = JSON.parse(payloadJson);
                const email = decodedToken.email;

                if (email) {
                    console.log('Google Auth: Attempting fallback by Email:', email);
                    const { error, count } = await supabaseAdmin
                        .from('users')
                        .update({ google_tokens: tokens })
                        .eq('email', email)
                        .select();

                    if (!error && count && count > 0) {
                        console.log('Google Auth: Linked by Email successfully');
                        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
                    }
                }
            } catch (e) {
                console.error('Google Auth: Error decoding id_token:', e);
            }
        }

        console.error('Google Auth: Failed to link account - No matching user found');
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error', req.url));
    } catch (error: any) {
        console.error('Google Auth: Critical Error:', error);
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error', req.url));
    }
}
