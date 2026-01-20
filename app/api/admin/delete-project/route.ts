import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Servicio de base de datos no configurado (Admin)' }, { status: 500 });
        }

        // 1. Delete related evaluations
        await supabaseAdmin.from('evaluations').delete().eq('project_id', projectId);

        // 2. Delete tribunal assignments
        await supabaseAdmin.from('project_tribunals').delete().eq('project_id', projectId);

        // 3. Delete students
        await supabaseAdmin.from('students').delete().eq('project_id', projectId);

        // 4. Finally delete the project
        const { error } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
