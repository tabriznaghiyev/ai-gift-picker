/**
 * Phase 1 retrieval: keyword scoring on category/tags/title + budget + locale.
 * Returns top 30 candidates. Phase 2: embeddings + vector search later.
 */

import { prisma } from "@/lib/db";
import type { RecipientProfile } from "@/types/recommend";
import type { CandidateProduct } from "@/types/recommend";

const MAX_CANDIDATES = 30;

function parseTags(tagsStr: string): string[] {
  if (!tagsStr?.trim()) return [];
  return tagsStr.split("|").map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function scoreProduct(
  product: { title: string; description: string; category: string; tags: string },
  profile: RecipientProfile
): number {
  const tags = parseTags(product.tags);
  const derived = profile.derived_tags.map((t) => t.toLowerCase());
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();
  const desc = (product.description || "").toLowerCase();

  let score = 0;
  for (const tag of derived) {
    if (tags.some((t) => t.includes(tag) || tag.includes(t))) score += 3;
    if (title.includes(tag)) score += 2;
    if (category.includes(tag)) score += 2;
    if (desc.includes(tag)) score += 1;
  }
  for (const intent of profile.ranked_intents.slice(0, 3)) {
    const i = intent.toLowerCase();
    if (title.includes(i) || category.includes(i) || tags.some((t) => t.includes(i))) score += 1;
  }
  return score;
}

export async function getCandidates(profile: RecipientProfile): Promise<CandidateProduct[]> {
  const { budget_min, budget_max, locale } = profile.hard_constraints;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      locale: locale || "US",
      price_max: { gte: budget_min },
      price_min: { lte: budget_max },
    },
    take: 200,
  });

  const scored = products.map((p) => ({
    product: p,
    score: scoreProduct(p, profile),
  }));
  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, MAX_CANDIDATES).map(({ product }) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    tags: parseTags(product.tags),
    price_min: product.price_min,
    price_max: product.price_max,
    amazon_url: product.amazon_url,
    image_url: product.image_url,
  }));

  return top;
}
