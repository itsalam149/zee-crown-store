'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/store/authStore';

// This component runs on the client and sets the session in our store
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const { setSession } = useAuthStore();

    useEffect(() => {
        // Fetch the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for changes in authentication state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, setSession]);

    return <>{children}</>;
}