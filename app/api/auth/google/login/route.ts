import { getGoogleAuthClient, getRedirectUri } from '@/lib/google-api';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.readonly',
        'openid',
        'email'
    ];

    const host = req.headers.get('host') || 'localhost:3000';
    const REDIRECT_URI = getRedirectUri(host);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    console.log('Initiating OAuth with Dynamic REDIRECT_URI:', REDIRECT_URI, 'for userId:', userId);

    const authClient = getGoogleAuthClient();
    const authorizationUrl = authClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        redirect_uri: REDIRECT_URI,
        state: userId || undefined
    });

    return NextResponse.redirect(authorizationUrl);
}
