// app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Nuovo campo per l'username
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setError("Inserisci un indirizzo email valida.");
      return;
    }
  
    if (!validatePassword(password)) {
      setError(
        "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero."
      );
      return;
    }
  
    if (!validateUsername(username)) {
      setError("L'username deve contenere almeno 3 caratteri e non può contenere spazi.");
      return;
    }
  
    // Verifica se l'username è già in uso
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username);
  
    if (checkError) {
      console.error("Errore durante la verifica dell'username:", checkError.message);
      setError("Impossibile verificare l'username. Riprova più tardi.");
      return;
    }
  
    if (existingUsers && existingUsers.length > 0) {
      setError("Questo username è già in uso. Scegline uno diverso.");
      return;
    }
  
    // Effettua la registrazione
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (authError || !authData.user) {
      console.error("Errore durante la registrazione:", authError?.message);
      setError(authError?.message || "Impossibile completare la registrazione.");
      return;
    }
  
    const userId = authData.user.id; // Ottieni l'ID dell'utente appena registrato
  
    // Attendi la conferma della sessione
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !sessionData.session || !sessionData.session.user) {
      console.error("Impossibile recuperare la sessione dell'utente.");
      setError("Errore durante la creazione del profilo.");
      return;
    }
  
    // Crea un record nella tabella profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId, // Usa l'ID restituito da Supabase
      username: username.trim(),
      full_name: "",
      avatar_url: null,
    });
  
    if (profileError) {
      console.error("Errore durante la creazione del profilo:", profileError.message);
      setError("Errore durante la creazione del profilo.");
    } else {
      setMessage("Registrazione avvenuta con successo! Verifica la tua email.");
      setEmail("");
      setPassword("");
      setUsername("");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Almeno 3 caratteri, solo lettere, numeri e underscore
    return usernameRegex.test(username);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4">Registra un account</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
        />
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