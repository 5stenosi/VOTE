"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Survey {
  id: string;
  title: string;
  options: string[];
  votes: number[];
  hasVoted: boolean; // Flag per indicare se l'utente ha già votato
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const fetchUserAndSurveys = async () => {
      try {
        // Recupera la sessione dell'utente
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Errore durante il recupero della sessione:", sessionError.message);
          return;
        }
        setUser(sessionData?.session?.user || null);

        // Recupera tutti i sondaggi
        const { data: surveysData, error: surveysError } = await supabase.from("surveys").select("*");
        if (surveysError) {
          console.error("Errore durante il recupero dei sondaggi:", surveysError.message);
          return;
        }

        // Recupera i sondaggi votati dall'utente
        const votedSurveysMap: Record<string, boolean> = {};
        if (user) {
          const { data: votedData } = await supabase
            .from("survey_participants")
            .select("survey_id")
            .eq("user_id", user.id);

          votedData?.forEach((voted) => {
            votedSurveysMap[voted.survey_id] = true;
          });
        }

        // Imposta lo stato iniziale dei sondaggi con il flag hasVoted
        setSurveys(
          surveysData.map((survey: any) => {
            let votesArray: number[] = [];

            try {
              // Tenta di parsificare votes come JSON
              votesArray = JSON.parse(JSON.stringify(survey.votes || "[]"));

              // Verifica che votesArray abbia la stessa lunghezza delle opzioni
              if (votesArray.length !== survey.options.length) {
                votesArray = Array(survey.options.length).fill(0); // Inizializza con zeri
              }
            } catch (error) {
              console.error("Errore durante la parsificazione dei voti:", error);
              votesArray = Array(survey.options.length).fill(0); // Inizializza con zeri in caso di errore
            }

            return {
              id: survey.id,
              title: survey.title,
              options: survey.options,
              votes: votesArray,
              hasVoted: !!votedSurveysMap[survey.id],
            };
          })
        );
      } catch (error) {
        console.error("Errore generico durante il caricamento dei sondaggi:", error);
      }
    };

    fetchUserAndSurveys();
  }, []);

  // Gestisci la selezione/deselezione delle opzioni
  const handleOptionToggle = (surveyId: string, optionIndex: number) => {
    if (!user) return;

    setSelectedOptions((prevSelectedOptions) => {
      const currentSurveyOptions = prevSelectedOptions[surveyId] || [];
      const hasOptionSelected = currentSurveyOptions.includes(optionIndex);

      if (hasOptionSelected) {
        return {
          ...prevSelectedOptions,
          [surveyId]: currentSurveyOptions.filter((idx) => idx !== optionIndex),
        };
      } else {
        return {
          ...prevSelectedOptions,
          [surveyId]: [...currentSurveyOptions, optionIndex],
        };
      }
    });
  };

  // Gestisci il voto multiplo
  const handleVote = async (surveyId: string) => {
    if (!user) {
      alert("Devi essere autenticato per votare.");
      return;
    }

    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey || survey.hasVoted) {
      alert("Hai già votato in questo sondaggio.");
      return;
    }

    const optionsSelected = selectedOptions[surveyId];

    if (!optionsSelected || optionsSelected.length === 0) {
      alert("Seleziona almeno un'opzione prima di votare.");
      return;
    }

    // Aggiorna i voti nel sondaggio
    const updatedVotes = survey.votes.map((vote, index) =>
      optionsSelected.includes(index) ? vote + 1 : vote
    );

    // Verifica che la lunghezza dell'array updatedVotes corrisponda alle opzioni
    if (updatedVotes.length !== survey.options.length) {
      console.error("La lunghezza dell'array votes non corrisponde alle opzioni.");
      alert("Si è verificato un errore durante il conteggio dei voti.");
      return;
    }

    // Aggiorna il database con i voti
    const { error: updateError } = await supabase
      .from("surveys")
      .update({ votes: JSON.stringify(updatedVotes) }) // Memorizza i voti come stringa JSON
      .eq("id", surveyId);

    if (updateError) {
      console.error("Errore durante l'aggiornamento dei voti:", updateError.message);
      alert("Impossibile aggiornare i voti. Riprova più tardi.");
      return;
    }

    // Aggiorna lo stato locale
    setSurveys((prevSurveys) =>
      prevSurveys.map((s) =>
        s.id === surveyId
          ? { ...s, votes: updatedVotes, hasVoted: true } // Imposta hasVoted a true
          : s
      )
    );

    // Registra la partecipazione (usa upsert per evitare duplicati)
    const { error: participationError } = await supabase.from("survey_participants").upsert({
      user_id: user.id,
      survey_id: surveyId,
      votes: JSON.stringify(optionsSelected), // Memorizza le opzioni selezionate come stringa JSON
    });

    if (participationError) {
      console.error("Errore durante il registro della partecipazione:", participationError.message);
      alert("Impossibile registrare il voto. Riprova più tardi.");
      return;
    }

    alert("Voto registrato con successo!");
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [surveyId]: [], // Resetta le selezioni dopo aver votato
    }));
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
                  <li
                    key={index}
                    className="ml-4 flex justify-between items-center"
                  >
                    <span>{option}</span>
                    <span>
                      {survey.votes[index]} vot
                      {survey.votes[index] === 1 ? "o" : "i"}{" "}
                      {user && (
                        <input
                          type="checkbox"
                          checked={
                            selectedOptions[survey.id]?.includes(index) || false
                          }
                          disabled={survey.hasVoted} // Disabilita se l'utente ha già votato
                          onChange={() => handleOptionToggle(survey.id, index)}
                          className={`ml-2 cursor-pointer rounded focus:ring-2 focus:ring-blue-500 ${survey.hasVoted && "bg-gray-200 cursor-not-allowed opacity-50"
                            }`}
                        />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {user && !survey.hasVoted && ( // Mostra il bottone solo se l'utente non ha votato
                <button
                  onClick={() => handleVote(survey.id)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
                >
                  Conferma voto
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessun sondaggio disponibile.</p>
      )}
    </div>
  );
}