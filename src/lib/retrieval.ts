/**
 * Phase 1 retrieval: keyword scoring on category/tags/title + budget + locale.
 * Returns top 30 candidates. Phase 2: embeddings + vector search later.
 */

import { prisma } from "@/lib/db";
import type { RecipientProfile } from "@/types/recommend";
import type { CandidateProduct } from "@/types/recommend";
import { fuzzyMatch, matchScore, expandInterests, getRelatedTerms } from "./textMatching";

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
  const derived = profile.derived_tags;
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();
  const desc = (product.description || "").toLowerCase();

  let score = 0;

  // Use fuzzy matching for better results
  for (const tag of derived) {
    // Check tags with fuzzy matching
    for (const productTag of tags) {
      const matchQuality = matchScore(tag, productTag);
      if (matchQuality > 0) {
        score += matchQuality; // 0-5 points based on match quality
      }
    }

    // Check title and category with fuzzy matching
    if (fuzzyMatch(tag, title)) score += 3;
    if (fuzzyMatch(tag, category)) score += 3;
    if (fuzzyMatch(tag, desc)) score += 1;
  }

  // Check ranked intents (occasion-specific terms)
  for (const intent of profile.ranked_intents.slice(0, 3)) {
    if (fuzzyMatch(intent, title) || fuzzyMatch(intent, category)) {
      score += 2;
    }
    for (const productTag of tags) {
      if (fuzzyMatch(intent, productTag)) score += 1;
    }
  }

  return score;
}

export async function getCandidates(profile: RecipientProfile): Promise<CandidateProduct[]> {
  const { budget_min, budget_max, locale } = profile.hard_constraints;

  // Optimize: Filter in DB by keywords to ensure "Baby" items are found among 8000+ products
  // Exclude "friend", "partner", "coworker" from DB search as they match "friendly", "partnerships" etc.
  const NOISE_TAGS = new Set(["friend", "partner", "coworker", "other", "gift"]);

  // Expand derived tags with synonyms (e.g. "baby-shower" -> "baby", "nursery")
  const expandedTags = new Set<string>();
  profile.derived_tags.forEach(tag => {
    if (!NOISE_TAGS.has(tag)) {
      expandedTags.add(tag);
      getRelatedTerms(tag).forEach(t => expandedTags.add(t));
    }
  });

  // Filter out age ranges (e.g. 25-34, 55+) and short terms from DB query
  // Regex matches: "25-34", "55+"
  const agePattern = /^(\d+[-+]\d+|\d+\+)$/;
  const searchTerms = Array.from(expandedTags)
    .filter((t) => t.length > 2 && !t.match(agePattern) && !NOISE_TAGS.has(t))
    .slice(0, 15); // Top 15 diverse tags

  const whereClause: any = {
    active: true,
    locale: locale || "US",
    price_max: { gte: budget_min },
    price_min: { lte: budget_max },
  };

  if (searchTerms.length > 0) {
    whereClause.OR = searchTerms.flatMap((term) => [
      { title: { contains: term } },
      { category: { contains: term } },
      { tags: { contains: term } },
    ]);
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    take: 200,
  });

  // If strict search yields too few results, fallback to broader price-only search
  if (products.length < 10) {
    const fallbackProducts = await prisma.product.findMany({
      where: {
        active: true,
        locale: locale || "US",
        price_max: { gte: budget_min },
        price_min: { lte: budget_max },
      },
      take: 100,
    });
    // Merge without duplicates
    const existIds = new Set(products.map(p => p.id));
    for (const p of fallbackProducts) {
      if (!existIds.has(p.id)) products.push(p);
    }
  }

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
