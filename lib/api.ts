import { supabase } from './supabase';
import { WRITTEN_RUBRIC, ORAL_RUBRIC, TUTOR_RUBRIC } from './mock-data';
import { Project, User, WrittenEvaluation, OralEvaluation, TutorEvaluation } from '@/types';

export const api = {
    auth: {
        login: async (email: string): Promise<User | null> => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) return null;
            const roles = data.roles || (data.role ? [data.role] : []);
            return { ...data, roles } as User;
        }
    },

    users: {
        getAll: async (): Promise<User[]> => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('name');

            if (error || !data) return [];
            return data.map((u: any) => ({
                ...u,
                roles: u.roles || (u.role ? [u.role] : [])
            })) as User[];
        },
        create: async (user: Omit<User, 'id'>): Promise<User | null> => {
            const { data, error } = await supabase
                .from('users')
                .insert([user])
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error);
                return null;
            }
            return data as User;
        },
        update: async (id: string, updates: Partial<User>): Promise<User | null> => {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return null;
            return data as User;
        },
        delete: async (id: string): Promise<boolean> => {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            return !error;
        }
    },

    projects: {
        getAll: async (): Promise<Project[]> => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    students (*)
                `);

            if (error) {
                console.error('Error fetching projects:', error);
                return [];
            }
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                students: p.students || [],
                tribunalIds: p.tribunal_ids || [],
                presentationDate: p.presentation_date,
                presentationLocation: p.presentation_location
            })) as Project[];
        },
        getById: async (id: string): Promise<Project | undefined> => {
            const { data: project, error: pError } = await supabase
                .from('projects')
                .select(`*, students (*)`)
                .eq('id', id)
                .single();

            if (pError || !project) return undefined;

            return {
                id: project.id,
                title: project.title,
                tutorId: project.tutor_id,
                students: project.students || [],
                tribunalIds: project.tribunal_ids || [],
                presentationDate: project.presentation_date,
                presentationLocation: project.presentation_location
            } as Project;
        },
        update: async (id: string, updates: Partial<Project>): Promise<boolean> => {
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.tutorId) dbUpdates.tutor_id = updates.tutorId;
            if (updates.presentationDate) dbUpdates.presentation_date = updates.presentationDate;
            if (updates.presentationLocation) dbUpdates.presentation_location = updates.presentationLocation;

            const { error } = await supabase
                .from('projects')
                .update(dbUpdates)
                .eq('id', id);
            return !error;
        },
        getByGrader: async (graderId: string): Promise<Project[]> => {
            const { data: assignments, error: aError } = await supabase
                .from('project_tribunals')
                .select('project_id')
                .eq('user_id', graderId);

            if (aError || !assignments || assignments.length === 0) return [];

            const projectIds = assignments.map(a => a.project_id);
            const { data, error } = await supabase
                .from('projects')
                .select(`*, students (*)`)
                .in('id', projectIds);

            if (error) return [];
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                students: p.students || [],
                tribunalIds: [graderId] // Simplificado para la vista actual
            })) as Project[];
        },
        getByTutor: async (tutorId: string): Promise<Project[]> => {
            const { data, error } = await supabase
                .from('projects')
                .select(`*, students (*)`)
                .eq('tutor_id', tutorId);

            if (error) return [];
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                students: p.students || [],
                tribunalIds: p.tribunal_ids || []
            })) as Project[];
        },
        create: async (data: { title: string, tutorId: string, studentNames: string[], tribunalIds: string[] }) => {
            // 1. Crear el proyecto
            const { data: project, error: pError } = await supabase
                .from('projects')
                .insert({ title: data.title, tutor_id: data.tutorId })
                .select()
                .single();

            if (pError || !project) throw pError;

            // 2. Crear los alumnos vinculados
            const studentsToInsert = data.studentNames.map(name => ({
                name,
                project_id: project.id
            }));

            // 3. Crear los tribunales vinculados
            const tribunalAssignments = data.tribunalIds.map(userId => ({
                project_id: project.id,
                user_id: userId
            }));

            const [sRes, tRes] = await Promise.all([
                supabase.from('students').insert(studentsToInsert),
                supabase.from('project_tribunals').insert(tribunalAssignments)
            ]);

            if (sRes.error) throw sRes.error;
            if (tRes.error) throw tRes.error;

            return project;
        },
        getReport: async (projectId: string, studentId: string) => {
            const { data: evals, error } = await supabase
                .from('evaluations')
                .select('*')
                .eq('project_id', projectId)
                .eq('student_id', studentId);

            if (error || !evals) return null;

            // Agrupar evaluaciones por tipo
            const writtenEvals = evals.filter(e => e.type === 'written');
            const oralEvals = evals.filter(e => e.type === 'oral');
            const tutorEvals = evals.filter(e => e.type === 'tutor');

            // Calcular medias (si hay varios miembros del tribunal)
            const calcMean = (arr: any[], scoreKey: string) => {
                if (arr.length === 0) return 0;
                const total = arr.reduce((acc, curr) => {
                    // Aquí la lógica de cálculo dependerá de cómo se guardan las rúbricas
                    // Por ahora asumimos un cálculo simplificado para la demostración
                    return acc + (curr.scores.total || 0);
                }, 0);
                return total / arr.length;
            };

            const writtenScore = calcMean(writtenEvals, 'total');
            const oralScore = calcMean(oralEvals, 'total');
            const tutorScore = calcMean(tutorEvals, 'total');

            return {
                written: { score: writtenScore, final: writtenScore * 0.5 },
                oral: { score: oralScore, final: oralScore * 0.3 },
                tutor: { score: tutorScore, final: tutorScore * 0.2 },
                total: (writtenScore * 0.5 + oralScore * 0.3 + tutorScore * 0.2).toFixed(2),
                evaluations: evals
            };
        }
    },

    rubrics: {
        getWritten: async () => WRITTEN_RUBRIC,
        getOral: async () => ORAL_RUBRIC,
        getTutor: async () => TUTOR_RUBRIC,
    },

    submissions: {
        submitWritten: async (evaluation: WrittenEvaluation) => {
            const { error } = await supabase
                .from('evaluations')
                .insert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.graderId,
                    type: 'written',
                    scores: {
                        contentScores: evaluation.contentScores,
                        formatScores: evaluation.formatScores
                    }
                });
            return { success: !error };
        },
        submitOral: async (evaluation: OralEvaluation) => {
            const { error } = await supabase
                .from('evaluations')
                .insert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.graderId,
                    type: 'oral',
                    scores: {
                        blockScores: evaluation.blockScores,
                        timeScore: evaluation.timeScore
                    }
                });
            return { success: !error };
        },
        submitTutor: async (evaluation: TutorEvaluation) => {
            const { error } = await supabase
                .from('evaluations')
                .insert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.studentId,
                    type: 'tutor',
                    scores: {
                        scores: evaluation.scores
                    }
                });
            return { success: !error };
        }
    }
};
