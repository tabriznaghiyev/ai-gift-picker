/**
 * OpenAI calls: (1) build recipient_profile, (2) rerank candidates.
 * Short prompts, JSON schema, no hallucinated product IDs.
 */

import OpenAI from "openai";
import type { QuizForm } from "@/types/quiz";
import type { RecipientProfile, CandidateProduct, RankedItem, RecommendResult } from "@/types/recommend";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

const PROFILE_SCHEMA = {
  type: "object",
  properties: {
    recipient_summary: { type: "string" },
    ranked_intents: { type: "array", items: { type: "string" } },
    derived_tags: { type: "array", items: { type: "string" } },
    hard_constraints: {
      type: "object",
      properties: {
        budget_min: { type: "number" },
        budget_max: { type: "number" },
        avoid: { type: "array", items: { type: "string" } },
        locale: { type: "string" },
      },
      required: ["budget_min", "budget_max", "avoid", "locale"],
    },
  },
  required: ["recipient_summary", "ranked_intents", "derived_tags", "hard_constraints"],
};

const RERANK_SCHEMA = {
  type: "object",
  properties: {
    top_3: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          score: { type: "number" },
          why_bullets: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          best_for_label: { type: "string" },
        },
        required: ["product_id", "score", "why_bullets", "best_for_label"],
      },
      minItems: 3,
      maxItems: 3,
    },
    alternatives_3: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          score: { type: "number" },
          why_bullets: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          best_for_label: { type: "string" },
        },
        required: ["product_id", "score", "why_bullets", "best_for_label"],
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["top_3", "alternatives_3"],
};

export async function buildRecipientProfile(form: QuizForm): Promise<RecipientProfile> {
  const prompt = `Given this gift quiz, output a structured recipient profile as JSON.
Occasion: ${form.occasion}. Relationship: ${form.relationship}. Age: ${form.age_range}.
Budget: $${form.budget_min}-$${form.budget_max}. Interests: ${form.interests.join(", ")}.
Daily life: ${form.daily_life.join(", ")}. Avoid: ${form.avoid_list.join(", ")}. Notes: ${form.notes || "none"}.
Output: recipient_summary (1 sentence), ranked_intents (e.g. practical, sentimental, fun), derived_tags (searchable tags), hard_constraints (budget_min, budget_max, avoid array, locale "US").`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_schema", json_schema: { name: "profile", strict: true, schema: PROFILE_SCHEMA } },
    max_tokens: 400,
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty profile response");
  const parsed = JSON.parse(raw) as RecipientProfile;
  parsed.hard_constraints.locale = parsed.hard_constraints.locale || "US";
  return parsed;
}

function candidateListForPrompt(candidates: CandidateProduct[]): string {
  return candidates
    .slice(0, 30)
    .map((c) => `id: ${c.id} | ${c.title} | category: ${c.category} | tags: ${c.tags.join(", ")}`)
    .join("\n");
}

export async function rerankCandidates(
  profile: RecipientProfile,
  candidates: CandidateProduct[]
): Promise<RecommendResult> {
  const validIds = new Set(candidates.map((c) => c.id));
  const list = candidateListForPrompt(candidates);

  const prompt = `You are a gift recommender. You MUST only use product_id from this list (no other IDs):
${list}

Recipient: ${profile.recipient_summary}. Intents: ${profile.ranked_intents.join(", ")}. Tags: ${profile.derived_tags.join(", ")}.
Budget: $${profile.hard_constraints.budget_min}-$${profile.hard_constraints.budget_max}. Avoid: ${profile.hard_constraints.avoid.join(", ") || "none"}.

Output JSON with:
- top_3: array of 3 items, each { product_id, score (1-10), why_bullets [3 short bullets], best_for_label }
- alternatives_3: same shape, 3 different products from the list.
Rules: product_id must be exactly one of the ids above. Keep bullets short. No medical claims. No unsafe advice.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_schema", json_schema: { name: "rerank", strict: true, schema: RERANK_SCHEMA } },
    max_tokens: 600,
  });

  let raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty rerank response");
  let result = JSON.parse(raw) as RecommendResult;

  let allIds = [...result.top_3.map((r) => r.product_id), ...result.alternatives_3.map((r) => r.product_id)];
  let invalid = allIds.filter((id) => !validIds.has(id));
  if (invalid.length === 0) return result;

  // Retry once with stricter instructions
  const strictPrompt = `${prompt}\n\nCRITICAL: You used invalid product_ids: ${invalid.join(", ")}. You may ONLY use product_id values from the list above. Try again.`;
  const retry = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: strictPrompt }],
    response_format: { type: "json_schema", json_schema: { name: "rerank", strict: true, schema: RERANK_SCHEMA } },
    max_tokens: 600,
  });
  const retryRaw = retry.choices[0]?.message?.content;
  if (retryRaw) {
    const retryResult = JSON.parse(retryRaw) as RecommendResult;
    const retryIds = [...retryResult.top_3.map((r) => r.product_id), ...retryResult.alternatives_3.map((r) => r.product_id)];
    if (retryIds.every((id) => validIds.has(id))) return retryResult;
  }

  // Fallback: pick first 6 valid candidates and assign generic copy
  const fallback: RecommendResult = {
    top_3: candidates.slice(0, 3).map((c, i) => ({
      product_id: c.id,
      score: 10 - i,
      why_bullets: ["Matches interests.", "Fits budget.", "Thoughtful choice."],
      best_for_label: profile.ranked_intents[0] || "This recipient",
    })),
    alternatives_3: candidates.slice(3, 6).map((c, i) => ({
      product_id: c.id,
      score: 7 - i,
      why_bullets: ["Good alternative.", "Within budget.", "Relevant category."],
      best_for_label: "Alternative pick",
    })),
  };
  return fallback;
}
