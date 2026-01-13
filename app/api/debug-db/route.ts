import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Try to query the list of tables via the default PostgREST proxy if information_schema is blocked
        const { data: tablesInfo, error: err } = await supabaseAdmin
            .from('projects')
            .select('id')
            .limit(1);

        // We know 'projects' exists. Let's try to see if we can get anything from 'project_tribunals'
        const { data: tribData, error: tribErr } = await supabaseAdmin
            .from('project_tribunals')
            .select('*')
            .limit(1);

        return NextResponse.json({
            projectsTableStatus: err ? err.message : 'OK',
            projectTribunalsStatus: tribErr ? tribErr.message : 'OK',
            tribData: tribData || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
