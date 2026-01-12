'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/');
            } else if (user.activeRole) {
                // Redirection logic based on active role
                router.push(`/dashboard/${user.activeRole}`);
            } else {
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );
}
