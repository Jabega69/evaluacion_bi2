import { googleAuthClient, getRedirectUri } from '@/lib/google-api';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.readonly'
    ];

    const host = req.headers.get('host') || 'localhost:3000';
    const REDIRECT_URI = getRedirectUri(host);

    console.log('Initiating OAuth with Dynamic REDIRECT_URI:', REDIRECT_URI);

    const authorizationUrl = googleAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        redirect_uri: REDIRECT_URI
    });

    return NextResponse.redirect(authorizationUrl);
}
