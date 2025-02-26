"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);


    const handleLogin = async () => {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('Errore durante il login:', authError.message);
            setError(authError.message);
        } else {
            alert('Login avvenuto con successo!');
            setEmail('');
            setPassword('');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="p-8 bg-white shadow-md rounded-md w-96">
                <h2 className="text-2xl font-bold mb-4">Accedi al tuo account</h2>
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
                    className="w-full py-2 bg-blue-500 text-white rounded-md"
                >
                    Accedi
                </button>
                <p className="mt-4">
                    Hai dimenticato la password?{' '}
                    <a href="/auth/forgot-password" className="text-blue-500 hover:underline">
                        Clicca qui
                    </a>
                </p>
            </div>
        </div>
    );
}