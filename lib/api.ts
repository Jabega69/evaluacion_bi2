import { MOCK_PROJECTS, MOCK_USERS, WRITTEN_RUBRIC, ORAL_RUBRIC, TUTOR_RUBRIC } from './mock-data';
import { Project, User, WrittenEvaluation, OralEvaluation, TutorEvaluation } from '@/types';

// Simulating API Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (email: string): Promise<User | null> => {
            await delay(500);
            return MOCK_USERS.find(u => u.email === email) || null;
        },
        getAllUsers: async () => {
            await delay(200);
            return MOCK_USERS;
        }
    },

    projects: {
        getById: async (id: string): Promise<Project | undefined> => {
            await delay(300);
            return MOCK_PROJECTS.find(p => p.id === id);
        },
        getByGrader: async (graderId: string): Promise<Project[]> => {
            await delay(300);
            return MOCK_PROJECTS.filter(p => p.tribunalIds.includes(graderId));
        },
        getByTutor: async (tutorId: string): Promise<Project[]> => {
            await delay(300);
            return MOCK_PROJECTS.filter(p => p.tutorId === tutorId);
        }
    },

    rubrics: {
        getWritten: async () => WRITTEN_RUBRIC,
        getOral: async () => ORAL_RUBRIC,
        getTutor: async () => TUTOR_RUBRIC,
    },

    submissions: {
        submitWritten: async (evaluation: WrittenEvaluation) => {
            await delay(800);
            console.log('Submitting Written:', evaluation);
            return { success: true };
        },
        submitOral: async (evaluation: OralEvaluation) => {
            await delay(800);
            console.log('Submitting Oral:', evaluation);
            return { success: true };
        },
        submitTutor: async (evaluation: TutorEvaluation) => {
            await delay(800);
            console.log('Submitting Tutor:', evaluation);
            return { success: true };
        }
    }
};
