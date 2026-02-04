"use client";

import { useState, useEffect } from "react";
import { getSystemStats } from "@/app/actions";

export function SystemVisualizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState<{ productCount: number; status: string } | null>(null);

    useEffect(() => {
        if (isOpen && !stats) {
            getSystemStats().then(setStats);
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-slate-900/90 text-white text-xs font-mono rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 flex items-center gap-2 backdrop-blur-md"
            >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System v2.0
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">System Architecture</h2>
                        <p className="text-slate-400 text-sm">Real-time data flow visualization</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Dataset Size" value="550k+" sub="Products Re-indexed" />
                    <StatCard label="Active Items" value={stats ? stats.productCount.toLocaleString() : "Loading..."} sub="In Database" animate />
                    <StatCard label="ML Model" value="ONNX" sub="Vector Embeddings" />
                    <StatCard label="System Status" value={stats?.status === 'online' ? "OPERATIONAL" : "CONNECTING..."} sub="v2.1.0" color={stats?.status === 'online' ? "text-green-400" : "text-yellow-400"} />
                </div>

                {/* Visual Flow */}
                <div className="relative space-y-8 py-8">
                    {/* Connecting Line */}
                    <div className="absolute left-4/10 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0 -z-10 hidden sm:block" />

                    {/* Step 1: Ingestion */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 group">
                        <div className="w-full sm:w-1/2 text-right space-y-2">
                            <h3 className="text-xl font-bold text-blue-400">1. Data Ingestion</h3>
                            <p className="text-slate-400 text-sm">Raw dataset (550k Amazon products) is parsed, cleaned, and currency-converted (INR to USD).</p>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-glow-blue">
                            📦
                        </div>
                        <div className="w-full sm:w-1/2 text-xs font-mono text-slate-500">
                            prisma/seed.ts<br />scripts/merge_data.py
                        </div>
                    </div>

                    {/* Step 2: Storage */}
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-6 sm:gap-12 group">
                        <div className="w-full sm:w-1/2 text-left space-y-2">
                            <h3 className="text-xl font-bold text-purple-400">2. Vector Storage</h3>
                            <p className="text-slate-400 text-sm">Products are stored in SQLite. Features are extracted for machine learning re-ranking.</p>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-glow-purple">
                            💾
                        </div>
                        <div className="w-full sm:w-1/2 text-right text-xs font-mono text-slate-500">
                            SQLite (Dev)<br />Postgres (Prod)
                        </div>
                    </div>

                    {/* Step 3: Intelligence */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 group">
                        <div className="w-full sm:w-1/2 text-right space-y-2">
                            <h3 className="text-xl font-bold text-emerald-400">3. AI Analysis</h3>
                            <p className="text-slate-400 text-sm">Input is analyzed using Fuzzy Matching & Synonyms (Local) or OpenAI (Cloud) to understand intent.</p>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-glow-emerald">
                            🧠
                        </div>
                        <div className="w-full sm:w-1/2 text-xs font-mono text-slate-500">
                            onnxruntime<br />retrieval.ts
                        </div>
                    </div>

                    {/* Step 4: Recommendation */}
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-6 sm:gap-12 group">
                        <div className="w-full sm:w-1/2 text-left space-y-2">
                            <h3 className="text-xl font-bold text-amber-400">4. Delivery</h3>
                            <p className="text-slate-400 text-sm">Top candidates are re-ranked based on budget, occasion, and aesthetics before serving.</p>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-amber-900/50 border border-amber-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-glow-amber">
                            🎁
                        </div>
                        <div className="w-full sm:w-1/2 text-right text-xs font-mono text-slate-500">
                            Next.js 14<br />React Server Components
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
                    Powered by Antigravity Engine • v2.1.0
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, color = "text-white", animate = false }: { label: string, value: string, sub: string, color?: string, animate?: boolean }) {
    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color} ${animate ? 'animate-pulse-slow' : ''}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-1">{sub}</div>
        </div>
    );
}
