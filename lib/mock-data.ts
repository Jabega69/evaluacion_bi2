import { Project, User, WrittenRubric, OralRubric, TutorRubric } from '@/types';

// USERS
export const MOCK_USERS: User[] = [
    { id: 'admin-1', name: 'Administrador Principal', email: 'admin@school.edu', role: 'admin' },
    { id: 'tutor-1', name: 'Dr. Roberto Tutor', email: 'tutor1@school.edu', role: 'tutor' },
    { id: 'tribunal-1', name: 'Prof. Ana Garcia', email: 'ana@school.edu', role: 'tribunal' },
    { id: 'tribunal-2', name: 'Prof. Carlos Ruiz', email: 'carlos@school.edu', role: 'tribunal' },
    { id: 'tribunal-3', name: 'Prof. Elena Diaz', email: 'elena@school.edu', role: 'tribunal' },
];

// PROJECTS
export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-001',
        title: 'Impacto de la Inteligencia Artificial en la Educación Secundaria',
        students: [
            { id: 's1', name: 'Juan Pérez' },
            { id: 's2', name: 'Maria López' }
        ],
        tribunalIds: ['tribunal-1', 'tribunal-2', 'tribunal-3'],
        tutorId: 'tutor-1'
    },
    {
        id: 'proj-002',
        title: 'Energías Renovables en Zonas Rurales',
        students: [
            { id: 's3', name: 'Pedro Gomez' }
        ],
        tribunalIds: ['tribunal-1', 'tribunal-2', 'tribunal-3'],
        tutorId: 'tutor-1'
    }
];

// RUBRICS
export const WRITTEN_RUBRIC: WrittenRubric = {
    contentItems: [
        { id: 'c1', label: 'Originalidad y Creatividad', maxScore: 10 },
        { id: 'c2', label: 'Justificación del tema', maxScore: 10 },
        { id: 'c3', label: 'Marco Teórico', maxScore: 10 },
        { id: 'c4', label: 'Objetivos e Hipótesis', maxScore: 10 },
        { id: 'c5', label: 'Metodología', maxScore: 10 },
        { id: 'c6', label: 'Análisis de Resultados', maxScore: 10 },
        { id: 'c7', label: 'Conclusiones', maxScore: 10 },
        { id: 'c8', label: 'Bibliografía (Calidad)', maxScore: 10 },
        { id: 'c9', label: 'Redacción y Ortografía', maxScore: 10 },
        { id: 'c10', label: 'Uso de vocabulario técnico', maxScore: 10 },
        { id: 'c11', label: 'Coherencia global', maxScore: 10 },
        { id: 'c12', label: 'Dificultad del trabajo', maxScore: 10 },
        { id: 'c13', label: 'Aportación personal', maxScore: 10 },
    ],
    formatItems: [
        { id: 'f1', label: 'Márgenes correctos (2.5cm)', maxScore: 1 },
        { id: 'f2', label: 'Tipografía (Times/Arial 12pt)', maxScore: 1 },
        { id: 'f3', label: 'Interlineado (1.5)', maxScore: 1 },
        { id: 'f4', label: 'Paginación correcta', maxScore: 1 },
        { id: 'f5', label: 'Índice bien estructura', maxScore: 1 },
        { id: 'f6', label: 'Citas según APA 7', maxScore: 1 },
    ]
};

export const ORAL_RUBRIC: OralRubric = {
    blocks: [
        { id: 'o1', label: 'Presentación (Claridad y Orden)', maxScore: 2 },
        { id: 'o2', label: 'Estructura (Introducción, Desarrollo, Conclusión)', maxScore: 3 },
        { id: 'o3', label: 'Capacidad Didáctica y Comunicación', maxScore: 2 },
        { id: 'o4', label: 'Calidad de Materiales de Apoyo', maxScore: 2 },
    ],
    timeRanges: [
        { min: 0, max: 10, score: 0.2, label: 'Muy corto (<10 min)' },
        { min: 10, max: 14, score: 0.5, label: 'Corto (10-14 min)' },
        { min: 14, max: 16, score: 1.0, label: 'Perfecto (14-16 min)' },
        { min: 16, max: 20, score: 0.5, label: 'Largo (16-20 min)' },
        { min: 20, max: 99, score: 0.0, label: 'Excesivo (>20 min)' },
    ]
};

export const TUTOR_RUBRIC: TutorRubric = {
    items: [
        { id: 't1', label: 'Asistencia y Puntualidad', maxScore: 2 },
        { id: 't2', label: 'Cumplimiento de Tareas', maxScore: 2 },
        { id: 't3', label: 'Autonomía e Iniciativa', maxScore: 2 },
        { id: 't4', label: 'Interés y Motivación', maxScore: 2 },
        { id: 't5', label: 'Superación de Dificultades', maxScore: 2 },
    ]
};
