"use client";

import Link from "next/link";

export default function Home() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-600">Benvenuto!</h1>
                <p className="mt-4 text-lg text-gray-700">
                    Questo è il sito per la creazione e partecipazione ai sondaggi.
                </p>
                <div className="space-x-5">
                    <Link href="/surveys/create">
                        <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Crea un sondaggio
                        </button>
                    </Link>
                    <Link href="/auth/register">
                        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Registrati
                        </button>
                    </Link>
                    <Link href="/auth/login">
                        <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                            Accedi
                        </button>
                    </Link>
                    <Link href="/surveys">
                        <button className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
                            Visualizza sondaggi
                        </button>
                    </Link>
                    <Link href="/profile">
                        <button className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
                            Il tuo profilo
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}