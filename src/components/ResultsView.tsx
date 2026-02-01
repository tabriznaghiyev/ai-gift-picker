"use client";

import { useState } from "react";
import { getGiftImageUrl } from "@/lib/giftImage";

type ResultItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price_min: number;
  price_max: number;
  amazon_url: string | null;
  image_url: string | null;
  product_id: string;
  score: number;
  why_bullets: [string, string, string];
  best_for_label: string;
};

type StepItem = {
  step: number;
  title: string;
  description: string;
};

type ResultsData = {
  session_id: string;
  profile: { recipient_summary?: string };
  top_3: ResultItem[];
  alternatives_3: ResultItem[];
  steps?: StepItem[];
};

export function ResultsView({
  data,
  onChangeOptions,
}: {
  data: ResultsData;
  onChangeOptions: () => void;
}) {
  const top_3 = Array.isArray(data?.top_3) ? data.top_3 : [];
  const alternatives_3 = Array.isArray(data?.alternatives_3) ? data.alternatives_3 : [];
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const [showSteps, setShowSteps] = useState(true);

  if (top_3.length === 0 && alternatives_3.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No recommendations yet. Try widening your budget or interests.
          </p>
          <button
            type="button"
            onClick={onChangeOptions}
            className="px-6 py-3 rounded-full bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-md"
          >
            Change my options
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 relative">
          <span className="absolute top-0 right-0 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            Test site
          </span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Your gift ideas
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowSteps((s) => !s)}
              className="px-4 py-2 rounded-full text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {showSteps ? "Hide" : "Show"} how we picked these
            </button>
            <button
              type="button"
              onClick={onChangeOptions}
              className="px-5 py-2 rounded-full bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-md"
            >
              Change my options
            </button>
          </div>
        </header>

        {/* Behind the scenes */}
        {showSteps && steps.length > 0 && (
          <section className="mb-10 p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-amber-500">✦</span> How we picked these
            </h2>
            <ol className="space-y-4">
              {steps.map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold text-sm">
                    {s.step}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{s.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Top 3 */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Top 3 picks
          </h2>
          <div className="space-y-4">
            {top_3.map((item) => (
              <GiftCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* More ideas */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            More ideas
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {alternatives_3.map((item) => (
              <GiftCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>

        <p className="text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-6">
          Price and availability may change — check on Amazon before purchasing.
        </p>
      </div>
    </main>
  );
}

function GiftCard({
  item,
  compact = false,
}: {
  item: ResultItem;
  compact?: boolean;
}) {
  const price =
    item.price_min === item.price_max
      ? `$${item.price_min}`
      : `$${item.price_min}–$${item.price_max}`;
  const imgSrc = getGiftImageUrl(item.category, item.image_url);

  if (compact) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
        <img
          src={imgSrc}
          alt=""
          className="w-full h-24 object-contain rounded-xl mb-3 bg-amber-50 dark:bg-slate-700"
        />
        <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{item.category}</p>
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1">{price}</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{item.best_for_label}</p>
        {item.amazon_url ? (
          <a
            href={item.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline"
          >
            View on Amazon →
          </a>
        ) : (
          <span className="mt-2 inline-block text-xs text-slate-400">Link unavailable</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-5">
        <img
          src={imgSrc}
          alt=""
          className="w-28 h-28 object-contain rounded-xl bg-amber-50 dark:bg-slate-700 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            Best for: {item.best_for_label}
          </p>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
            {item.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {item.category}
            {item.tags.length > 0 && ` · ${item.tags.slice(0, 3).join(", ")}`}
          </p>
          <p className="text-base font-medium text-amber-600 dark:text-amber-400 mt-1">{price}</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
            {Array.isArray(item.why_bullets)
              ? item.why_bullets.map((b, i) => <li key={i}>{b}</li>)
              : null}
          </ul>
          {item.amazon_url ? (
            <a
              href={item.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
            >
              View on Amazon →
            </a>
          ) : (
            <span className="mt-4 inline-block text-sm text-slate-400">Link unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
