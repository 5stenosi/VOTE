"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ConfirmEmailPage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage("Devi essere registrato per visualizzare questa pagina.");
        return;
      }

      const session = data.session;

      if (session.user.email_confirmed_at) {
        setMessage("Il tuo account è già stato verificato.");
      } else {
        setMessage(
          "Ti abbiamo inviato una mail per verificare il tuo account. Controlla la tua casella di posta."
        );
      }
    };

    checkUser();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4">Conferma Email</h2>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}