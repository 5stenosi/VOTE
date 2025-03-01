"use client";

import "../styles/styles.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js"; // Importa il tipo User

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null); // Sostituisci any con User

  useEffect(() => {
    const checkUser = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Errore durante il recupero della sessione:", sessionError.message);
        return;
      }
      setUser(sessionData?.session?.user || null);
    };

    checkUser();

    // Ascolta i cambiamenti di stato di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    }; // Rimuovi l'ascoltatore quando il componente viene dismontato
  }, []);

  return (
    <html lang="en">
      <body>
        {/* Navbar inclusa in tutte le pagine */}
        <Navbar user={user} />
        {/* Contenuto delle pagine */}
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}