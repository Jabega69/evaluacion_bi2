'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Project, WrittenRubric, Student } from '@/types';
import WrittenEvalForm from '@/components/WrittenEvalForm';
import { useSearchParams } from 'next/navigation';

export default function WrittenEvalPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');

    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [rubric, setRubric] = useState<WrittenRubric | null>(null);
    const [student, setStudent] = useState<Student | undefined>(undefined);

    useEffect(() => {
        async function init() {
            const p = await api.projects.getById(projectId);
            const r = await api.rubrics.getWritten();
            if (p) {
                setProject(p);
                setStudent(p.students.find(s => s.id === studentId));
            }
            setRubric(r);
        }
        init();
    }, [projectId, studentId]);

    if (!project || !rubric || !user || !student) return <div className="p-8 text-center text-slate-500">Cargando evaluación...</div>;

    return (
        <WrittenEvalForm
            rubric={rubric}
            project={project}
            student={student}
            graderId={user.id}
        />
    );
}
