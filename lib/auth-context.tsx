'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string) => {
        setIsLoading(true);
        try {
            const foundUser = await api.auth.login(email);
            if (foundUser) {
                setUser(foundUser);
                // Redirect based on role
                if (foundUser.role === 'admin') router.push('/dashboard/admin');
                else if (foundUser.role === 'tribunal') router.push('/dashboard/tribunal');
                else if (foundUser.role === 'tutor') router.push('/dashboard/tutor');
                return true;
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
