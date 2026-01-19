import { google } from 'googleapis';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const getRedirectUri = (host: string) => {
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/api/auth/google/callback`;
};

export const googleAuthClient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET
);

export const getGmailClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.gmail({ version: 'v1', auth });
};

export const getDriveClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.drive({ version: 'v3', auth });
};
