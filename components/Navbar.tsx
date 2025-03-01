// components/Navbar.tsx
"use client";

import Link from "next/link";
import { supabase } from "../lib/supabase";

interface NavbarProps {
    user: any | null;
}

export default function Navbar({ user }: NavbarProps) {

    // Funzione per effettuare il logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        alert("Logout avvenuto con successo.");
        window.location.href = "/"; // Reindirizza alla home page
    }

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo o Titolo */}
                <Link href="/" className="text-2xl font-bold">
                    VotingApp
                </Link>

                {/* Menu Principale */}
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/surveys" className="hover:text-blue-500 transition-colors">
                            Sondaggi
                        </Link>
                    </li>
                    <li>
                        <Link href="/profile" className="hover:text-blue-500 transition-colors">
                            Profilo
                        </Link>
                    </li>
                    {user ? (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li>
                            <Link
                                href="/auth/login"
                                className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                            >
                                Accedi
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}