-- MIGRACIÓN PARA CORREGIR EVALUACIONES DUPLICADAS
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Eliminar duplicados manteniendo solo el registro más reciente
-- Usamos una tabla temporal para identificar qué IDs quedarnos
WITH LatestEvaluations AS (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY project_id, student_id, grader_id, type 
                   ORDER BY submitted_at DESC, id DESC
               ) as row_num
        FROM evaluations
    ) t
    WHERE t.row_num = 1
)
DELETE FROM evaluations 
WHERE id NOT IN (SELECT id FROM LatestEvaluations);

-- 2. Añadir la restricción de unicidad para evitar futuros duplicados
-- Esto forzará que solo pueda existir una combinación de estos 4 campos
ALTER TABLE evaluations
ADD CONSTRAINT unique_evaluation_entry 
UNIQUE (project_id, student_id, grader_id, type);

-- NOTA: Si este comando falla, significa que todavía quedan duplicados. 
-- Asegúrate de que el paso 1 se ejecutó correctamente.
