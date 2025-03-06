"use client"; // Aggiungi questa direttiva

import { useState } from "react";

interface Card3DProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void; // Aggiungi una prop opzionale per gestire l'evento onClick
}

export default function Card3D({ id, children, className, onClick }: Card3DProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseEnter = () => {
        setHovered(id);
    };

    const handleMouseLeave = () => {
        setHovered(null);
        setMousePosition({ x: 0, y: 0 });
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = (y / rect.height) * 2 - 1;
        setMousePosition({ x: normalizedX, y: normalizedY });
    };

    const getCardStyle = () => {
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

    const getReflectionStyle = () => {
        if (hovered === id) {
            return {
                transform: `rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
                opacity: 0.5,
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            };
        }
        return {
            opacity: 0,
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        };
    };

    return (
        <div
            className={`group w-full h-full bg-white border-1 border-stone-200 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300 overflow-hidden ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={onClick} // Passa l'evento onClick qui
            style={getCardStyle()}
        >
            {/* Elemento di riflesso */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                style={getReflectionStyle()}
            ></div>

            {/* Contenuto della card */}
            {children}
        </div>
    );
}