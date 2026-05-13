-- GRANT explícitos requeridos por cambio de Supabase (mayo 2026)
-- El rol 'anon' no necesita acceso (toda la app requiere login)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.evaluations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_tribunals TO authenticated;

GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.projects TO service_role;
GRANT ALL ON TABLE public.students TO service_role;
GRANT ALL ON TABLE public.evaluations TO service_role;
GRANT ALL ON TABLE public.project_tribunals TO service_role;
