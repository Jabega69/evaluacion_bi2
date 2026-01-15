import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Cleanup references to avoid Foreign Key violations

        // Remove from project_tribunals (Many-to-Many)
        // (Though schema has ON DELETE CASCADE, let's be safe or just rely on it)
        await supabaseAdmin.from('project_tribunals').delete().eq('user_id', userId);

        // Set tutor_id to null in projects where this user is the tutor
        await supabaseAdmin.from('projects').update({ tutor_id: null }).eq('tutor_id', userId);

        // Delete evaluations made by this user
        await supabaseAdmin.from('evaluations').delete().eq('grader_id', userId);

        // 2. Delete from Auth (This will also trigger any "ON DELETE CASCADE" in the DB if configured)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Auth Delete Error:', authError);
            // If user not found in auth, we still try to delete from public table
            if (authError.status !== 404) {
                // Return descriptive error
                return NextResponse.json({
                    error: `Error en Auth: ${authError.message}. Tal vez el usuario no existe o ya fue borrado.`
                }, { status: 400 });
            }
        }

        // 3. Delete from public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('DB Delete Error:', dbError);
            return NextResponse.json({ error: `Error en Base de Datos: ${dbError.message}` }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Catch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
