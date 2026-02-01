/**
 * POST /api/recommend
 * Without OPENAI_API_KEY: local path — profile + retrieval from DB, top 6 with static bullets.
 * With OPENAI_API_KEY: LLM profile + retrieval + LLM rerank.
 * 5) Persist session.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { buildRecipientProfile, rerankCandidates } from "@/lib/llm";
import { buildLocalProfile, rerankLocal } from "@/lib/localRecommend";
import { getCandidates } from "@/lib/retrieval";
import type { QuizForm } from "@/types/quiz";
import type { RecipientProfile, RecommendResult } from "@/types/recommend";

const CACHE_BY_FORM_HASH = true; // simple in-memory for MVP; use Redis later
// Only call OpenAI when explicitly enabled with a key; default is local-only
const USE_OPENAI =
  process.env.ENABLE_OPENAI === "true" && Boolean(process.env.OPENAI_API_KEY);
// Use locally trained ML model to rank candidates (requires ml/model.onnx + ml/feature_spec.json)
const USE_ML = process.env.USE_ML === "true";

// In-memory cache: form_hash -> { profile, result } (MVP only)
const resultCache = new Map<string, { profile: RecipientProfile; result: RecommendResult }>();

function normalizeForm(body: unknown): QuizForm {
  const o = body as Record<string, unknown>;
  const budgetMin = typeof o.budget_min === "number" ? o.budget_min : Number(o.budget_min) || 0;
  const budgetMax = typeof o.budget_max === "number" ? o.budget_max : Number(o.budget_max) || 100;
  return {
    occasion: (o.occasion as string) || "birthday",
    relationship: (o.relationship as string) || "friend",
    age_range: (o.age_range as string) || "25-34",
    budget_min: Math.max(0, Math.min(budgetMin, 10000)),
    budget_max: Math.max(budgetMin, Math.min(budgetMax, 10000)),
    interests: Array.isArray(o.interests) ? (o.interests as string[]) : [],
    daily_life: Array.isArray(o.daily_life) ? (o.daily_life as string[]) : [],
    avoid_list: Array.isArray(o.avoid_list) ? (o.avoid_list as string[]) : [],
    notes: typeof o.notes === "string" ? o.notes.slice(0, 500) : "",
  };
}

function formHash(form: QuizForm): string {
  return createHash("sha256").update(JSON.stringify(form)).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not set. Add it to .env (e.g. file:./dev.db) and restart." },
        { status: 500 }
      );
    }
    const body = await request.json();
    const form = normalizeForm(body);

    const cacheKey = formHash(form);
    let profile: RecipientProfile;
    let result: RecommendResult;
    let candidatesCount = 0;
    let usedML = false;

    if (CACHE_BY_FORM_HASH && resultCache.has(cacheKey)) {
      const cached = resultCache.get(cacheKey)!;
      profile = cached.profile;
      result = cached.result;
      candidatesCount = 30;
      usedML = USE_ML;
    } else {
      if (USE_OPENAI) {
        profile = await buildRecipientProfile(form);
      } else {
        profile = buildLocalProfile(form);
      }
      let candidates = await getCandidates(profile);
      candidatesCount = candidates.length;
      if (candidates.length < 3) {
        return NextResponse.json(
          { error: "Not enough products match your criteria. Try widening budget or interests." },
          { status: 422 }
        );
      }
      if (USE_OPENAI) {
        result = await rerankCandidates(profile, candidates);
      } else {
        if (USE_ML) {
          try {
            const modelPath = path.join(process.cwd(), "ml", "model.onnx");
            const specPath = path.join(process.cwd(), "ml", "feature_spec.json");
            if (fs.existsSync(modelPath) && fs.existsSync(specPath)) {
              const ml = await import("@/lib/mlInference");
              if (ml.isMLAvailable()) {
                candidates = await ml.rankByML(form, candidates);
                usedML = true;
              }
            }
          } catch (mlErr) {
            console.warn("ML ranking failed, falling back to keyword order:", mlErr);
          }
        }
        result = rerankLocal(candidates.slice(0, 6), form);
      }
      if (CACHE_BY_FORM_HASH) resultCache.set(cacheKey, { profile, result });
    }

    const sessionId = randomUUID();
    const formJson = JSON.stringify(form);
    const resultJson = JSON.stringify({ profile, result });

    await prisma.session.create({
      data: {
        id: sessionId,
        form_json: formJson,
        result_json: resultJson,
      },
    });

    const productIds = [...result.top_3.map((r) => r.product_id), ...result.alternatives_3.map((r) => r.product_id)];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const toCandidate = (p: (typeof products)[0]) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      tags: p.tags.split("|").filter(Boolean),
      price_min: p.price_min,
      price_max: p.price_max,
      amazon_url: p.amazon_url,
      image_url: p.image_url,
    });

    const top3Enriched = result.top_3
      .map((item) => {
        const p = productMap.get(item.product_id);
        if (!p) return null;
        return { ...toCandidate(p), ...item };
      })
      .filter(Boolean);
    const alt3Enriched = result.alternatives_3
      .map((item) => {
        const p = productMap.get(item.product_id);
        if (!p) return null;
        return { ...toCandidate(p), ...item };
      })
      .filter(Boolean);

    const steps = [
      {
        step: 1,
        title: "Built your profile",
        description: `We used your answers: ${form.occasion} gift for ${form.relationship}, age ${form.age_range}, budget $${form.budget_min}–$${form.budget_max}${form.interests.length ? `, interests: ${form.interests.slice(0, 3).join(", ")}` : ""}.`,
      },
      {
        step: 2,
        title: "Filtered our catalog",
        description: `We found ${candidatesCount} products that match your budget and preferences.`,
      },
      {
        step: 3,
        title: usedML ? "Ranked with our ML model" : "Ranked by match",
        description: usedML
          ? "Our trained model scored each product for relevance to your profile and reordered the list."
          : "We scored each product by how well it matches your occasion, interests, and lifestyle.",
      },
      {
        step: 4,
        title: "Selected your top 6",
        description: "We picked the best 3 as top picks and 3 more as alternatives, with short reasons for each.",
      },
    ];

    return NextResponse.json({
      session_id: sessionId,
      profile,
      top_3: top3Enriched,
      alternatives_3: alt3Enriched,
      steps,
    });
  } catch (e) {
    console.error("/api/recommend", e);
    const message = e instanceof Error ? e.message : "Recommendation failed";
    const isPrisma = e && typeof e === "object" && "code" in e;
    const hint = isPrisma
      ? " Make sure the database is set up: run `npx prisma db push` then `npm run db:seed`."
      : "";
    return NextResponse.json(
      { error: message + hint },
      { status: 500 }
    );
  }
}
