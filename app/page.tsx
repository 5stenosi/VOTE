"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
    const [hovered, setHovered] = useState<string | null>(null);

    const handleMouseEnter = (id: string) => {
        setHovered(id);
    };

    const handleMouseLeave = () => {
        setHovered(null);
    };

    const getCardClasses = (id: string, baseClasses: string) => {
        return `${baseClasses} ${hovered === id ? '' : ''}`;
    };

    return (
        <div className="h-screen grid grid-cols-6 gap-5 p-8">
            <Link href="/profile" className="col-span-2 row-span-3">
                <div
                    className={getCardClasses('profile', 'w-full h-full bg-purple-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('profile')}
                    onMouseLeave={handleMouseLeave}
                >
                    Il tuo profilo
                </div>
            </Link>
            <Link href="/surveys/create" className="col-span-4">
                <div
                    className={getCardClasses('create', 'w-full h-full bg-blue-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('create')}
                    onMouseLeave={handleMouseLeave}
                >
                    Crea un sondaggio
                </div>
            </Link>
            <Link href="/surveys" className="col-span-4">
                <div
                    className={getCardClasses('surveys', 'w-full h-full bg-purple-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('surveys')}
                    onMouseLeave={handleMouseLeave}
                >
                    Visualizza sondaggi
                </div>
            </Link>
            <Link href="/auth/friends" className="col-span-2">
                <div
                    className={getCardClasses('friends', 'w-full h-full bg-green-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('friends')}
                    onMouseLeave={handleMouseLeave}
                >
                    Amici
                </div>
            </Link>
            <Link href="/auth/register" className="col-span-1">
                <div
                    className={getCardClasses('register', 'w-full h-full bg-blue-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('register')}
                    onMouseLeave={handleMouseLeave}
                >
                    Registrati
                </div>
            </Link>
            <Link href="/auth/login" className="col-span-1">
                <div
                    className={getCardClasses('login', 'w-full h-full bg-green-500 text-white p-6 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300')}
                    onMouseEnter={() => handleMouseEnter('login')}
                    onMouseLeave={handleMouseLeave}
                >
                    Accedi
                </div>
            </Link>
        </div>
    )
}

// return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="text-center">
//             <h1 className="text-4xl font-bold text-blue-600">Benvenuto!</h1>
//             <p className="mt-4 text-lg text-gray-700">
//                 Questo è il sito per la creazione e partecipazione ai sondaggi.
//             </p>
//             <div className="space-x-5">
//                 <Link href="/surveys/create">
//                     <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//                         Crea un sondaggio
//                     </button>
//                 </Link>
//                 <Link href="/auth/register">
//                     <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//                         Registrati
//                     </button>
//                 </Link>
//                 <Link href="/auth/login">
//                     <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
//                         Accedi
//                     </button>
//                 </Link>
//                 <Link href="/surveys">
//                     <button className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
//                         Visualizza sondaggi
//                     </button>
//                 </Link>
//                 <Link href="/profile">
//                     <button className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
//                         Il tuo profilo
//                     </button>
//                 </Link>
//             </div>
//         </div>
//     </div>
// );