"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useProfile } from "../../components/ProfileContext"; // Importa il context

interface Survey {
    id: string;
    title: string;
    options: string[];
    votes: number[];
    user_id: string;
    created_at: string;
}

export default function ProfilePage() {
    // Utilizza il context per ottenere i dati del profilo
    const { user, profile, error: profileError, loading: profileLoading, updateProfile } = useProfile();

    // Stati locali per la gestione del form
    const [newUsername, setNewUsername] = useState(profile?.username || "");
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(profile?.avatar_url || null);
    const [error, setError] = useState<string | null>(null);

    // Stati per i sondaggi
    const [surveysCreated, setSurveysCreated] = useState<Survey[]>([]);
    const [surveysVoted, setSurveysVoted] = useState<{ survey: Survey; userVotes: number[] }[]>([]);

    // Effetto per caricare i sondaggi creati
    useEffect(() => {
        if (!user) return;

        const fetchSurveys = async () => {
            try {
                // Recupera i sondaggi creati dall'utente
                const { data: createdSurveys, error: createdSurveysError } = await supabase
                    .from("surveys")
                    .select("*")
                    .eq("user_id", user.id);

                if (createdSurveysError) {
                    console.error(
                        "Errore durante il recupero dei sondaggi creati:",
                        createdSurveysError.message
                    );
                    setError("Impossibile caricare i tuoi sondaggi creati. Riprova più tardi.");
                } else {
                    setSurveysCreated(createdSurveys || []);
                }
            } catch (error) {
                console.error("Errore generico durante il caricamento dei sondaggi:", error);
                setError("Si è verificato un errore durante il caricamento dei sondaggi.");
            }
        };

        fetchSurveys();
    }, [user]);

    // Effetto per caricare i sondaggi partecipati
    useEffect(() => {
        if (!user) return;

        const fetchSurveysVoted = async () => {
            try {
                console.log("Inizio recupero sondaggi votati...");

                // Passo 1: Recupera gli ID dei sondaggi partecipati
                const { data: participantData, error: participantError } = await supabase
                    .from("survey_participants")
                    .select("survey_id, user_votes")
                    .eq("user_id", user.id);

                if (participantError) {
                    console.error("Errore durante il recupero dei partecipanti:", participantError.message);
                    setError("Impossibile caricare i tuoi sondaggi votati. Riprova più tardi.");
                    return;
                }

                console.log("Dati partecipanti:", participantData);

                // Passo 2: Recupera i dettagli dei sondaggi
                const surveyIds = participantData.map((participant) => participant.survey_id);
                const { data: surveysData, error: surveysError } = await supabase
                    .from("surveys")
                    .select("*")
                    .in("id", surveyIds);

                if (surveysError) {
                    console.error("Errore durante il recupero dei sondaggi:", surveysError.message);
                    setError("Impossibile caricare i dettagli dei sondaggi. Riprova più tardi.");
                    return;
                }

                console.log("Dettagli dei sondaggi:", surveysData);

                // Passo 3: Combina i dati
                const formattedSurveys = participantData.map((participant) => {
                    const survey = surveysData.find((s) => s.id === participant.survey_id);

                    if (!survey) {
                        console.warn("Sondaggio non trovato, saltato. Survey ID:", participant.survey_id);
                        return null;
                    }

                    return {
                        survey,
                        userVotes: participant.user_votes || [],
                    };
                }).filter((item): item is { survey: Survey; userVotes: number[] } => item !== null);

                console.log("Sondaggi partecipati elaborati:", formattedSurveys);

                setSurveysVoted(formattedSurveys);
            } catch (error) {
                console.error("Errore generico durante il caricamento dei sondaggi votati:", error);
                setError("Si è verificato un errore durante il caricamento dei sondaggi votati.");
            }
        };

        fetchSurveysVoted();
    }, [user]);

    const validateUsername = (username: string): boolean => {
        const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Almeno 3 caratteri, solo lettere, numeri e underscore
        return usernameRegex.test(username);
    };

    // Funzione per aggiornare il profilo
    const handleUpdateProfile = async () => {
        if (!user || !profile) return;

        if (!validateUsername(newUsername)) {
            setError("L'username deve contenere almeno 3 caratteri e non può contenere spazi.");
            return;
        }

        // Verifica se l'username è già in uso
        if (newUsername !== profile.username) {
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
            id: user.id,
            username: newUsername.trim(),
            avatar_url: selectedAvatar || null,
        };

        const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id);

        if (updateError) {
            console.error("Errore durante l'aggiornamento del profilo:", updateError.message);
            setError("Impossibile aggiornare il profilo. Riprova più tardi.");
        } else {
            // Aggiorna il profilo nel context
            updateProfile({
                ...profile,
                username: newUsername.trim(),
                avatar_url: selectedAvatar || null,
            });
            setError(null);
            alert("Profilo aggiornato con successo!");
        }
    };

    // Funzione per selezionare un avatar
    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    if (profileLoading || !user || !profile) return <div>Caricamento...</div>;

    const parseVotes = (votes: string): number[] => {
        try {
            return JSON.parse(votes);
        } catch (error) {
            console.error("Errore durante la parsificazione dei voti:", error);
            return [];
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-md w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Il tuo profilo</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {profileError && <p className="text-red-500 mb-4">{profileError}</p>}
                <div className="mb-6">
                    <p className="text-lg font-medium">Username corrente: {profile?.username}</p>
                    <p className="text-gray-600">Email: {user?.email}</p>
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
                            "/default-avatars/avatar5.png",
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
                                    width={96}
                                    height={96}
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
                        width={96}
                        height={96}
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
                                    <a href={`/surveys`} className="text-blue-500 hover:underline">
                                        {survey.title}
                                    </a>
                                    <p className="text-gray-600">
                                        {survey.options.map((option, index) => {
                                            const votesArray = typeof survey.votes === 'string' ? parseVotes(survey.votes) : survey.votes;
                                            const voteCount = votesArray[index] || 0;
                                            return (
                                                <span key={index}>
                                                    {option}: {voteCount} {voteCount === 1 ? "voto" : "voti"}
                                                    {index < survey.options.length - 1 && ", "}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Non hai creato alcun sondaggio.</p>
                    )}
                </div>

                {/* Sondaggi Partecipati */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Sondaggi Partecipati:</h3>
                    {surveysVoted.length > 0 ? (
                        <ul>
                            {surveysVoted.map(({ survey, userVotes }) => (
                                <li key={survey.id} className="mb-4">
                                    <h4 className="text-xl font-semibold">{survey.title}</h4>
                                    <p className="text-gray-600">
                                        Hai votato:
                                        {survey.options.map((option, index) => {
                                            const hasVoted = userVotes.includes(index);
                                            return (
                                                <span key={index} className={`${hasVoted ? "font-bold" : ""}`}>
                                                    {hasVoted ? ` ${option}` : ""}
                                                    {index < survey.options.length - 1 && hasVoted && ", "}
                                                </span>
                                            );
                                        })}
                                    </p>
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