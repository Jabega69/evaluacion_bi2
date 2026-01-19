import { googleAuthClient, getRedirectUri } from '@/lib/google-api';
import { supabase } from '@/lib/supabase';
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

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('users')
                .update({ google_tokens: tokens })
                .eq('id', user.id);

            if (error) throw error;
        }

        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=success', req.url));
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(new URL('/dashboard/admin/distribution?google=error', req.url));
    }
}
