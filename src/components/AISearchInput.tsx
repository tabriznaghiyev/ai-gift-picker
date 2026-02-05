"use client";

import { useState } from "react";

interface AISearchInputProps {
    onSearch: (input: string) => void;
    loading: boolean;
    error: string | null;
}

export function AISearchInput({ onSearch, loading, error }: AISearchInputProps) {
    const [input, setInput] = useState("");
    const maxChars = 500;

    const examples = [
        "Birthday gift for my tech-savvy brother who loves gaming, around $50",
        "Anniversary gift for my wife, she loves yoga and reading, budget $100-150",
        "Something for my coworker's baby shower, under $30",
    ];

    return (
        <div className="space-y-4 animate-scale-in">
            <div className="flex justify-between items-center px-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    AI-Powered Search
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">
                    API Key Required
                </span>
            </div>

            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => {
                        const newValue = e.target.value.slice(0, maxChars);
                        setInput(newValue);
                        onSearch(newValue);
                    }}
                    placeholder={`Describe the gift recipient in natural language...\n\nFor example:\n"${examples[0]}"`}
                    className="w-full h-48 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg resize-none placeholder:text-slate-400"
                    autoFocus
                    disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {input.length}/{maxChars}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Info message */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                    💡 <strong>Note:</strong> This AI feature will use natural language processing to understand your gift needs once an API key is configured. For now, you can skip this step or add basic interests.
                </p>
            </div>

            {/* Example prompts */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Try these examples:
                </p>
                <div className="space-y-2">
                    {examples.map((example, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setInput(example);
                                onSearch(example);
                            }}
                            disabled={loading}
                            className="w-full text-left p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💡 {example}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
