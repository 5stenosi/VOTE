// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [newPassword, setNewPassword] = useState(""); // Nuovo campo per la password
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [surveysCreated, setSurveysCreated] = useState<any[]>([]);
    const [surveysParticipated, setSurveysParticipated] = useState<any[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getSession();
            const session = data?.session;

            if (error || !session || !session.user) {
                alert("Devi essere autenticato per visualizzare il profilo.");
                window.location.href = "/auth/login";
                return;
            }

            setUser(session.user);

            // Recupera i dati del profilo
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (profileError) {
                console.error("Errore durante il recupero del profilo:", profileError.message);
            } else {
                setProfile(profileData);
                setUsername(profileData?.username || "");
                setFullName(profileData?.full_name || "");
                setAvatarUrl(profileData?.avatar_url || null);
            }

            // Recupera i sondaggi creati dall'utente
            const { data: createdSurveys } = await supabase
                .from("surveys")
                .select("*")
                .eq("user_id", session.user.id);

            setSurveysCreated(createdSurveys || []);

            // Recupera i sondaggi a cui l'utente ha partecipato
            const { data: participatedSurveys } = await supabase
                .from("survey_participants")
                .select("survey_id, surveys(*)")
                .eq("user_id", session.user.id);

            setSurveysParticipated(participatedSurveys || []);
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async () => {
        const updates = {
            id: user?.id,
            username: username.trim(),
            full_name: fullName.trim(),
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        };

        // Verifica se l'username è già in uso
        if (username !== profile?.username) {
            const { data: existingUsers, error: checkError } = await supabase
                .from("profiles")
                .select("id") // Seleziona solo l'ID
                .eq("username", username);

            if (checkError) {
                console.error("Errore durante la verifica dell'username:", checkError.message);
                alert("Impossibile verificare l'username. Riprova più tardi.");
                return;
            }

            if (existingUsers && existingUsers.length > 0) {
                alert("Questo username è già in uso. Scegline uno diverso.");
                return;
            }
        }

        // Aggiorna il profilo
        const { error: profileError } = await supabase.from("profiles").upsert(updates);

        if (profileError) {
            console.error("Errore durante l'aggiornamento del profilo:", profileError.message);
            alert("Errore durante l'aggiornamento del profilo.");
            return;
        }

        // Cambia la password se specificata
        if (newPassword) {
            const { error: updatePasswordError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updatePasswordError) {
                console.error("Errore durante il cambio della password:", updatePasswordError.message);
                alert("Errore durante il cambio della password.");
            } else {
                alert("Password aggiornata con successo!");
                setNewPassword("");
            }
        }

        alert("Profilo aggiornato con successo!");
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            alert("Seleziona un file da caricare.");
            return;
        }

        const file = event.target.files[0];
        const fileName = `${user?.id}-${file.name}`;
        const filePath = `avatars/${fileName}`;

        // Carica il file in Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Errore durante il caricamento della foto profilo:", uploadError.message);
            return;
        }

        // Ottieni l'URL pubblico del file caricato
        const { data: publicUrl } = await supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        setAvatarUrl(publicUrl.publicUrl);
    };

    if (!user) return <div>Caricamento...</div>;

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-md w-96">
                <h2 className="text-2xl font-bold mb-4">Il tuo profilo</h2>
                <div className="mb-4">
                    <img
                        src={avatarUrl || "/default-avatar.png"}
                        alt="Foto profilo"
                        className="w-24 h-24 rounded-full mx-auto mb-2"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Username:
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Nome Completo:
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Nuova Password:
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                    />
                </div>
                <button
                    onClick={handleUpdateProfile}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Aggiorna profilo
                </button>
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Sondaggi Creati:</h3>
                    <ul>
                        {surveysCreated.map((survey) => (
                            <li key={survey.id} className="mb-2">
                                {survey.title}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Sondaggi Partecipati:</h3>
                    <ul>
                        {surveysParticipated.map((survey) => (
                            <li key={survey.survey_id} className="mb-2">
                                {survey.surveys.title}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}