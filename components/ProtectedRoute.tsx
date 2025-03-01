// components/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/auth-js";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            if (!session || !session.user) {
                // Reindirizza solo se siamo su una pagina protetta
                const protectedRoutes = ["/surveys/create", "/surveys"];
                if (protectedRoutes.includes(window.location.pathname)) {
                    router.push("/auth/login");
                }
            }
        };

        checkUser();
    }, [router]);

    if (!user) return <div>Caricamento...</div>;

    return <>{children}</>;
}