// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null); // Resetta eventuali errori precedenti

    if (!validateEmail(email)) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (!password) {
      setError("Inserisci una password.");
      return;
    }

    // Effettua il login
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Errore durante il login:", authError.message);
      setError(authError.message);
    } else {
      setMessage("Login avvenuto con successo!");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4">Accedi al sito</h2>
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
          onClick={handleLogin}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Accedi
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Non hai un account?{" "}
          <a href="/auth/register" className="text-blue-500 hover:underline">
            Registrati qui
          </a>
        </p>
      </div>
    </div>
  );
}