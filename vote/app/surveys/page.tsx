// app/surveys/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

interface Survey {
  id: string;
  title: string;
  options: string[];
  votes: number[];
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      const { data, error } = await supabase.from("surveys").select("*");

      if (error) {
        console.error("Errore durante il recupero dei sondaggi:", error.message);
      } else {
        setSurveys(
          data.map((survey: any) => ({
            id: survey.id,
            title: survey.title,
            options: survey.options,
            votes: survey.votes,
          }))
        );
      }
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchSurveys();
    checkUser();
  }, []);

  const handleVote = async (surveyId: string, optionIndex: number) => {
    if (!user) {
      alert("Devi essere autenticato per votare.");
      return;
    }
  
    // Controlla se l'utente ha già votato
    const { data: participantData } = await supabase
      .from("survey_participants")
      .select("*")
      .eq("user_id", user.id)
      .eq("survey_id", surveyId);
  
    if (participantData && participantData.length > 0) {
      alert("Hai già votato in questo sondaggio.");
      return;
    }
  
    // Aggiorna i voti
    const updatedVotes = surveys.map((survey) =>
      survey.id === surveyId
        ? {
            ...survey,
            votes: survey.votes.map((vote, i) =>
              i === optionIndex ? vote + 1 : vote
            ),
          }
        : survey
    );
  
    setSurveys(updatedVotes);
  
    // Aggiorna il database
    const { error: updateError } = await supabase
      .from("surveys")
      .update({ votes: updatedVotes.find((s) => s.id === surveyId)?.votes })
      .eq("id", surveyId);
  
    if (updateError) {
      console.error("Errore durante l'aggiornamento dei voti:", updateError.message);
      return;
    }
  
    // Registra la partecipazione
    const { error: participationError } = await supabase.from("survey_participants").insert({
      user_id: user.id,
      survey_id: surveyId,
    });
  
    if (participationError) {
      console.error("Errore durante il registro della partecipazione:", participationError.message);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Elenco sondaggi</h2>
      {surveys.length > 0 ? (
        <ul>
          {surveys.map((survey) => (
            <li
              key={survey.id}
              className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm"
            >
              <h3 className="text-lg font-bold">{survey.title}</h3>
              <ul>
                {survey.options.map((option: string, index: number) => (
                  <li key={index} className="ml-4 flex justify-between">
                    <span>{option}</span>
                    <span>
                      {survey.votes[index]} vot{survey.votes[index] === 1 ? 'o' : 'i'}{" "}
                      {user && (
                        <button
                          onClick={() => handleVote(survey.id, index)}
                          className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-md"
                        >
                          Vota
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessun sondaggio disponibile.</p>
      )}
    </div>
  );
}