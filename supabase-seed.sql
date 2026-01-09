-- Insertar Usuarios Iniciales
INSERT INTO users (name, email, role) VALUES 
('Administrador Principal', 'admin@ejemplo.com', 'admin'),
('Dr. Roberto Tutor', 'tutor@ejemplo.com', 'tutor'),
('Prof. Ana García', 'ana@ejemplo.com', 'tribunal'),
('Prof. Carlos Ruiz', 'carlos@ejemplo.com', 'tribunal'),
('Prof. Elena Díaz', 'elena@ejemplo.com', 'tribunal');

-- Insertar Proyectos de Prueba (Necesitaremos los IDs de los usuarios insertados arriba, 
-- pero para simplificar insertaremos proyectos genéricos)
-- Nota: En Supabase real, los IDs son UUIDs. 

-- Ejemplo de inserción de un proyecto manual si conoces el ID del tutor:
-- INSERT INTO projects (title, tutor_id) VALUES ('IA en Medicina', 'ID_DEL_TUTOR_AQUI');
