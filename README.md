# Sistema de Gestión y Calificación de Proyectos de Investigación

Aplicación web diseñada para la gestión integral de tribunales, tutorías y evaluaciones de proyectos de investigación, con integración nativa en Google Sheets y generación de informes individuales anonimizados.

## 1. Roles y Permisos
- **Administrador (Root)**: Gestión de usuarios, configuración de tribunales (3 profesores), asignación de proyectos/alumnos y calendario.
- **Profesor Calificador**: Evaluación de la parte escrita y oral de los grupos asignados.
- **Profesor Tutor**: Evaluación del proceso y actitud de sus alumnos tutorizados.

## 2. Modelo de Evaluación y Pesos
La nota final se calcula sobre una base de 10 puntos con la siguiente ponderación:

| Bloque | Responsable | Peso | Detalle de Cálculo |
| :--- | :--- | :--- | :--- |
| **Parte Escrita** | Tribunal (x3) | 50% | Contenido (0-9 pts) + Formato (0-1 pt). Media de los 3 profesores. |
| **Parte Oral** | Tribunal (x3) | 30% | Rúbrica de 5 bloques + Ajuste por tiempo. Media de los 3 profesores. |
| **Tutoría** | Tutor | 20% | Evaluación actitudinal de 5 ítems (0-10 pts). |

## 3. Especificaciones de los Ítems (Fuentes de Datos)

### A. Evaluación Escrita
- **Contenido (0-9 pts)**: 13 ítems evaluados de 0 a 10 (normalizados posteriormente). Incluye creatividad, marco teórico, metodología y conclusiones.
- **Formato (0-1 pt)**: 6 ítems tipo Check (SÍ/NO) basados en normas APA 7 (márgenes, paginación, índice, citas).

### B. Evaluación Oral (Anexo II)
- **Bloques**: Presentación (2p), Estructura (3p), Capacidad Didáctica (2p), Materiales de Apoyo (2p).
- **Adecuación al Tiempo (1p)**: Basado en una tabla de rangos (ej. 14:00-16:00 = puntuación máxima).

### C. Evaluación del Tutor (Anexo III)
- 5 ítems de 0 a 2 puntos: Asistencia, Cumplimiento de tareas, Autonomía, Interés y Superación de dificultades.

## 4. Requisitos Funcionales Críticos
1. **Anonimato**: Los informes generados para el alumno deben mostrar las medias y comentarios del tribunal sin identificar qué profesor otorgó cada nota.
2. **Dinamicidad**: Los ítems de evaluación se consumen directamente desde una Google Sheet para permitir cambios sin modificar el código.
3. **Persistencia**: Sincronización con base de datos SQL o Firebase integrada con el historial de GitHub.

## 5. Stack Tecnológico Sugerido (IDX)
- **Frontend**: React.js / Next.js.
- **Backend**: Node.js (con Google APIs para Sheets y Drive).
- **Despliegue**: Google Cloud / Vercel.
- **ID**: Google IDX con asistencia de IA (Gemini).
