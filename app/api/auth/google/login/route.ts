import { googleAuthClient } from '@/lib/google-api';
import { NextResponse } from 'next/server';

export async function GET() {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.readonly'
    ];

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

    const authorizationUrl = googleAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        redirect_uri: REDIRECT_URI
    });

    return NextResponse.redirect(authorizationUrl);
}
