import { googleAuthClient, getGmailClient, getDriveClient } from '@/lib/google-api';
import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { projectId, fileId, fileName } = await req.json();

        // 1. Obtener los tokens del administrador (usamos supabaseAdmin para acceso total)
        const { data: admins, error: adminError } = await supabaseAdmin
            .from('users')
            .select('*')
            .not('google_tokens', 'is', null);

        if (adminError || !admins) {
            console.error('Admin lookup error:', adminError);
            return NextResponse.json({ error: 'Erro al buscar administradores' }, { status: 500 });
        }

        // Buscamos cualquier usuario que sea admin (en role o roles)
        const admin = admins.find((u: any) =>
            u.role === 'admin' || (u.roles && u.roles.includes('admin'))
        );

        if (!admin) {
            return NextResponse.json({ error: 'Administrador no vinculado con Google' }, { status: 400 });
        }

        console.log('Using Admin for distribution:', admin.name, '| Email:', admin.email);

        const tokens = admin.google_tokens;
        googleAuthClient.setCredentials(tokens);

        // 2. Refrescar el token si es necesario
        if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
            const { credentials } = await googleAuthClient.refreshAccessToken();
            await supabaseAdmin.from('users').update({ google_tokens: credentials }).eq('id', admin.id);
            googleAuthClient.setCredentials(credentials);
        }

        // 3. Obtener el proyecto y sus evaluadores
        const { data: project, error: pError } = await supabaseAdmin
            .from('projects')
            .select(`
                *,
                students (*),
                project_tribunals (
                    user:users(name, email)
                )
            `)
            .eq('id', projectId)
            .single();

        if (pError || !project) throw new Error('Proyecto no encontrado');

        const emails = project.project_tribunals.map((t: any) => t.user?.email).filter(Boolean);
        console.log('Sending to emails:', emails);

        if (emails.length === 0) {
            console.error('No emails found for project:', projectId);
            throw new Error('No hay evaluadores asignados con email');
        }

        // 4. Descargar el archivo de Drive para adjuntarlo
        console.log('Downloading file:', fileId);
        const drive = getDriveClient(googleAuthClient.credentials.access_token!);
        const fileResponse = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'arraybuffer' });

        const fileBuffer = Buffer.from(fileResponse.data as ArrayBuffer);
        console.log('File downloaded, size:', fileBuffer.length);

        // 5. Preparar el correo
        const gmail = getGmailClient(googleAuthClient.credentials.access_token!);
        const studentNames = project.students.map((s: any) => s.name).join(', ');
        const dateStr = project.presentation_date ? new Date(project.presentation_date).toLocaleString('es-ES') : 'Pendiente';

        const subject = `[Evaluación Proyectos] Documentación: ${project.title}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

        const body = `
Estimado/a miembro del tribunal,

Le informamos que se le ha asignado para la evaluación del proyecto de investigación titulado: "${project.title}".

Detalles del proyecto:
- Alumnos: ${studentNames}
- Exposición: ${dateStr}
- Ubicación: ${project.presentation_location || 'Pendiente'}

Se adjunta a este correo la memoria del proyecto para su revisión previa a la defensa.

Instrucciones de acceso:
1. Acceda a la aplicación en: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
2. Inicie sesión con su correo corporativo de @murciaeduca.es.
3. Utilice la contraseña provisional: 1234 (se recomienda cambiarla tras el primer acceso).

Atentamente,
${admin.name}
`.trim();

        const boundary = 'foo_bar_baz';
        const messageParts = [
            `To: ${emails.join(', ')}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 7bit',
            '',
            body,
            '',
            `--${boundary}`,
            `Content-Type: application/pdf; name="${fileName}"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="${fileName}"`,
            '',
            fileBuffer.toString('base64'),
            `--${boundary}--`
        ];

        const rawMessage = messageParts.join('\r\n');
        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        console.log('Final message length:', encodedMessage.length);

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log('Email sent successfully');

        // 6. Marcar como enviado (opcional, podríamos añadir una columna a projects)
        await supabaseAdmin.from('projects').update({ distributed_at: new Date().toISOString() }).eq('id', projectId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Distribution Error Details:', {
            message: error.message,
            stack: error.stack,
            projectId: error.projectId
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
