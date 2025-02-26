"use client";

import '../styles/styles.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children} {/* Renderizza le pagine figlie */}
            </body>
        </html>
    );
}