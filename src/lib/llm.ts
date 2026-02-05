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

/**
 * Extract structured QuizForm data from natural language input.
 * Uses GPT-4o-mini with carefully crafted prompts for cost-effective extraction.
 */
export async function extractQuizFromNaturalLanguage(userInput: string): Promise<QuizForm> {
  const QUIZ_EXTRACTION_SCHEMA = {
    type: "object",
    properties: {
      occasion: {
        type: "string",
        enum: ["birthday", "anniversary", "housewarming", "graduation", "thank-you", "holiday", "baby-shower", "other"],
      },
      relationship: {
        type: "string",
        enum: ["friend", "partner", "parent", "coworker", "sibling", "child", "other"],
      },
      age_range: {
        type: "string",
        enum: ["0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
      },
      budget_min: { type: "number" },
      budget_max: { type: "number" },
      interests: {
        type: "array",
        items: { type: "string" },
      },
      notes: { type: "string" },
    },
    required: ["occasion", "relationship", "age_range", "budget_min", "budget_max", "interests", "notes"],
  };

  const systemPrompt = `You are a gift recommendation assistant. Extract structured gift preferences from natural language input.

Output ONLY valid JSON with this exact structure:
{
  "occasion": one of ["birthday", "anniversary", "housewarming", "graduation", "thank-you", "holiday", "baby-shower", "other"],
  "relationship": one of ["friend", "partner", "parent", "coworker", "sibling", "child", "other"],
  "age_range": one of ["0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
  "budget_min": number,
  "budget_max": number,
  "interests": array of strings (3-5 keywords),
  "notes": string (original input for reference)
}

EXTRACTION RULES:
1. Infer age_range from context clues:
   - "brother who games" → likely "18-24" or "25-34"
   - "mom" or "dad" → likely "45-54" or "55+"
   - "coworker" → likely "25-34" or "35-44"
   - "child" or "kid" → "0-12" or "13-17"
   - If unclear, default to "25-34"

2. Extract budget with 20% flexibility:
   - "$50" → min: 40, max: 60
   - "$100-150" → min: 100, max: 150
   - "under $30" → min: 20, max: 30
   - "around $75" → min: 60, max: 90
   - If no budget mentioned, default to min: 20, max: 80

3. Identify 3-5 key interests/keywords:
   - Extract hobbies, activities, preferences
   - Keep each interest 1-3 words
   - Examples: "gaming", "coffee", "yoga", "technology", "cooking"

4. Use sensible defaults for missing information:
   - occasion: "birthday" (most common)
   - relationship: "friend" (most common)

5. Store original input in "notes" field for reference.

EXAMPLES:

Input: "Birthday gift for my tech-savvy brother who loves gaming, around $50"
Output: {
  "occasion": "birthday",
  "relationship": "sibling",
  "age_range": "18-24",
  "budget_min": 40,
  "budget_max": 60,
  "interests": ["gaming", "technology", "electronics"],
  "notes": "Birthday gift for my tech-savvy brother who loves gaming, around $50"
}

Input: "Anniversary gift for my wife, she loves yoga and reading, budget $100-150"
Output: {
  "occasion": "anniversary",
  "relationship": "partner",
  "age_range": "25-34",
  "budget_min": 100,
  "budget_max": 150,
  "interests": ["yoga", "reading", "wellness", "books"],
  "notes": "Anniversary gift for my wife, she loves yoga and reading, budget $100-150"
}

Input: "Something for my coworker's baby shower, under $30"
Output: {
  "occasion": "baby-shower",
  "relationship": "coworker",
  "age_range": "25-34",
  "budget_min": 20,
  "budget_max": 30,
  "interests": ["baby", "parenting", "newborn"],
  "notes": "Something for my coworker's baby shower, under $30"
}`;

  const userPrompt = `Extract gift preferences from this input: "${userInput}"`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quiz_extraction",
        strict: true,
        schema: QUIZ_EXTRACTION_SCHEMA,
      },
    },
    temperature: 0.3, // More deterministic
    max_tokens: 300,
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty extraction response from OpenAI");

  const parsed = JSON.parse(raw) as QuizForm;

  // Validate and sanitize
  parsed.budget_min = Math.max(0, Math.min(parsed.budget_min, 10000));
  parsed.budget_max = Math.max(parsed.budget_min, Math.min(parsed.budget_max, 10000));
  parsed.interests = parsed.interests.slice(0, 10); // Limit to 10 interests
  parsed.daily_life = []; // Not extracted from natural language (optional field)
  parsed.avoid_list = []; // Not extracted from natural language (optional field)

  return parsed;
}
