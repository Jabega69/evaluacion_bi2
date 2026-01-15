'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project, TutorRubric, Student } from '@/types';
import TutorEvalForm from '@/components/TutorEvalForm';

export default function TutorEvalPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = use(params);
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [rubric, setRubric] = useState<TutorRubric | null>(null);
    const [existingScores, setExistingScores] = useState<Record<string, number>>({});

    useEffect(() => {
        async function init() {
            if (user?.id) {
                const projects = await api.projects.getByTutor(user.id);
                let foundProject: Project | undefined;
                let foundStudent: Student | undefined;

                for (const p of projects) {
                    const s = p.students.find(st => st.id === studentId);
                    if (s) {
                        foundProject = p;
                        foundStudent = s;
                        break;
                    }
                }

                if (foundProject && foundStudent) {
                    setProject(foundProject);
                    setStudent(foundStudent);

                    // Fetch existing evaluation
                    const existingEval = await api.submissions.getTutor(foundProject.id, foundStudent.id, user.id);
                    if (existingEval) {
                        setExistingScores(existingEval.scores);
                    }
                }
            }

            const r = await api.rubrics.getTutor();
            setRubric(r);
        }
        init();
    }, [studentId, user]);

    if (!project || !rubric || !user || !student) return <div>Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Evaluación de Tutoría</h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Alumno: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{student.name}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Proyecto: {project.title}</p>
            </div>

            <TutorEvalForm
                rubric={rubric}
                project={project}
                student={student}
                tutorId={user.id}
                initialScores={existingScores}
            />
        </div>
    );
}
