-- FIX: Enable RLS and add basic policies to address security lints

-- 1. Enable RLS on all tables
-- The 'users' table already has policies defined (according to the report), so we just enable RLS.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- For other tables, we enable RLS and add a permissive policy for authenticated users
-- to ensure the application continues to function for logged-in users.

-- 2. projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- Check if policy exists before creating to avoid errors if re-run (good practice, though SQL doesn't support IF NOT EXISTS for policies easily in all versions, we assume it's fresh or use DO block if needed. For simplicity in dashboard, simple CREATE is fine, usually users know to run once).
CREATE POLICY "Authenticated users can access projects" ON projects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access students" ON students
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. evaluations table
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access evaluations" ON evaluations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. project_tribunals table
ALTER TABLE project_tribunals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access project_tribunals" ON project_tribunals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
