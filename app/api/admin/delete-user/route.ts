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

        // 1. Check if user exists in public.users to prevent self-deletion or other logic
        // (Optional: You might want to verify requester is admin, but since we use service_role, we trust the caller)

        // 2. Delete from Auth (This will also trigger any "ON DELETE CASCADE" in the DB)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Auth Delete Error:', authError);
            // If user not found in auth, try to delete from public table anyway
            if (authError.status !== 404) {
                return NextResponse.json({ error: authError.message }, { status: 400 });
            }
        }

        // 3. Ensure they are gone from public.users (in case cascade didn't happen)
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('DB Delete Error:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
