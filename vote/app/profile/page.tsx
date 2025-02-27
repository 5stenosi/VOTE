// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface User {
    id: string;
    email: string;
}

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    updated_at: string;
}

interface Survey {
    id: string;
    title: string;
    options: string[];
    votes: number[];
    user_id: string;
    created_at: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Stati per i sondaggi
    const [surveysCreated, setSurveysCreated] = useState<Survey[]>([]);
    const [surveysVoted, setSurveysVoted] = useState<Survey[]>([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Recupera la sessione dell'utente
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !sessionData.session || !sessionData.session.user) {
                    alert("Devi essere autenticato per visualizzare il profilo.");
                    window.location.href = "/auth/login";
                    return;
                }

                const sessionUser = sessionData.session.user as User;
                setUser(sessionUser);

                // Recupera il profilo utente dalla tabella profiles
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", sessionUser.id)
                    .limit(1);

                if (profileError) {
                    console.error("Errore durante il recupero del profilo:", profileError.message);
                    setError("Impossibile caricare il tuo profilo. Riprova più tardi.");
                    return;
                }

                if (!profileData || profileData.length === 0) {
                    // Crea o aggiorna il profilo usando upsert
                    const { error: createProfileError } = await supabase.from("profiles").upsert({
                        id: sessionUser.id,
                        username: sessionUser.email.split("@")[0],
                        full_name: "",
                        avatar_url: "/default-avatar.png",
                    });

                    if (createProfileError) {
                        console.error(
                            "Errore durante la creazione del profilo:",
                            createProfileError.message
                        );
                        setError("Impossibile caricare il tuo profilo. Riprova più tardi.");
                        return;
                    }

                    setProfile({
                        id: sessionUser.id,
                        username: sessionUser.email.split("@")[0],
                        full_name: "",
                        avatar_url: "/default-avatar.png",
                        updated_at: new Date().toISOString(),
                    });
                } else {
                    setProfile(profileData[0] as Profile);
                    setNewUsername(profileData[0].username || "");
                    setSelectedAvatar(profileData[0].avatar_url || "/default-avatar.png");
                }

                // Recupera i sondaggi creati dall'utente
                const { data: createdSurveys, error: createdSurveysError } = await supabase
                    .from("surveys")
                    .select("*")
                    .eq("user_id", sessionUser.id);

                if (createdSurveysError) {
                    console.error(
                        "Errore durante il recupero dei sondaggi creati:",
                        createdSurveysError.message
                    );
                    setError("Impossibile caricare i tuoi sondaggi creati. Riprova più tardi.");
                } else {
                    // Converti i dati in Survey[]
                    const typedCreatedSurveys = createdSurveys?.map((survey: any) => ({
                        id: survey.id,
                        title: survey.title,
                        options: survey.options,
                        votes: survey.votes,
                        user_id: survey.user_id,
                        created_at: survey.created_at,
                    })) || [];

                    setSurveysCreated(typedCreatedSurveys);
                }

                // Recupera i sondaggi in cui l'utente ha votato
                const { data: votedSurveys, error: votedSurveysError } = await supabase
                    .from("survey_participants")
                    .select("survey_id, surveys (*)") // Include i dettagli dei sondaggi
                    .eq("user_id", sessionUser.id);

                if (votedSurveysError) {
                    console.error(
                        "Errore durante il recupero dei sondaggi votati:",
                        votedSurveysError.message
                    );
                    setError("Impossibile caricare i tuoi sondaggi votati. Riprova più tardi.");
                } else {
                    // Rimuovi duplicati basati sull'ID del sondaggio
                    const uniqueVotedSurveys = Array.from(
                        new Map(
                            votedSurveys?.map((v: any) => [v.surveys.id, v.surveys])
                        ).values()
                    );

                    // Converti i dati in Survey[]
                    const typedVotedSurveys = uniqueVotedSurveys.map((survey: any) => ({
                        id: survey.id,
                        title: survey.title,
                        options: survey.options,
                        votes: survey.votes,
                        user_id: survey.user_id,
                        created_at: survey.created_at,
                    }));

                    setSurveysVoted(typedVotedSurveys);
                }
            } catch (error) {
                console.error("Errore generico durante il caricamento del profilo:", error);
                setError("Si è verificato un errore durante il caricamento del profilo.");
            }
        };

        fetchUserProfile();
    }, []);

    const validateUsername = (username: string): boolean => {
        const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Almeno 3 caratteri, solo lettere, numeri e underscore
        return usernameRegex.test(username);
    };

    // Funzione per aggiornare il profilo
    const handleUpdateProfile = async () => {
        if (!validateUsername(newUsername)) {
            setError("L'username deve contenere almeno 3 caratteri e non può contenere spazi.");
            return;
        }

        // Verifica se l'username è già in uso
        if (newUsername !== profile?.username) {
            const { data: existingUsers, error: checkError } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", newUsername)
                .limit(1);

            if (checkError) {
                console.error("Errore durante la verifica dell'username:", checkError.message);
                setError("Impossibile verificare l'username. Riprova più tardi.");
                return;
            }

            if (existingUsers && existingUsers.length > 0) {
                setError("Questo username è già in uso. Scegline uno diverso.");
                return;
            }
        }

        // Aggiorna il profilo
        const updates = {
            id: user?.id,
            username: newUsername.trim(),
            avatar_url: selectedAvatar || null,
        };

        const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user?.id);

        if (updateError) {
            console.error("Errore durante l'aggiornamento del profilo:", updateError.message);
            setError("Impossibile aggiornare il profilo. Riprova più tardi.");
        } else {
            setProfile((prevProfile) => {
                if (!prevProfile) return null;
                return {
                    ...prevProfile,
                    username: newUsername.trim(),
                    avatar_url: selectedAvatar || null,
                };
            });
            setError(null); // Resetta eventuali errori precedenti
            alert("Profilo aggiornato con successo!");
        }
    };

    // Funzione per selezionare un avatar
    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    if (!user || !profile) return <div>Caricamento...</div>;

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-md w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Il tuo profilo</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-6">
                    <p className="text-lg font-medium">Username corrente: {profile.username}</p>
                    <p className="text-gray-600">Email: {user.email}</p>
                </div>

                {/* Modifica Username */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nuovo Username:
                    </label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {/* Seleziona Avatar */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Seleziona un avatar:</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            "/default-avatars/avatar1.png",
                            "/default-avatars/avatar2.png",
                            "/default-avatars/avatar3.png",
                            "/default-avatars/avatar4.png",
                        ].map((avatarUrl) => (
                            <div
                                key={avatarUrl}
                                onClick={() => handleAvatarSelect(avatarUrl)}
                                className={`border-2 border-transparent hover:border-blue-500 cursor-pointer ${selectedAvatar === avatarUrl ? "border-blue-500" : ""
                                    }`}
                            >
                                <img
                                    src={avatarUrl}
                                    alt="Avatar predefinito"
                                    className="w-24 h-24 rounded-full mx-auto"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visualizza Avatar Selezionato */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Avatar selezionato:</h3>
                    <img
                        src={selectedAvatar || profile.avatar_url || "/default-avatar.png"}
                        alt="Foto profilo"
                        className="w-24 h-24 rounded-full mx-auto mb-2"
                    />
                </div>

                {/* Bottone per Aggiornare il Profilo */}
                <button
                    onClick={handleUpdateProfile}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-6"
                >
                    Aggiorna profilo
                </button>

                {/* Sondaggi Creati */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Sondaggi Creati:</h3>
                    {surveysCreated.length > 0 ? (
                        <ul>
                            {surveysCreated.map((survey) => (
                                <li key={survey.id} className="mb-2">
                                    {survey.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Non hai creato alcun sondaggio.</p>
                    )}
                </div>

                {/* Sondaggi Votati */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Sondaggi Votati:</h3>
                    {surveysVoted.length > 0 ? (
                        <ul>
                            {surveysVoted.map((survey) => (
                                <li key={survey.id} className="mb-2">
                                    {survey.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Non hai partecipato a nessun sondaggio.</p>
                    )}
                </div>
            </div>
        </div>
    );
}