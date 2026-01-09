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
            return data as User;
        },
        getAllUsers: async (): Promise<User[]> => {
            const { data, error } = await supabase
                .from('users')
                .select('*');

            if (error) return [];
            return data as User[];
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
                tribunalIds: p.tribunal_ids || []
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
                tribunalIds: project.tribunal_ids || []
            } as Project;
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
        create: async (data: { title: string, tutorId: string, studentNames: string[] }) => {
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

            const { error: sError } = await supabase
                .from('students')
                .insert(studentsToInsert);

            if (sError) throw sError;

            return project;
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
                        attitudeScores: evaluation.attitudeScores
                    }
                });
            return { success: !error };
        }
    }
};
