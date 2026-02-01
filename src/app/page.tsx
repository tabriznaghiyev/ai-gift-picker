"use client";

import { useState } from "react";
import {
  OCCASIONS,
  RELATIONSHIPS,
  AGE_RANGES,
  DAILY_LIFE_OPTIONS,
  type QuizForm,
  type Occasion,
  type Relationship,
  type AgeRange,
  type DailyLife,
} from "@/types/quiz";
import { ResultsView } from "@/components/ResultsView";

const STEPS = [
  { key: "occasion", title: "What's the occasion?" },
  { key: "relationship", title: "Who is it for?" },
  { key: "age_range", title: "Age range?" },
  { key: "budget", title: "Budget (min–max $)?" },
  { key: "interests", title: "Interests (add any that apply)" },
  { key: "daily_life", title: "Daily life / lifestyle" },
  { key: "avoid", title: "Anything to avoid? Notes?" },
] as const;

const defaultForm: QuizForm = {
  occasion: "birthday",
  relationship: "friend",
  age_range: "25-34",
  budget_min: 15,
  budget_max: 50,
  interests: [],
  daily_life: [],
  avoid_list: [],
  notes: "",
};

export default function Home() {
  const [form, setForm] = useState<QuizForm>(defaultForm);
  const [step, setStep] = useState(0);
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchRecommend>> | null>(null);

  async function fetchRecommend(body: QuizForm) {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occasion: body.occasion,
        relationship: body.relationship,
        age_range: body.age_range,
        budget_min: body.budget_min,
        budget_max: body.budget_max,
        interests: body.interests,
        daily_life: body.daily_life,
        avoid_list: body.avoid_list,
        notes: body.notes,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || res.statusText);
    }
    return res.json();
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      setLoading(true);
      setError(null);
      fetchRecommend(form)
        .then(setResult)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const addInterest = () => {
    const v = interestInput.trim();
    if (v && !form.interests.includes(v)) {
      setForm((f) => ({ ...f, interests: [...f.interests, v] }));
      setInterestInput("");
    }
  };

  const removeInterest = (v: string) => {
    setForm((f) => ({ ...f, interests: f.interests.filter((x) => x !== v) }));
  };

  if (result) {
    return (
      <ResultsView
        data={result}
        onChangeOptions={() => {
          setResult(null);
          setStep(0);
          // Keep current form so they can change options without losing answers
        }}
      />
    );
  }

  const currentKey = STEPS[step].key;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-lg mx-auto px-4 py-10">
        <header className="text-center mb-8 relative">
          <span className="absolute top-0 right-0 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            Test site
          </span>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Gift Finder
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Answer a few questions — we’ll suggest ideas that fit
          </p>
        </header>

        <div className="mb-6">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-md border border-amber-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            {STEPS[step].title}
          </h2>

        {currentKey === "occasion" && (
          <div className="space-y-2">
            {OCCASIONS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.occasion === value
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="occasion"
                  checked={form.occasion === value}
                  onChange={() => setForm((f) => ({ ...f, occasion: value as Occasion }))}
                  className="rounded-full border-slate-300 text-amber-500"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        )}

        {currentKey === "relationship" && (
          <div className="space-y-2">
            {RELATIONSHIPS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.relationship === value
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="relationship"
                  checked={form.relationship === value}
                  onChange={() => setForm((f) => ({ ...f, relationship: value as Relationship }))}
                  className="rounded-full border-slate-300 text-amber-500"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        )}

        {currentKey === "age_range" && (
          <div className="space-y-2">
            {AGE_RANGES.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.age_range === value
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="age_range"
                  checked={form.age_range === value}
                  onChange={() => setForm((f) => ({ ...f, age_range: value as AgeRange }))}
                  className="rounded-full border-slate-300 text-amber-500"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        )}

        {currentKey === "budget" && (
          <div className="flex gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Min $</label>
              <input
                type="number"
                min={0}
                max={10000}
                value={form.budget_min}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget_min: Math.max(0, parseInt(e.target.value, 10) || 0) }))
                }
                className="w-28 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Max $</label>
              <input
                type="number"
                min={0}
                max={10000}
                value={form.budget_max}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget_max: Math.max(0, parseInt(e.target.value, 10) || 0) }))
                }
                className="w-28 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        )}

        {currentKey === "interests" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. cooking, gaming, travel"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
              >
                Add
              </button>
            </div>
            {form.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.interests.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-sm font-medium text-amber-800 dark:text-amber-200"
                  >
                    {v}
                    <button
                      type="button"
                      onClick={() => removeInterest(v)}
                      className="text-amber-600 hover:text-amber-800 rounded-full p-0.5"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {currentKey === "daily_life" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {DAILY_LIFE_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.daily_life.includes(value)
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.daily_life.includes(value)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      daily_life: e.target.checked
                        ? [...f.daily_life, value as DailyLife]
                        : f.daily_life.filter((x) => x !== value),
                    }))
                  }
                  className="rounded border-slate-300 text-amber-500"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        )}

        {currentKey === "avoid" && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Things to avoid (e.g. alcohol, sweets)"
              value={form.avoid_list.join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  avoid_list: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                }))
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 focus:ring-2 focus:ring-amber-400"
            />
            <textarea
              placeholder="Any extra notes (1–2 sentences)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value.slice(0, 500) }))}
              rows={3}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 resize-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 px-5 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 shadow-md"
        >
          {loading ? "Finding gifts…" : step === STEPS.length - 1 ? "Get my ideas" : "Continue"}
        </button>
      </div>
      </div>
    </main>
  );
}
