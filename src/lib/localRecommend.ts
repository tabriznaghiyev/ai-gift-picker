/**
 * Local recommendation path: no OpenAI. Build profile from form, score/retrieve from DB, pick top 6 with static bullets.
 */

import type { QuizForm } from "@/types/quiz";
import type { RecipientProfile, CandidateProduct, RecommendResult } from "@/types/recommend";

const OCCASION_LABELS: Record<string, string> = {
  birthday: "birthdays",
  anniversary: "anniversaries",
  housewarming: "housewarmings",
  graduation: "graduation",
  "thank-you": "thank-you gifts",
  holiday: "the holidays",
  "baby-shower": "baby showers",
  other: "gift-giving",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  friend: "friends",
  partner: "partners",
  parent: "parents",
  coworker: "coworkers",
  sibling: "siblings",
  child: "kids",
  other: "recipients",
};

/** Build a RecipientProfile from quiz form for retrieval (keyword scoring). No API call. */
export function buildLocalProfile(form: QuizForm): RecipientProfile {
  const occasionLabel = OCCASION_LABELS[form.occasion] ?? form.occasion;
  const relationshipLabel = RELATIONSHIP_LABELS[form.relationship] ?? form.relationship;

  const derived_tags = [
    form.occasion,
    form.relationship,
    form.age_range,
    ...form.interests,
    ...form.daily_life,
  ].filter(Boolean).map((t) => String(t).toLowerCase().replace(/\s+/g, "_"));

  const ranked_intents = [
    occasionLabel,
    "thoughtful",
    "practical",
    ...form.interests.slice(0, 2),
  ].filter(Boolean);

  return {
    recipient_summary: `Gift for ${relationshipLabel} for ${occasionLabel}, age ${form.age_range}. Interests: ${form.interests.join(", ") || "general"}.`,
    ranked_intents,
    derived_tags: [...new Set(derived_tags)],
    hard_constraints: {
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      avoid: form.avoid_list,
      locale: "US",
    },
  };
}

/** Turn top 6 candidates into top_3 + alternatives_3 with static bullets/labels from form. No API call. */
export function rerankLocal(
  candidates: CandidateProduct[],
  form: QuizForm
): RecommendResult {
  const top6 = candidates.slice(0, 6);
  const occasionLabel = OCCASION_LABELS[form.occasion] ?? form.occasion;
  const relationshipLabel = RELATIONSHIP_LABELS[form.relationship] ?? form.relationship;

  const top3 = top6.slice(0, 3).map((c, i) => ({
    product_id: c.id,
    score: 10 - i,
    why_bullets: [
      `Fits your $${form.budget_min}–$${form.budget_max} budget.`,
      form.interests.length
        ? `Matches interests like ${form.interests.slice(0, 2).join(", ")}.`
        : "Widely liked category.",
      `Solid pick for ${occasionLabel}.`,
    ] as [string, string, string],
    best_for_label: `Best for ${relationshipLabel} — ${occasionLabel}`,
  }));

  const alternatives_3 = top6.slice(3, 6).map((c, i) => ({
    product_id: c.id,
    score: 7 - i,
    why_bullets: [
      "Within your budget.",
      "Relevant to their lifestyle.",
      "Thoughtful alternative.",
    ] as [string, string, string],
    best_for_label: "More ideas",
  }));

  return { top_3: top3, alternatives_3 };
}
