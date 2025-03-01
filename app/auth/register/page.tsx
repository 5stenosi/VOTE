// app/auth/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null); // Resetta eventuali errori precedenti

    // Validazione dei campi
    if (!validateEmail(email)) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero."
      );
      return;
    }

    // Effettua la registrazione
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Errore durante la registrazione:", authError.message);
      setError(authError.message || "Impossibile completare la registrazione.");
      return;
    }

    setMessage("Registrazione avvenuta con successo! Attendi la creazione del profilo...");

    // Ascolta il cambiamento di stato di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userId = session.user.id;

        // Crea un record nella tabella profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          avatar_url: null,
        });

        if (profileError) {
          console.error("Errore durante la creazione del profilo:", profileError.message);
          setError("Errore durante la creazione del profilo.");
        } else {
          setMessage("Profilo creato con successo! Controlla la tua email per verificare l'account.");
          setEmail("");
          setPassword("");
        }

        // Rimuovi l'ascoltatore dopo aver completato l'operazione
        subscription.unsubscribe();
      }
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4">Registra un account</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleRegister}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Registrati
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Hai già un account?{" "}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Accedi qui
          </a>
        </p>
      </div>
    </div>
  );
}