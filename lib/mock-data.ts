import { Project, User, WrittenRubric, OralRubric, TutorRubric } from '@/types';

// USERS
export const MOCK_USERS: User[] = [
    { id: 'admin-1', name: 'Administrador Principal', email: 'admin@school.edu', roles: ['admin'] },
    { id: 'tutor-1', name: 'Dr. Roberto Tutor', email: 'tutor1@school.edu', roles: ['tutor'] },
    { id: 'tribunal-1', name: 'Prof. Ana Garcia', email: 'ana@school.edu', roles: ['tribunal'] },
    { id: 'tribunal-2', name: 'Prof. Carlos Ruiz', email: 'carlos@school.edu', roles: ['tribunal'] },
    { id: 'tribunal-3', name: 'Prof. Elena Diaz', email: 'elena@school.edu', roles: ['tribunal'] },
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
        {
            id: 'c1',
            label: 'Originalidad y Creatividad',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No se muestran ideas originales. El desarrollo es muy simple.' },
                { range: '3-4', description: 'No se muestran ideas originales. El desarrollo presenta cierta complejidad.' },
                { range: '5-7', description: 'Se muestra, al menos, una idea original. El desarrollo presenta cierta complejidad.' },
                { range: '8-9', description: 'Se muestran algunas ideas originales. El desarrollo presenta complejidad.' },
                { range: '10', description: 'El trabajo muestra gran cantidad de ideas originales con un desarrollo complejo.' }
            ]
        },
        {
            id: 'c2',
            label: 'Justificación del tema',
            maxScore: 10,
            levels: [
                { range: '1-3', description: 'La justificación es pobre o inexistente.' },
                { range: '4-6', description: 'Se justifica de forma aceptable pero sin profundidad.' },
                { range: '7-9', description: 'Buena justificación relacionada con el contexto actual.' },
                { range: '10', description: 'Justificación excepcional, clara y muy bien fundamentada.' }
            ]
        },
        {
            id: 'c3',
            label: 'Marco Teórico',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No se tienen en cuenta los conocimientos previos sobre el tema.' },
                { range: '3-4', description: 'Ha tenido en cuenta una fuente de conocimiento solo para nombrarla.' },
                { range: '5-7', description: 'Se tiene en cuenta una fuente previa y se usa en el desarrollo.' },
                { range: '8-9', description: 'Se manejan varias fuentes de conocimiento con buen uso.' },
                { range: '10', description: 'Se manejan múltiples fuentes de conocimiento usadas de forma experta.' }
            ]
        },
        {
            id: 'c4',
            label: 'Objetivos e Hipótesis',
            maxScore: 10,
            levels: [
                { range: '1-3', description: 'Objetivos vagos o mal planteados.' },
                { range: '4-6', description: 'Objetivos aceptables pero la hipótesis es poco clara.' },
                { range: '7-9', description: 'Objetivos e hipótesis bien definidos y medibles.' },
                { range: '10', description: 'Planteamiento impecable, escala y relevancia perfectas.' }
            ]
        },
        {
            id: 'c5',
            label: 'Metodología',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'Técnicas no relacionadas con los objetivos, no ayudan a conclusiones.' },
                { range: '3-4', description: 'Técnicas relacionadas con un objetivo pero no ayudan a conclusiones.' },
                { range: '5-7', description: 'Relacionadas con un objetivo y ayudan a sacar conclusiones.' },
                { range: '8-9', description: 'Relacionadas con más de un objetivo y ayudan a conclusiones.' },
                { range: '10', description: 'Relacionadas con todos los objetivos y fundamentales para conclusiones.' }
            ]
        },
        { id: 'c6', label: 'Análisis de Resultados', maxScore: 10 },
        { id: 'c7', label: 'Conclusiones', maxScore: 10 },
        { id: 'c8', label: 'Bibliografía (Calidad)', maxScore: 10 },
        { id: 'c9', label: 'Redacción y Ortografía', maxScore: 10 },
        { id: 'c10', label: 'Uso de vocabulario técnico', maxScore: 10 },
        { id: 'c11', label: 'Coherencia global', maxScore: 10 },
        {
            id: 'c12',
            label: 'Dificultad del trabajo',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No utiliza las nuevas tecnologías en su investigación.' },
                { range: '3-4', description: 'Usa las nuevas tecnologías de manera esporádica.' },
                { range: '5-7', description: 'Usa las nuevas tecnologías en su investigación regularmente.' },
                { range: '8-9', description: 'Usa las nuevas tecnologías frecuentemente.' },
                { range: '10', description: 'Uso innovador y original de nuevas tecnologías.' }
            ]
        },
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
