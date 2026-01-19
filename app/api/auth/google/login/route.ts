import { googleAuthClient } from '@/lib/google-api';
import { NextResponse } from 'next/server';

export async function GET() {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    const authorizationUrl = googleAuthClient.generateAuthUrl({
        access_type: 'offline', // Para obtener refresh token
        scope: scopes,
        prompt: 'consent' // Obligar a mostrar el consentimiento para asegurar el refresh token
    });

    return NextResponse.redirect(authorizationUrl);
}
