import { googleAuthClient, getRedirectUri } from '@/lib/google-api';
import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const host = req.headers.get('host') || 'localhost:3000';
    const REDIRECT_URI = getRedirectUri(host);

    console.log('--- GOOGLE CALLBACK DEBUG START ---');
    console.log('Host:', host);
    console.log('State (userId):', state);

    if (!code) {
        console.error('No code in callback');
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error&reason=no_code', req.url));
    }

    try {
        console.log('Exchanging code for tokens...');
        const { tokens } = await googleAuthClient.getToken({
            code,
            redirect_uri: REDIRECT_URI
        });
        console.log('Tokens received successfully');

        // Extraer email para el fallback
        let googleEmail = '';
        if (tokens.id_token) {
            const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString());
            googleEmail = payload.email;
            console.log('Email from Google:', googleEmail);
        }

        let updateSuccess = false;

        // 1. Intentar por Email (Prioritario porque es lo que Google garantiza)
        if (googleEmail) {
            console.log('Updating by email...');
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('email', googleEmail)
                .select();

            if (!error && data && data.length > 0) {
                console.log('Success: Linked by email');
                updateSuccess = true;
            } else if (error) {
                console.error('DB Error updating by email:', error);
            }
        }

        // 2. Intentar por ID (State) si el email falló
        if (!updateSuccess && state) {
            console.log('Updating by ID...');
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', state)
                .select();

            if (!error && data && data.length > 0) {
                console.log('Success: Linked by ID');
                updateSuccess = true;
            } else if (error) {
                console.error('DB Error updating by ID:', error);
            }
        }

        if (updateSuccess) {
            console.log('Link complete, redirecting to success...');
            return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
        }

        console.error('Could not find user to link tokens. Email:', googleEmail, '| ID:', state);
        return NextResponse.redirect(new URL(`/dashboard/admin/distribution?google=error&reason=user_not_found&email=${encodeURIComponent(googleEmail)}`, req.url));

    } catch (error: any) {
        console.error('FATAL Error in Google Callback:', error.message);
        return NextResponse.redirect(new URL(`/dashboard/admin/distribution?google=error&reason=exception&msg=${encodeURIComponent(error.message)}`, req.url));
    }
}
