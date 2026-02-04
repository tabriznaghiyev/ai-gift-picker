"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function InteractiveMascot() {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 10;
            const y = (e.clientY / innerHeight - 0.5) * 10;
            setEyePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none sm:pointer-events-auto group">
            <Link
                href="/showcase"
                className="block relative w-24 h-24 animate-float animate-ring-pulse transition-transform duration-300 hover:scale-110 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="View project info and stats"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse-slow"></div>

                {/* Robot Head */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    {/* Head Shape */}
                    <rect x="20" y="20" width="60" height="50" rx="15" ry="15" fill="white" className="stroke-blue-500" strokeWidth="2" />

                    {/* Antenna */}
                    <line x1="50" y1="20" x2="50" y2="10" stroke="#3B82F6" strokeWidth="3" />
                    <circle cx="50" cy="8" r="4" fill="#3B82F6" className="animate-ping-slow" />
                    <circle cx="50" cy="8" r="4" fill="#60A5FA" />

                    {/* Screen / Face Background */}
                    <rect x="28" y="30" width="44" height="28" rx="8" ry="8" fill="#1e293b" />

                    {/* Eyes Group (Moves with mouse) */}
                    <g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
                        {/* Left Eye */}
                        <circle cx="40" cy="44" r="6" fill="#00e5ff" className="shadow-[0_0_10px_#00e5ff]" />
                        <circle cx="42" cy="42" r="2" fill="white" opacity="0.8" />

                        {/* Right Eye */}
                        <circle cx="60" cy="44" r="6" fill="#00e5ff" className="shadow-[0_0_10px_#00e5ff]" />
                        <circle cx="62" cy="42" r="2" fill="white" opacity="0.8" />
                    </g>

                    {/* Mouth (Smile) */}
                    <path d="M42 52 Q50 58 58 52" stroke="#00e5ff" strokeWidth="2" fill="none" strokeLinecap="round" />

                    {/* Headphones / Ears */}
                    <rect x="15" y="35" width="5" height="20" rx="2" fill="#94a3b8" />
                    <rect x="80" y="35" width="5" height="20" rx="2" fill="#94a3b8" />
                </svg>

                {/* Info badge */}
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-lg">
                    i
                </span>
                {/* Chat Bubble (appears on hover) */}
                <div className="absolute bottom-full right-0 mb-2 w-44 p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tr-none shadow-lg text-xs text-slate-700 dark:text-slate-300 transform scale-0 group-hover:scale-100 transition-transform origin-bottom-right duration-200">
                    I&apos;m here to help! Click me to see project stats &amp; highlights 🚀
                </div>
            </Link>
        </div>
    );
}
