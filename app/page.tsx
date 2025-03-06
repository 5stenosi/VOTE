"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "../components/ProfileContext";
import { supabase } from "../lib/supabase";
import { FiLogOut, FiLogIn, FiUserPlus } from "react-icons/fi";

export default function Home() {
    const { profile, loading: profileLoading } = useProfile();
    const [hovered, setHovered] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseEnter = (id: string) => {
        setHovered(id);
    };

    const handleMouseLeave = () => {
        setHovered(null);
        setMousePosition({ x: 0, y: 0 });
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, id: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = (y / rect.height) * 2 - 1;
        setMousePosition({ x: normalizedX, y: normalizedY });
    };

    const getCardStyle = (id: string) => {
        if (hovered === id) {
            return {
                transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg) scale(1.05)`,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
            };
        }
        return {
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        };
    };

    const getReflectionStyle = (id: string) => {
        if (hovered === id) {
            return {
                transform: `rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg) scale(1.05)`,
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            };
        }
        return {
            opacity: 0,
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        };
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        alert("Logout avvenuto con successo.");
        window.location.href = "/"; // Reindirizza alla home page
    }

    return (
        <div className="h-screen bg-stone-100 grid grid-cols-6 grid-rows-3 gap-5 p-10 overflow-hidden">
            {/* Card del Profilo */}
            <Link href="/profile" className="col-span-2 row-span-2">
                <div
                    className="group w-full h-full bg-white border-1 border-stone-200 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300 overflow-hidden"
                    onMouseEnter={() => handleMouseEnter('profile')}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(e) => handleMouseMove(e, 'profile')}
                    style={getCardStyle('profile')}>

                    {/* Parte superiore colorata */}
                    <div className="absolute w-full h-2/5 bg-oxley-400 -z-10"></div>

                    {/* Elemento di riflesso */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                        style={getReflectionStyle('profile')}>
                    </div>

                    {/* Contenuto della card */}
                    <div className="flex flex-col justify-between items-center h-full p-4">
                        <div className="w-full flex flex-col grow justify-center items-center gap-3">
                            {profile && profile.avatar_url && (
                                <img src={profile.avatar_url} alt="Avatar" className="aspect-square min-w-32 w-2/5 rounded-full border-4 outline-4 outline-oxley-400 border-white" />
                            )}
                            <h1 className="text-4xl font-medium text-center bg-white rounded-2xl p-2">
                                {profileLoading ? "Caricamento..." : profile ? `${profile.username}` : "Accedi per vedere il tuo profilo"}</h1>
                        </div>
                        {/* Statistiche */}
                        <div className="flex flex-col text-sm lg:flex-row lg:items-end">
                            <p className="translate-y-40 px-4 pb-2 text-center border-black/25 border-b-1 lg:border-r-1 lg:border-b-0 lg:pb-0
                                          group-hover:translate-y-0 transition duration-300">
                                3 <span className="hidden lg:inline"><br /></span>survey</p>

                            <p className="translate-y-40 px-4 py-2 text-center border-black/25 lg:border-y-0 lg:py-0
                                          group-hover:translate-y-0 delay-200 transition duration-300">
                                2 <span className="hidden lg:inline"><br /></span>partecipazioni</p>

                            <p className="translate-y-40 px-4 pt-2 text-center border-black/25 border-t-1 lg:border-l-1 lg:border-t-0 lg:pt-0
                                          group-hover:translate-y-0 delay-400 transition duration-300">
                                1 <span className="hidden lg:inline"><br /></span>voti</p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Card "Crea un sondaggio" */}
            <Link href="/surveys/create" className="col-span-2 row-span-2">
                <div
                    className="w-full h-full bg-blue-500 text-white p-4 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300"
                    onMouseEnter={() => handleMouseEnter('create')}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(e) => handleMouseMove(e, 'create')}
                    style={getCardStyle('create')}
                >
                    {/* Elemento di riflesso */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                        style={getReflectionStyle('profile')}>
                    </div>

                    {/* Contenuto della card */}
                    Crea un sondaggio
                </div>
            </Link>

            {/* Card "Visualizza sondaggi" */}
            <Link href="/surveys" className="col-span-2 row-span-3">
                <div
                    className="w-full h-full bg-purple-500 text-white p-4 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300"
                    onMouseEnter={() => handleMouseEnter('surveys')}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(e) => handleMouseMove(e, 'surveys')}
                    style={getCardStyle('surveys')}
                >
                    {/* Elemento di riflesso */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                        style={getReflectionStyle('profile')}>
                    </div>

                    {/* Contenuto della card */}
                    Visualizza sondaggi
                </div>
            </Link>

            {/* Card "Logout" */}
            {profile && (
                <button onClick={handleLogout} className="col-span-1">
                    <div
                        className="group w-full h-full bg-white border-1 border-stone-200 flex justify-center items-center p-4 rounded-lg shadow-md cursor-pointer overflow-hidden transform transition duration-300"
                        onMouseEnter={() => handleMouseEnter('logout')}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={(e) => handleMouseMove(e, 'logout')}
                        style={getCardStyle('logout')}
                    >
                        {/* Elemento di riflesso */}
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                            style={getReflectionStyle('profile')}>
                        </div>

                        <FiLogOut className="min-w-10 w-2/5 min-h-10 h-2/5 group-hover:text-white transition-all duration-300
                                                motion-preset-wobble-md motion-duration-1500 motion-paused group-hover:motion-running" />
                        <div className="-z-10 absolute w-full h-full bg-white group-hover:bg-red-500 transition duration-300"></div>
                    </div>
                </button>
            )}

            {/* Card "Registrati" */}
            {!profile && (
                <Link href="/auth/register" className="col-span-1">
                    <div
                        className="group w-full h-full bg-white border-1 border-stone-200 flex justify-center items-center p-4 rounded-lg shadow-md cursor-pointer overflow-hidden transform transition duration-300"
                        onMouseEnter={() => handleMouseEnter('register')}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={(e) => handleMouseMove(e, 'register')}
                        style={getCardStyle('register')}
                    >
                        {/* Elemento di riflesso */}
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                            style={getReflectionStyle('profile')}>
                        </div>

                        <FiUserPlus className="min-w-10 w-2/5 min-h-10 h-2/5 group-hover:text-white transition-all duration-300
                                            motion-preset-pulse  motion-duration-1500 motion-paused group-hover:motion-running" />
                        <div className="-z-10 absolute w-full h-full bg-white group-hover:bg-energy-yellow-400 transition duration-300"></div>
                    </div>
                </Link>
            )}

            {/* Card "Accedi" */}
            {!profile && (
                <Link href="/auth/login" className="col-span-1">
                    <div
                        className="group w-full h-full bg-white border-1 border-stone-200 flex justify-center items-center p-4 rounded-lg shadow-md cursor-pointer overflow-hidden transform transition duration-300"
                        onMouseEnter={() => handleMouseEnter('login')}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={(e) => handleMouseMove(e, 'login')}
                        style={getCardStyle('login')}
                    >
                        {/* Elemento di riflesso */}
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                            style={getReflectionStyle('profile')}>
                        </div>

                        <FiLogIn className="min-w-10 w-2/5 min-h-10 h-2/5 group-hover:text-white transition-all duration-300
                                        motion-preset-wobble-md motion-duration-1500 motion-paused group-hover:motion-running" />
                        <div className="-z-10 absolute w-full h-full bg-white group-hover:bg-oxley-500 transition duration-300"></div>
                    </div>
                </Link>
            )}

            {/* Card "Amici" */}
            <Link href="/auth/friends" className={profile ? "col-span-3" : "col-span-2"}>
                <div
                    className="w-full h-full bg-green-500 text-white p-4 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300"
                    onMouseEnter={() => handleMouseEnter('friends')}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(e) => handleMouseMove(e, 'friends')}
                    style={getCardStyle('friends')}
                >
                    {/* Elemento di riflesso */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                        style={getReflectionStyle('profile')}>
                    </div>

                    {/* Contenuto della card */}
                    Amici
                </div>
            </Link>
        </div>
    );
}