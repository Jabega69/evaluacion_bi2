'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import ReportView from '@/components/ReportView';

export default function ReportPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        async function init() {
            const p = await api.projects.getById(projectId);
            if (p) setProject(p);
        }
        init();
    }, [projectId]);

    if (!project) return <div>Cargando informe...</div>;

    return <ReportView project={project} />;
}
