"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js"; // Importa il tipo User da Supabase

export default function CreateSurveyPage() {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [user, setUser] = useState<User | null>(null); // Usa il tipo User invece di any
  const [error, setError] = useState<string | null>(null); // Stato per gestire gli errori
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          alert("Devi essere autenticato per creare un sondaggio.");
          router.push("/auth/login");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Errore durante il recupero della sessione:", error);
        setError("Si è verificato un errore durante il caricamento dell'utente.");
      }
    };

    checkUser();
  }, [router]);

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title || options.length < 2) {
      alert("Inserisci un titolo e almeno due opzioni.");
      return;
    }

    if (!user) {
      alert("Devi essere autenticato per creare un sondaggio.");
      return;
    }

    try {
      const survey = {
        title,
        options,
        votes: Array(options.length).fill(0),
        user_id: user.id, // Associa il sondaggio all'utente corrente
      };

      const { error } = await supabase.from("surveys").insert(survey);

      if (error) {
        console.error("Errore durante la creazione del sondaggio:", error.message);
        setError("Si è verificato un errore. Riprova più tardi.");
      } else {
        alert("Sondaggio creato con successo!");
        setTitle("");
        setOptions([""]);
        setError(null); // Resetta eventuali errori precedenti
      }
    } catch (error) {
      console.error("Errore generico durante la creazione del sondaggio:", error);
      setError("Si è verificato un errore. Riprova più tardi.");
    }
  };

  if (!user) return <div>Caricamento...</div>;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4">Crea un sondaggio</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* Mostra l'errore se presente */}
        <input
          type="text"
          placeholder="Titolo del sondaggio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
        />
        {options.map((option, index) => (
          <div key={index} className="mb-2 flex items-center">
            <input
              type="text"
              placeholder={`Opzione ${index + 1}`}
              value={option}
              onChange={(e) =>
                setOptions((prev) =>
                  prev.map((opt, i) => (i === index ? e.target.value : opt))
                )
              }
              className="w-full p-2 border rounded-md mr-2"
            />
            {options.length > 1 && (
              <button
                onClick={() => removeOption(index)}
                className="bg-red-500 text-white px-2 py-1 rounded-md"
              >
                Rimuovi
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addOption}
          className="w-full py-2 bg-green-500 text-white rounded-md mb-4"
        >
          Aggiungi opzione
        </button>
        <button
          onClick={handleCreate}
          className="w-full py-2 bg-blue-500 text-white rounded-md"
        >
          Crea sondaggio
        </button>
      </div>
    </div>
  );
}