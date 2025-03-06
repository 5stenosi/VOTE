"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface User {
    id: string;
    email: string;
}

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    updated_at: string;
}

interface ProfileContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (profile: Profile) => void; // Add updateProfile method
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !sessionData.session || !sessionData.session.user) {
                    setError("Devi essere autenticato per visualizzare il profilo.");
                    setLoading(false);
                    return;
                }

                const sessionUser = sessionData.session.user as User;
                setUser(sessionUser);

                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", sessionUser.id)
                    .limit(1);

                if (profileError) {
                    setError("Impossibile caricare il tuo profilo. Riprova più tardi.");
                    setLoading(false);
                    return;
                }

                if (!profileData || profileData.length === 0) {
                    const { error: createProfileError } = await supabase.from("profiles").upsert({
                        id: sessionUser.id,
                        username: sessionUser.email.split("@")[0],
                        avatar_url: "/default-avatar.png",
                    });

                    if (createProfileError) {
                        setError("Impossibile creare il profilo. Riprova più tardi.");
                        setLoading(false);
                        return;
                    }

                    setProfile({
                        id: sessionUser.id,
                        username: sessionUser.email.split("@")[0],
                        avatar_url: "/default-avatar.png",
                        updated_at: new Date().toISOString(),
                    });
                } else {
                    setProfile(profileData[0] as Profile);
                }
            } catch (error) {
                setError("Si è verificato un errore durante il caricamento del profilo.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const updateProfile = (updatedProfile: Profile) => {
        setProfile(updatedProfile);
    };

    return (
        <ProfileContext.Provider value={{ user, profile, loading, error, updateProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile deve essere utilizzato all'interno di un ProfileProvider");
    }
    return context;
};