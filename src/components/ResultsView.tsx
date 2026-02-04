"use client";

import { useState } from "react";
import { getGiftImageUrl } from "@/lib/giftImage";
import type { QuizForm } from "@/types/quiz";

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
  quiz_form?: QuizForm;
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
  const quizForm = data?.quiz_form;
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Calculate match percentages
  const allItems = [...top_3, ...alternatives_3];
  const maxScore = Math.max(...allItems.map(i => i.score), 1);
  const getMatchPercentage = (score: number) => Math.round((score / maxScore) * 100);

  if (top_3.length === 0 && alternatives_3.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl shadow-xl p-8 max-w-md text-center animate-scale-in">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold gradient-text mb-3">No matches found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Try widening your budget or changing your preferences
          </p>
          <button
            type="button"
            onClick={onChangeOptions}
            className="px-6 py-3 rounded-2xl btn-gradient text-white font-semibold"
          >
            Change Options
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12 animate-slide-in">
          <div className="inline-block mb-4">
            <div className="text-5xl mb-3 animate-float">✨</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">
            Your Perfect Gifts
          </h1>
          <p className="text-lg text-white/80 mb-6">
            {top_3.length + alternatives_3.length} personalized recommendations
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => setShowAnalysis((s) => !s)}
              className="px-5 py-3 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
            >
              {showAnalysis ? "Hide" : "Show"} Analysis
            </button>
            <button
              type="button"
              onClick={onChangeOptions}
              className="px-6 py-3 rounded-2xl btn-gradient text-white font-bold shadow-lg"
            >
              Change Options
            </button>
          </div>
        </header>

        {/* Analysis Section - Show Quiz Choices vs Results */}
        {showAnalysis && quizForm && (
          <section className="mb-10 glass rounded-3xl p-6 sm:p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Your Choices vs Recommendations
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Your Quiz Choices */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <span>📝</span> What You Told Us
                </h3>
                <div className="space-y-3">
                  <ChoiceItem label="Occasion" value={formatOccasion(quizForm.occasion)} />
                  <ChoiceItem label="Relationship" value={formatRelationship(quizForm.relationship)} />
                  <ChoiceItem label="Age Range" value={quizForm.age_range} />
                  <ChoiceItem
                    label="Budget"
                    value={`$${quizForm.budget_min} - $${quizForm.budget_max}`}
                  />
                  {quizForm.interests.length > 0 && (
                    <ChoiceItem
                      label="Interests"
                      value={quizForm.interests.join(", ")}
                    />
                  )}
                  {quizForm.daily_life.length > 0 && (
                    <ChoiceItem
                      label="Lifestyle"
                      value={quizForm.daily_life.join(", ")}
                    />
                  )}
                </div>
              </div>

              {/* Right: Top 3 Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-pink-600 dark:text-pink-400 mb-4 flex items-center gap-2">
                  <span>🎯</span> What We Found (Top 3)
                </h3>
                <div className="space-y-3">
                  {top_3.map((item, idx) => (
                    <ResultItem
                      key={item.id}
                      rank={idx + 1}
                      title={item.title}
                      price={`$${item.price_min}${item.price_min !== item.price_max ? `-$${item.price_max}` : ''}`}
                      matchPercent={getMatchPercentage(item.score)}
                      category={item.category}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Match Summary */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Analysis:</strong> Our algorithm matched your preferences with products that fit your
                <strong> ${quizForm.budget_min}-${quizForm.budget_max}</strong> budget,
                suitable for <strong>{formatRelationship(quizForm.relationship)}</strong> aged <strong>{quizForm.age_range}</strong>,
                perfect for <strong>{formatOccasion(quizForm.occasion)}</strong>.
                {quizForm.interests.length > 0 && (
                  <> Aligned with interests: <strong>{quizForm.interests.slice(0, 3).join(", ")}</strong>.</>
                )}
              </p>
            </div>
          </section>
        )}

        {/* How We Picked Section */}
        {steps.length > 0 && (
          <section className="mb-10 glass rounded-3xl p-6 sm:p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              How Our Algorithm Worked
            </h2>
            <ol className="space-y-4">
              {steps.map((s, idx) => (
                <li key={s.step} className="flex gap-4" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{s.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Top 3 Picks */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Top 3 Matches
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {top_3.map((item, idx) => (
              <GiftCard
                key={item.id}
                item={item}
                matchPercentage={getMatchPercentage(item.score)}
                rank={idx + 1}
                animationDelay={idx * 100}
              />
            ))}
          </div>
        </section>

        {/* More Ideas */}
        {alternatives_3.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              More Great Options
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives_3.map((item, idx) => (
                <GiftCard
                  key={item.id}
                  item={item}
                  matchPercentage={getMatchPercentage(item.score)}
                  animationDelay={(top_3.length + idx) * 100}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center text-white/60 text-sm mt-12">
          <p>Prices may vary • Check availability on retailer sites</p>
        </div>
      </div>
    </main>
  );
}

// Helper component for quiz choices
function ChoiceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}:</span>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

// Helper component for result items in analysis
function ResultItem({ rank, title, price, matchPercent, category }: {
  rank: number;
  title: string;
  price: string;
  matchPercent: number;
  category: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-700">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm">
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-pink-600 dark:text-pink-400">{price}</span>
          <span className="text-xs text-green-600 dark:text-green-400">• {matchPercent}% match</span>
        </div>
      </div>
    </div>
  );
}

// Format helpers
function formatOccasion(occasion: string): string {
  const map: Record<string, string> = {
    "birthday": "Birthday",
    "anniversary": "Anniversary",
    "housewarming": "Housewarming",
    "graduation": "Graduation",
    "thank-you": "Thank You",
    "holiday": "Holiday",
    "baby-shower": "Baby Shower",
    "other": "Other",
  };
  return map[occasion] || occasion;
}

function formatRelationship(relationship: string): string {
  const map: Record<string, string> = {
    "friend": "Friend",
    "partner": "Partner",
    "parent": "Parent",
    "coworker": "Coworker",
    "sibling": "Sibling",
    "child": "Child",
    "other": "Other",
  };
  return map[relationship] || relationship;
}

// Gift Card component (same as before)
function GiftCard({
  item,
  matchPercentage,
  rank,
  animationDelay = 0,
}: {
  item: ResultItem;
  matchPercentage: number;
  rank?: number;
  animationDelay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const price =
    item.price_min === item.price_max
      ? `$${item.price_min}`
      : `$${item.price_min}–$${item.price_max}`;
  const imgSrc = getGiftImageUrl(item.category, item.image_url);

  const getMatchLevel = (percentage: number) => {
    if (percentage >= 90) return { label: "Perfect Match", color: "from-green-500 to-emerald-500", emoji: "🎯" };
    if (percentage >= 75) return { label: "Great Match", color: "from-purple-500 to-pink-500", emoji: "✨" };
    if (percentage >= 60) return { label: "Good Match", color: "from-blue-500 to-cyan-500", emoji: "👍" };
    return { label: "Worth Considering", color: "from-slate-500 to-slate-600", emoji: "💭" };
  };

  const matchLevel = getMatchLevel(matchPercentage);

  return (
    <div
      className="glass rounded-3xl p-6 shadow-xl transition-all duration-500 card-hover animate-scale-in group"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {rank && (
        <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg animate-pulse-slow">
          #{rank}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{matchLevel.emoji}</span>
          <div>
            <div className={`text-xs font-semibold bg-gradient-to-r ${matchLevel.color} bg-clip-text text-transparent`}>
              {matchLevel.label}
            </div>
            <div className="text-2xl font-bold gradient-text">
              {matchPercentage}%
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full bg-white dark:bg-slate-700">
          {item.category}
        </div>
      </div>

      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full bg-gradient-to-r ${matchLevel.color} progress-bar`}
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      <div className="relative mb-4 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4">
        <img
          src={imgSrc}
          alt={item.title}
          className={`w-full h-48 object-contain transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
            }`}
        />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {item.description}
          </p>
        </div>

        <div className="text-2xl font-bold gradient-text">
          {price}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Why this gift:
          </p>
          <ul className="space-y-1.5">
            {Array.isArray(item.why_bullets) &&
              item.why_bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
          </ul>
        </div>

        {item.amazon_url ? (
          <a
            href={item.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-3 rounded-2xl btn-gradient text-white font-bold mt-4"
          >
            View on Amazon →
          </a>
        ) : (
          <div className="text-center py-3 text-sm text-slate-400">
            Link coming soon
          </div>
        )}
      </div>
    </div>
  );
}
