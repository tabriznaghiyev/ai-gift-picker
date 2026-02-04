"use client";

import { useState } from "react";
import {
  OCCASIONS,
  RELATIONSHIPS,
  AGE_RANGES,
  type QuizForm,
  type Occasion,
  type Relationship,
  type AgeRange,
} from "@/types/quiz";
import { ResultsView } from "@/components/ResultsView";
import { InteractiveMascot } from "@/components/InteractiveMascot";

// Simplified to 4 essential steps
const STEPS = [
  { key: "occasion", title: "What's the occasion?", subtitle: "Let's find the perfect gift" },
  { key: "relationship", title: "Who is this gift for?", subtitle: "Tell us about your relationship" },
  { key: "age_range", title: "Their age range?", subtitle: "Helps us match the right vibe" },
  { key: "budget", title: "What's your budget?", subtitle: "We'll find options in your range" },
] as const;

const defaultForm: QuizForm = {
  occasion: "birthday",
  relationship: "friend",
  age_range: "25-34",
  budget_min: 20,
  budget_max: 80,
  interests: [],
  daily_life: [],
  avoid_list: [],
  notes: "",
};

export default function Home() {
  const [form, setForm] = useState<QuizForm>(defaultForm);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchRecommend>> | null>(null);

  async function fetchRecommend(body: QuizForm) {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || res.statusText);
    }
    return res.json();
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setError(null);
      fetchRecommend(form)
        .then(setResult)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Smart age filtering based on relationship
  const getValidAgeRanges = (relationship: Relationship) => {
    const ageMap: Record<Relationship, AgeRange[]> = {
      child: ["0-12", "13-17", "18-24"], // Toddlers/Kids/Teens + Young Adult children
      parent: ["35-44", "45-54", "55+"], // Parents generally older
      partner: ["18-24", "25-34", "35-44", "45-54", "55+"], // Partners must be adults
      coworker: ["18-24", "25-34", "35-44", "45-54", "55+"], // Work colleagues usually adults
      friend: ["0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"], // Friends can be any age (including kids)
      sibling: ["0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"], // Siblings any age
      other: ["0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
    };
    // Fallback if specific relationship not in map
    return ageMap[relationship] || AGE_RANGES.map(r => r.value);
  };

  const validAges = getValidAgeRanges(form.relationship);
  const isAgeValid = (age: AgeRange) => validAges.includes(age);

  if (result) {
    return (
      <ResultsView
        data={result}
        onChangeOptions={() => {
          setResult(null);
          setStep(0);
        }}
      />
    );
  }

  const currentKey = STEPS[step].key;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Interactive Mascot */}
      <InteractiveMascot />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-in">
          <div className="inline-block mb-4">
            <div className="text-5xl sm:text-6xl mb-4 animate-float">🎁</div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 gradient-text">
            Gift Finder
          </h1>
          <p className="text-lg sm:text-xl text-white/80">
            Discover the perfect gift in seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-500 ${i <= step
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-glow"
                  : "bg-white/20"
                  }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm text-center">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 mb-6 animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {STEPS[step].title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {STEPS[step].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentKey === "occasion" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OCCASIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 card-hover ${form.occasion === value
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-glow"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="occasion"
                      checked={form.occasion === value}
                      onChange={() => setForm((f) => ({ ...f, occasion: value as Occasion }))}
                      className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {label}
                    </span>
                    {form.occasion === value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse-slow" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}

            {currentKey === "relationship" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RELATIONSHIPS.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 card-hover ${form.relationship === value
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-glow"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="relationship"
                      checked={form.relationship === value}
                      onChange={() => {
                        const newRel = value as Relationship;
                        const validForNewRel = getValidAgeRanges(newRel);

                        // If current age is invalid for new relationship, auto-select the first valid one
                        const newAge = validForNewRel.includes(form.age_range) ? form.age_range : validForNewRel[0];

                        setForm((f) => ({
                          ...f,
                          relationship: newRel,
                          age_range: newAge
                        }));
                      }}
                      className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {label}
                    </span>
                    {form.relationship === value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse-slow" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}

            {currentKey === "age_range" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AGE_RANGES.map(({ value, label }) => {
                  const isValid = isAgeValid(value as AgeRange);
                  const isSelected = form.age_range === value;

                  return (
                    <label
                      key={value}
                      className={`relative flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${!isValid
                        ? "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-40 cursor-not-allowed"
                        : isSelected
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-glow cursor-pointer card-hover"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-white/50 dark:hover:bg-slate-800/50 cursor-pointer card-hover"
                        }`}
                    >
                      <input
                        type="radio"
                        name="age_range"
                        checked={isSelected}
                        onChange={() => isValid && setForm((f) => ({ ...f, age_range: value as AgeRange }))}
                        disabled={!isValid}
                        className="sr-only"
                      />
                      <span className={`text-xl font-bold ${isValid ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600 line-through'}`}>
                        {label}
                      </span>
                      {!isValid && (
                        <div className="absolute top-1 right-1">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {isValid && isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse-slow" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {currentKey === "budget" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                  <div className="w-full sm:w-auto">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Minimum
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-600">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={form.budget_min}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            budget_min: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full sm:w-32 pl-10 pr-4 py-4 text-2xl font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="text-3xl text-slate-400 dark:text-slate-600">—</div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Maximum
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-600">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={form.budget_max}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            budget_max: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full sm:w-32 pl-10 pr-4 py-4 text-2xl font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We'll find great options in your price range
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Navigation Buttons (Sticky Bottom) */}
          <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 rounded-b-3xl z-10 flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 px-8 py-4 rounded-2xl btn-gradient text-white text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Finding perfect gifts...
                </span>
              ) : step === STEPS.length - 1 ? (
                "Find My Perfect Gifts ✨"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm">
          <p>Personalized recommendations in seconds • 100% free</p>
        </div>
      </div>
    </main>
  );
}
