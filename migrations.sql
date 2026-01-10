-- MIGRACIÓN PARA CALENDARIO DE EXPOSICIONES
-- Ejecuta esto en el Editor SQL de tu panel de Supabase

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS presentation_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS presentation_location TEXT;

-- Opcional: Crear un usuario admin inicial si no tienes ninguno (ajusta el email)
-- INSERT INTO users (name, email, role) VALUES ('Admin Principal', 'admin@ejemplo.com', 'admin');
