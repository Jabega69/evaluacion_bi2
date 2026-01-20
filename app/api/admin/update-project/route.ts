import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { projectId, title, tutorId, tribunalIds } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        // 1. Update project title and tutor
        const { error: pError } = await supabaseAdmin
            .from('projects')
            .update({
                title,
                tutor_id: tutorId
            })
            .eq('id', projectId);

        if (pError) throw pError;

        // 2. Update tribunals (Delete old ones and add new ones)
        const { error: dError } = await supabaseAdmin
            .from('project_tribunals')
            .delete()
            .eq('project_id', projectId);

        if (dError) throw dError;

        if (tribunalIds && tribunalIds.length > 0) {
            const tribunalAssignments = tribunalIds.map((userId: string) => ({
                project_id: projectId,
                user_id: userId
            }));
            const { error: iError } = await supabaseAdmin.from('project_tribunals').insert(tribunalAssignments);
            if (iError) throw iError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
