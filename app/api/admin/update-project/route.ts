import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { projectId, title, tutorId, studentNames, tribunalIds } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Update project title and tutor
        const { error: pError } = await supabaseAdmin
            .from('projects')
            .update({
                title,
                tutor_id: tutorId
            })
            .eq('id', projectId);

        if (pError) throw pError;

        // 2. Update students (Simplest: delete all and re-insert)
        const { error: sDelError } = await supabaseAdmin
            .from('students')
            .delete()
            .eq('project_id', projectId);

        if (sDelError) throw sDelError;

        const studentsToInsert = studentNames
            .filter((name: string) => name.trim() !== '')
            .map((name: string) => ({
                name,
                project_id: projectId
            }));

        if (studentsToInsert.length > 0) {
            const { error: sInsError } = await supabaseAdmin
                .from('students')
                .insert(studentsToInsert);
            if (sInsError) throw sInsError;
        }

        // 3. Update tribunals (Simplest: delete all and re-insert)
        const { error: tDelError } = await supabaseAdmin
            .from('project_tribunals')
            .delete()
            .eq('project_id', projectId);

        if (tDelError) throw tDelError;

        const tribunalAssignments = tribunalIds.map((userId: string) => ({
            project_id: projectId,
            user_id: userId
        }));

        if (tribunalAssignments.length > 0) {
            const { error: tInsError } = await supabaseAdmin
                .from('project_tribunals')
                .insert(tribunalAssignments);
            if (tInsError) throw tInsError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update Project API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
