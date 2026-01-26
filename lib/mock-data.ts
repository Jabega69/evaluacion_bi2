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
            label: 'Creatividad y complejidad en el diseño experimental',
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
            label: 'Aplicación de conocimientos teóricos en las investigaciones',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No se tienen en cuenta los conocimientos previos sobre el tema en el desarrollo de la investigación.' },
                { range: '3-4', description: 'Ha tenido en cuenta una fuente de conocimiento, sólo para nombrarla, pero no se usa en el desarrollo de la investigación.' },
                { range: '5-7', description: 'Se tiene en cuenta una fuente de conocimiento previa y, además, la usa en el desarrollo de la investigación.' },
                { range: '8-9', description: 'Se manejan varias fuentes de conocimiento, pero sólo se usa una en el desarrollo de la investigación.' },
                { range: '10', description: 'Se manejan varias fuentes de conocimiento y se usan todas en el desarrollo de la investigación.' }
            ]
        },
        {
            id: 'c3',
            label: 'Utilización y manejo de nuevas tecnologías',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No utiliza las nuevas tecnologías en su investigación.' },
                { range: '3-4', description: 'Usa las nuevas tecnologías de manera esporádica en su investigación.' },
                { range: '5-7', description: 'Usa las nuevas tecnologías en su investigación.' },
                { range: '8-9', description: 'Usa las nuevas tecnologías frecuentemente en su investigación.' },
                { range: '10', description: 'Usa las nuevas tecnologías frecuentemente en su investigación de manera innovadora y original.' }
            ]
        },
        {
            id: 'c4',
            label: 'Manejo de las distintas técnicas de investigación',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'Las técnicas de investigación usadas no se relacionan con los objetivos del proyecto y no ayudan a la extracción de conclusiones.' },
                { range: '3-4', description: 'Las técnicas de investigación usadas se relacionan con, al menos, un objetivo del proyecto, pero, no ayudan a la extracción de conclusiones.' },
                { range: '5-7', description: 'Las técnicas de investigación usadas se relacionan con, al menos, un objetivo del proyecto y, además, ayudan a la extracción de conclusiones.' },
                { range: '8-9', description: 'Las técnicas de investigación usadas se relacionan con más de un objetivo del proyecto y, además, ayudan a la extracción de conclusiones.' },
                { range: '10', description: 'Las técnicas de investigación usadas se relacionan con todos los objetivos del proyecto y, además, ayudan a la extracción de conclusiones.' }
            ]
        },
        {
            id: 'c5',
            label: 'Marco Teórico',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No cuenta con información obtenida de ninguna fuente que guie el proyecto.' },
                { range: '3-4', description: 'Cuenta con información obtenida de una sola fuente que guía el proyecto.' },
                { range: '5-7', description: 'Cuenta con información obtenida de, al menos, dos fuentes que fundamentan y guían el proyecto.' },
                { range: '8-9', description: 'Cuenta con información obtenida de, al menos, tres fuentes distintas que fundamentan y guían el proyecto.' },
                { range: '10', description: 'Cuenta con información obtenida de más de tres fuentes distintas que fundamentan y guían el proyecto.' }
            ]
        },
        {
            id: 'c6',
            label: 'Contextualización y justificación del trabajo',
            maxScore: 10,
            levels: [
                { range: '1-3', description: 'No contextualiza el proyecto.' },
                { range: '3-5', description: 'Se omiten las razones por las que se hace el proyecto y la importancia del mismo.' },
                { range: '6-7', description: 'Se explican las razones por las que se hace el proyecto limitadamente.' },
                { range: '7-9', description: 'Se explican las razones por las que se hace el proyecto sin resaltar su importancia.' },
                { range: '10', description: 'Se explican las razones por las que se hace el proyecto y la importancia del mismo.' }
            ]
        },
        {
            id: 'c7',
            label: 'Metodología',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No se define el tipo de metodología usada, la planificación y estructura del proceso de investigación está deficientemente planteada.' },
                { range: '3-4', description: 'O bien, no se define suficientemente el tipo de metodología usada, o bien la planificación y estructura del proceso de investigación está insuficientemente planteada.' },
                { range: '5-7', description: 'Se planifica y estructura el proceso de investigación en consonancia con los objetivos propuestos, pero la definición de la metodología utilizada es insuficiente.' },
                { range: '8-9', description: 'Se planifica y estructura el proceso de investigación en consonancia con los objetivos propuestos, pero la definición de la metodología utilizada es suficiente.' },
                { range: '10', description: 'Se define y justifica claramente el tipo de metodología aplicada. Además, se planifica y estructura el proceso de investigación en consonancia con los objetivos propuestos haciendo mención explícita a los instrumentos usados para la toma y procesamiento de datos.' }
            ]
        },
        {
            id: 'c8',
            label: 'Extracción lógica y coherente de conclusiones a partir de los datos obtenidos',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No aporta conclusiones sobre el trabajo.' },
                { range: '3-4', description: 'Los resultados y las conclusiones no son coherentes con los objetivos planteados.' },
                { range: '5-7', description: 'Se presentan algunos resultados y conclusiones acordes con algún objetivo, aunque resulta incompleto.' },
                { range: '8-9', description: 'Se presentan algunos resultados y conclusiones acordes con todos los objetivos, aunque resulta incompleto.' },
                { range: '10', description: 'Los resultados dan cuenta de los objetivos presentados y son totalmente coherentes con el desarrollo de la investigación.' }
            ]
        },
        {
            id: 'c9',
            label: 'Capacidad de autocrítica y reconocimiento de limitaciones',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No hay autocritica ni referencia a las limitaciones de su trabajo.' },
                { range: '3-4', description: 'Menciona alguna limitación encontrada a la hora de realizar el trabajo sin hacer autocrítica.' },
                { range: '5-7', description: 'Menciona alguna limitación encontrada a la hora de realizar el trabajo y, además, apunta algún aspecto en el que se podría mejorar.' },
                { range: '8-9', description: 'Menciona las limitaciones de su trabajo y los aspectos en los que se podría mejorar.' },
                { range: '10', description: 'Menciona las limitaciones de su trabajo y señala, partiendo de los puntos a mejorar, futuras líneas de investigación sobre el tema propuesto.' }
            ]
        },
        {
            id: 'c10',
            label: 'Claridad en la formulación de los objetivos y las conclusiones',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'Los objetivos no son precisos ni se relacionan con las conclusiones.' },
                { range: '3-4', description: 'Se plantea, al menos, un objetivo general, pero de forma poco precisa y no se relaciona con las conclusiones.' },
                { range: '5-7', description: 'Se plantean varios objetivos, pero no se relacionan con las conclusiones.' },
                { range: '8-9', description: 'Los objetivos son planteados de manera precisa y se relacionan con algunas conclusiones.' },
                { range: '10', description: 'Los objetivos son planteados de manera precisa y se relacionan con las conclusiones.' }
            ]
        },
        {
            id: 'c11',
            label: 'Lenguaje técnico',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'Carencia total del uso de tecnicismos.' },
                { range: '3-4', description: 'Usa muy pocos tecnicismos.' },
                { range: '5-7', description: 'Usa algún tecnicismo.' },
                { range: '8-9', description: 'El uso de tecnicismos es frecuente.' },
                { range: '10', description: 'Se usa un lenguaje técnico muy rico.' }
            ]
        },
        {
            id: 'c12',
            label: 'Expresión escrita y lenguaje formal',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'Mala expresión escrita. No usa bien los signos de puntuación. Presenta más de 10 faltas de ortografía.' },
                { range: '3-4', description: 'Hay fallos frecuentes de expresión escrita. Se detectan fallos poco frecuentes en el uso de signos de puntuación. Presenta más de 6 faltas de ortografía.' },
                { range: '5-7', description: 'Hay fallos poco frecuentes en la expresión escrita. Usa por lo general bien los signos de puntuación. Hay menos de 5 faltas de ortografía.' },
                { range: '8-9', description: 'No hay fallos de expresión escrita. Usa por lo general bien los signos de puntuación. Hay menos de 3 faltas de ortografía.' },
                { range: '10', description: 'No hay fallos de expresión escrita. Usa bien los signos de puntuación y no aparecen faltas de ortografía.' }
            ]
        },
        {
            id: 'c13',
            label: 'Citas y referencias bibliográficas',
            maxScore: 10,
            levels: [
                { range: '1-2', description: 'No cita y no aporta referencias bibliográficas.' },
                { range: '3-4', description: 'Usa dos citas en el trabajo. Las referencias bibliográficas aparecen desordenadas y no aparecen citadas.' },
                { range: '5-7', description: 'Usa tres citas de distintas referencias bibliográficas. Además, estas están ordenadas por orden alfabético, aunque no todas están citadas en el texto.' },
                { range: '8-9', description: 'Usa cuatro citas de distintas referencias bibliográficas. Además, estas están ordenadas por orden alfabético y la mayoría están citadas en el texto.' },
                { range: '10', description: 'Usa cinco o más citas de distintas referencias bibliográficas. Además, estas están ordenadas por orden alfabético y todas están citadas en el texto.' }
            ]
        },
    ],
    formatItems: [
        { id: 'f1', label: 'Márgenes correctos (2.5cm)', maxScore: 1 },
        { id: 'f2', label: 'Tipografía (Times 12pt / Arial 11pt)', maxScore: 1 },
        { id: 'f3', label: 'Interlineado doble', maxScore: 1 },
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
