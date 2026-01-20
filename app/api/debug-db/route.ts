import { supabaseAdmin } from '@/lib/admin-supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin client not initialized' }, { status: 500 });
        }

        const { data: users, error: uError } = await supabaseAdmin.from('users').select('name').limit(1);
        const { data: projects, error: pError } = await supabaseAdmin.from('projects').select('title, distributed_at').limit(1);

        return NextResponse.json({
            users_sample: users,
            projects_sample: projects,
            errors: { uError, pError }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
