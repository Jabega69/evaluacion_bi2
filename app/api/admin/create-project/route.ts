import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, tutorId, studentNames, tribunalIds } = await req.json();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        console.log('[CreateProject] Starting for title:', title);

        // 1. Create the project
        const { data: project, error: pError } = await supabaseAdmin
            .from('projects')
            .insert({
                title,
                tutor_id: tutorId
            })
            .select()
            .single();

        if (pError || !project) {
            console.error('[CreateProject] Project Insert Error:', pError);
            return NextResponse.json({ error: pError?.message || 'Error creating project record' }, { status: 400 });
        }

        console.log('[CreateProject] Project created with ID:', project.id);

        // 2. Create the students
        const validStudents = studentNames.filter((name: string) => name.trim() !== '');
        if (validStudents.length > 0) {
            const studentsToInsert = validStudents.map((name: string) => ({
                name,
                project_id: project.id
            }));
            const { error: sError } = await supabaseAdmin.from('students').insert(studentsToInsert);
            if (sError) {
                console.error('Students Insert Error:', sError);
                // Rollback (delete project)
                await supabaseAdmin.from('projects').delete().eq('id', project.id);
                throw sError;
            }
        }

        // 3. Create tribunal assignments
        if (tribunalIds && tribunalIds.length > 0) {
            const tribunalAssignments = tribunalIds.map((userId: string) => ({
                project_id: project.id,
                user_id: userId
            }));
            const { error: tError } = await supabaseAdmin.from('project_tribunals').insert(tribunalAssignments);
            if (tError) {
                console.error('Tribunal Insert Error:', tError);
                // Rollback (delete project)
                await supabaseAdmin.from('projects').delete().eq('id', project.id);
                throw tError;
            }
        }

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        console.error('Internal API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
