import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin client not initialized' }, { status: 500 });
        }

        const { data: users, error: uError } = await supabaseAdmin.from('users').select('count');
        const { data: projects, error: pError } = await supabaseAdmin.from('projects').select('count');

        return NextResponse.json({
            users_count: users,
            projects_count: projects,
            errors: { uError, pError }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
