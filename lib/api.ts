import { supabase } from './supabase';
import { WRITTEN_RUBRIC, ORAL_RUBRIC, TUTOR_RUBRIC } from './mock-data';
import { Project, User, Role, WrittenEvaluation, OralEvaluation, TutorEvaluation } from '@/types';

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
        update: async (id: string, name: string, roles: Role[]): Promise<{ success: boolean, error?: string }> => {
            try {
                const response = await fetch('/api/admin/update-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id, name, roles })
                });

                if (response.ok) {
                    return { success: true };
                } else {
                    const data = await response.json();
                    return { success: false, error: data.error || 'Error desconocido' };
                }
            } catch (error: any) {
                console.error('Update API Error:', error);
                return { success: false, error: error.message };
            }
        },
        delete: async (id: string): Promise<boolean> => {
            try {
                const response = await fetch('/api/admin/delete-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id })
                });
                return response.ok;
            } catch (error) {
                console.error('Delete API Error:', error);
                return false;
            }
        },
        checkActivity: async (id: string): Promise<{ isTutor: boolean, isTribunal: boolean }> => {
            const { count: tutorCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('tutor_id', id);

            const { count: tribunalCount } = await supabase
                .from('project_tribunals')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', id);

            return {
                isTutor: (tutorCount || 0) > 0,
                isTribunal: (tribunalCount || 0) > 0
            };
        }
    },

    projects: {
        getAll: async (): Promise<Project[]> => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    students (*),
                    tutor:users!tutor_id(name, email),
                    project_tribunals (
                        user_id,
                        user:users(name, email)
                    )
                `)
                .order('presentation_date', { ascending: true });

            if (error) {
                console.error('Error fetching projects:', error);
                return [];
            }
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                tutorName: p.tutor?.name,
                tutorEmail: p.tutor?.email,
                students: p.students || [],
                tribunalIds: (p.project_tribunals || []).map((t: any) => t.user_id),
                tribunalNames: (p.project_tribunals || []).map((t: any) => t.user?.name).filter(Boolean),
                tribunalEmails: (p.project_tribunals || []).map((t: any) => t.user?.email).filter(Boolean),
                presentationDate: p.presentation_date,
                presentationLocation: p.presentation_location,
                distributedAt: p.distributed_at
            })) as Project[];
        },
        getById: async (id: string): Promise<Project | undefined> => {
            const { data: project, error: pError } = await supabase
                .from('projects')
                .select(`*, students (*), project_tribunals (user_id)`)
                .eq('id', id)
                .single();

            if (pError || !project) return undefined;

            return {
                id: project.id,
                title: project.title,
                tutorId: project.tutor_id,
                students: project.students || [],
                tribunalIds: ((project as any).project_tribunals || []).map((t: any) => t.user_id),
                presentationDate: project.presentation_date,
                presentationLocation: project.presentation_location,
                distributedAt: project.distributed_at
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
        schedule: async (data: { projectId: string, presentationDate: string | null, presentationLocation: string }) => {
            const response = await fetch('/api/admin/schedule-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agendar el proyecto');
            }
            return true;
        },
        getByGrader: async (graderId: string): Promise<Project[]> => {
            const { data: assignments, error: aError } = await supabase
                .from('project_tribunals')
                .select('project_id')
                .eq('user_id', graderId);

            if (aError || !assignments || assignments.length === 0) return [];

            const projectIds = assignments.map((a: any) => a.project_id);
            const { data, error } = await supabase
                .from('projects')
                .select(`*, students (*)`)
                .in('id', projectIds)
                .order('presentation_date', { ascending: true });

            if (error) return [];
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                students: p.students || [],
                tribunalIds: [graderId],
                presentationDate: p.presentation_date,
                presentationLocation: p.presentation_location,
                distributedAt: p.distributed_at
            })) as Project[];
        },
        getByTutor: async (tutorId: string): Promise<Project[]> => {
            const { data, error } = await supabase
                .from('projects')
                .select(`*, students (*)`)
                .eq('tutor_id', tutorId)
                .order('presentation_date', { ascending: true });

            if (error) return [];
            return (data as any[]).map(p => ({
                id: p.id,
                title: p.title,
                tutorId: p.tutor_id,
                students: p.students || [],
                tribunalIds: p.tribunal_ids || [],
                presentationDate: p.presentation_date,
                presentationLocation: p.presentation_location,
                distributedAt: p.distributed_at
            })) as Project[];
        },
        create: async (data: { title: string, tutorId: string, studentNames: string[], tribunalIds: string[] }) => {
            const response = await fetch('/api/admin/create-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el proyecto');
            }
            return response.json();
        },
        updateFull: async (data: { projectId: string, title: string, tutorId: string, studentNames: string[], tribunalIds: string[] }) => {
            const response = await fetch('/api/admin/update-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el proyecto');
            }
            return true;
        },
        delete: async (id: string): Promise<boolean> => {
            const response = await fetch('/api/admin/delete-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el proyecto');
            }
            return true;
        },
        getReport: async (projectId: string, studentId: string) => {
            const { data: evals, error } = await supabase
                .from('evaluations')
                .select(`
                    *,
                    grader:grader_id(name)
                `)
                .eq('project_id', projectId)
                .eq('student_id', studentId);

            if (error || !evals) return null;

            // Agrupar evaluaciones por tipo
            const writtenEvals = evals.filter((e: any) => e.type === 'written');
            const oralEvals = evals.filter((e: any) => e.type === 'oral');
            const tutorEvals = evals.filter((e: any) => e.type === 'tutor');

            // Calcular medias (si hay varios miembros del tribunal)
            const calcMean = (arr: any[]) => {
                if (arr.length === 0) return 0;
                const total = arr.reduce((acc, curr) => {
                    let subtotal = 0;
                    if (curr.type === 'written') {
                        const contentTotal = Object.values(curr.scores.contentScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                        const formatTotal = Object.values(curr.scores.formatScores || {}).filter(v => v === true).length;
                        subtotal = (contentTotal as number / 13) * 0.9 + (formatTotal / 6) * 10 * 0.1;
                    } else if (curr.type === 'oral') {
                        const blocksTotal = Object.values(curr.scores.blockScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                        subtotal = (blocksTotal as number) + (Number(curr.scores.timeScore) || 0);
                    } else if (curr.type === 'tutor') {
                        subtotal = Object.values(curr.scores.scores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
                    }
                    return acc + subtotal;
                }, 0);
                return total / arr.length;
            };

            const writtenScore = calcMean(writtenEvals);
            const oralScore = calcMean(oralEvals);
            const tutorScore = calcMean(tutorEvals);

            // Preparar datos detallados para el informe de expertos
            const detailedEvals = evals.map((e: any) => {
                let subtotal = 0;
                if (e.type === 'written') {
                    const contentTotal = Object.values(e.scores.contentScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                    const formatTotal = Object.values(e.scores.formatScores || {}).filter(v => v === true).length;
                    subtotal = (contentTotal as number / 13) * 0.9 + (formatTotal / 6) * 10 * 0.1;
                } else if (e.type === 'oral') {
                    const blocksTotal = Object.values(e.scores.blockScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                    subtotal = (blocksTotal as number) + (Number(e.scores.timeScore) || 0);
                } else if (e.type === 'tutor') {
                    subtotal = Object.values(e.scores.scores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
                }

                return {
                    ...e,
                    graderName: e.grader?.name || 'Profesor',
                    totalScore: subtotal.toFixed(2)
                };
            });

            return {
                written: { score: writtenScore, final: writtenScore * 0.5 },
                oral: { score: oralScore, final: oralScore * 0.3 },
                tutor: { score: tutorScore, final: tutorScore * 0.2 },
                total: (writtenScore * 0.5 + oralScore * 0.3 + tutorScore * 0.2).toFixed(2),
                evaluations: detailedEvals
            };
        },
        getAllStudentsGrades: async () => {
            // Obtenemos todos los proyectos con sus alumnos
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select(`id, title, students (*)`);

            // Obtenemos todas las evaluaciones
            const { data: evals, error: evalsError } = await supabase
                .from('evaluations')
                .select('*');

            if (projectsError || evalsError || !projects || !evals) {
                console.error("Error fetching data for grades report");
                return [];
            }

            const calcMean = (arr: any[]) => {
                if (arr.length === 0) return 0;
                const total = arr.reduce((acc, curr) => {
                    let subtotal = 0;
                    if (curr.type === 'written') {
                        const contentTotal = Object.values(curr.scores.contentScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                        const formatTotal = Object.values(curr.scores.formatScores || {}).filter(v => v === true).length;
                        subtotal = (contentTotal as number / 13) * 0.9 + (formatTotal / 6) * 10 * 0.1;
                    } else if (curr.type === 'oral') {
                        const blocksTotal = Object.values(curr.scores.blockScores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                        subtotal = (blocksTotal as number) + (Number(curr.scores.timeScore) || 0);
                    } else if (curr.type === 'tutor') {
                        subtotal = Object.values(curr.scores.scores || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
                    }
                    return acc + subtotal;
                }, 0);
                return total / arr.length;
            };

            const results: any[] = [];

            // Procesar cada proyecto y alumno
            projects.forEach((project: any) => {
                const projectEvals = evals.filter((e: any) => e.project_id === project.id);
                const students = project.students || [];

                students.forEach((student: any) => {
                    const studentEvals = projectEvals.filter((e: any) => e.student_id === student.id);
                    
                    const writtenEvals = studentEvals.filter((e: any) => e.type === 'written');
                    const oralEvals = studentEvals.filter((e: any) => e.type === 'oral');
                    const tutorEvals = studentEvals.filter((e: any) => e.type === 'tutor');

                    const writtenScore = calcMean(writtenEvals);
                    const oralScore = calcMean(oralEvals);
                    const tutorScore = calcMean(tutorEvals);
                    const totalScore = (writtenScore * 0.5) + (oralScore * 0.3) + (tutorScore * 0.2);

                    results.push({
                        studentName: student.name,
                        projectName: project.title,
                        writtenScore: writtenScore,
                        oralScore: oralScore,
                        tutorScore: tutorScore,
                        totalScore: totalScore
                    });
                });
            });

            // Ordenar alfabéticamente por nombre de alumno
            results.sort((a, b) => a.studentName.localeCompare(b.studentName));
            
            return results;
        }
    },

    rubrics: {
        getWritten: async () => WRITTEN_RUBRIC,
        getOral: async () => ORAL_RUBRIC,
        getTutor: async () => TUTOR_RUBRIC,
    },

    submissions: {
        getWritten: async (projectId: string, studentId: string, graderId: string): Promise<WrittenEvaluation | null> => {
            const { data, error } = await supabase
                .from('evaluations')
                .select('*')
                .eq('project_id', projectId)
                .eq('student_id', studentId)
                .eq('grader_id', graderId)
                .eq('type', 'written')
                .maybeSingle();

            if (error || !data) return null;

            return {
                id: data.id,
                projectId: data.project_id,
                studentId: data.student_id,
                graderId: data.grader_id,
                contentScores: data.scores.contentScores,
                formatScores: data.scores.formatScores,
                submittedAt: data.submitted_at
            };
        },
        submitWritten: async (evaluation: Omit<WrittenEvaluation, 'id' | 'submittedAt'>) => {
            const { error } = await supabase
                .from('evaluations')
                .upsert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.graderId,
                    type: 'written',
                    scores: {
                        contentScores: evaluation.contentScores,
                        formatScores: evaluation.formatScores
                    },
                    submitted_at: new Date().toISOString()
                }, {
                    onConflict: 'project_id, student_id, grader_id, type'
                });
            return { success: !error };
        },
        getOral: async (projectId: string, studentId: string, graderId: string): Promise<OralEvaluation | null> => {
            const { data, error } = await supabase
                .from('evaluations')
                .select('*')
                .eq('project_id', projectId)
                .eq('student_id', studentId)
                .eq('grader_id', graderId)
                .eq('type', 'oral')
                .maybeSingle();

            if (error || !data) return null;

            return {
                id: data.id,
                projectId: data.project_id,
                studentId: data.student_id,
                graderId: data.grader_id,
                blockScores: data.scores.blockScores || {},
                timeScore: data.scores.timeScore || 0,
                submittedAt: data.submitted_at
            };
        },
        submitOral: async (evaluation: Omit<OralEvaluation, 'id' | 'submittedAt'>) => {
            const { error } = await supabase
                .from('evaluations')
                .upsert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.graderId,
                    type: 'oral',
                    scores: {
                        blockScores: evaluation.blockScores,
                        timeScore: evaluation.timeScore
                    },
                    submitted_at: new Date().toISOString()
                }, {
                    onConflict: 'project_id, student_id, grader_id, type'
                });
            return { success: !error };
        },
        getTutor: async (projectId: string, studentId: string, tutorId: string): Promise<TutorEvaluation | null> => {
            const { data, error } = await supabase
                .from('evaluations')
                .select('*')
                .eq('project_id', projectId)
                .eq('student_id', studentId)
                .eq('grader_id', tutorId)
                .eq('type', 'tutor')
                .maybeSingle();

            if (error || !data) return null;

            return {
                id: data.id,
                projectId: data.project_id,
                studentId: data.student_id,
                tutorId: data.grader_id,
                scores: data.scores.scores || {},
                submittedAt: data.submitted_at
            };
        },
        submitTutor: async (evaluation: Omit<TutorEvaluation, 'id' | 'submittedAt'>) => {
            const { error } = await supabase
                .from('evaluations')
                .upsert({
                    project_id: evaluation.projectId,
                    student_id: evaluation.studentId,
                    grader_id: evaluation.tutorId,
                    type: 'tutor',
                    scores: {
                        scores: evaluation.scores
                    },
                    submitted_at: new Date().toISOString()
                }, {
                    onConflict: 'project_id, student_id, grader_id, type'
                });
            return { success: !error };
        }
    }
};
