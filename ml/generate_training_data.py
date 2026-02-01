#!/usr/bin/env python3
"""
Generate training data: (profile, product) pairs with label 1=recommended, 0=not.
Uses same keyword scoring logic as the app's retrieval to create labels.
Output: ml/training_data.csv and ml/feature_spec.json (with category list).
Run from project root: python ml/generate_training_data.py
"""

import csv
import json
import random
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_CSV = PROJECT_ROOT / "prisma" / "products.csv"
OUTPUT_CSV = Path(__file__).resolve().parent / "training_data.csv"
SPEC_PATH = Path(__file__).resolve().parent / "feature_spec.json"
NUM_PROFILES = 6000  # more profiles for better ML coverage
TOP_POSITIVE = 6
NEGATIVE_PER_PROFILE = 20  # negatives per profile (balanced with positives)
# Stratified: ensure every occasion/relationship/age gets represented
STRATIFY_BY_OCCASION = True

OCCASIONS = ["birthday", "anniversary", "housewarming", "graduation", "thank-you", "holiday", "baby-shower", "other"]
RELATIONSHIPS = ["friend", "partner", "parent", "coworker", "sibling", "child", "other"]
AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
DAILY_LIFE = ["student", "office", "remote_worker", "gamer", "gym", "traveler", "new_parent", "cooking", "outdoors", "creative", "pet_lover", "other"]

INTEREST_POOL = [
    "cooking", "gaming", "travel", "reading", "music", "fitness", "art", "tech",
    "coffee", "tea", "wine", "outdoors", "pets", "photography", "crafts", "books",
    "movies", "sports", "yoga", "gardening", "food", "wellness", "home", "office",
]


def load_products():
    rows = []
    with open(PRODUCTS_CSV, encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            if not row.get("id"):
                continue
            rows.append({
                "id": row["id"],
                "title": (row.get("title") or "").lower(),
                "category": (row.get("category") or "").lower(),
                "tags": [t.strip().lower() for t in (row.get("tags") or "").split("|") if t.strip()],
                "price_min": int(row.get("price_min") or 0),
                "price_max": int(row.get("price_max") or 0),
            })
    return rows


def score_product(profile_tags: set, product: dict) -> int:
    tags = set(product["tags"])
    title = product["title"]
    category = product["category"]
    score = 0
    for tag in profile_tags:
        if any(tag in t or t in tag for t in tags):
            score += 3
        if tag in title:
            score += 2
        if tag in category:
            score += 2
    return score


def random_profile(occasion=None, relationship=None, age_range=None):
    occasion = occasion or random.choice(OCCASIONS)
    relationship = relationship or random.choice(RELATIONSHIPS)
    age = age_range or random.choice(AGE_RANGES)
    budget_min = random.randint(5, 80)
    budget_max = random.randint(budget_min + 10, min(150, budget_min + 100))
    interests = random.sample(INTEREST_POOL, k=random.randint(0, 5))
    daily_life = random.sample(DAILY_LIFE, k=random.randint(0, 4))
    derived = {occasion, relationship, age, *interests, *daily_life}
    return {
        "occasion": occasion,
        "relationship": relationship,
        "age_range": age,
        "budget_min": budget_min,
        "budget_max": budget_max,
        "interest_count": len(interests),
        "daily_life_count": len(daily_life),
        "derived_tags": derived,
    }


def build_category_list(products):
    cats = set()
    for p in products:
        for c in (p.get("category") or "").split("|"):
            if c.strip():
                cats.add(c.strip().lower())
    return sorted(cats)


def category_to_id(category: str, category_list: list) -> int:
    cats = [c.lower() for c in category.split("|") if c.strip()]
    if not cats:
        return 0
    for c in cats:
        if c in category_list:
            return category_list.index(c)
    return 0


def tag_overlap(profile_tags: set, product_tags: list) -> int:
    pt = set(product_tags)
    return sum(1 for t in profile_tags if any(t in x or x in t for x in pt))


def extract_features(profile: dict, product: dict, category_list: list, spec: dict):
    occ = spec["occasion_values"].index(profile["occasion"]) if profile["occasion"] in spec["occasion_values"] else 0
    rel = spec["relationship_values"].index(profile["relationship"]) if profile["relationship"] in spec["relationship_values"] else 0
    age = spec["age_range_values"].index(profile["age_range"]) if profile["age_range"] in spec["age_range_values"] else 0

    occasion_onehot = [1 if i == occ else 0 for i in range(8)]
    relationship_onehot = [1 if i == rel else 0 for i in range(7)]
    age_onehot = [1 if i == age else 0 for i in range(6)]

    budget_min_norm = min(1.0, profile["budget_min"] / spec["budget_max_norm"])
    budget_max_norm = min(1.0, profile["budget_max"] / spec["budget_max_norm"])
    interest_norm = min(1.0, profile["interest_count"] / spec["max_interest_count"])
    daily_norm = min(1.0, profile["daily_life_count"] / spec["max_daily_life_count"])

    cat_id = category_to_id(product.get("category") or "", category_list)
    price_min_norm = min(1.0, (product.get("price_min") or 0) / spec["price_max_norm"])
    price_max_norm = min(1.0, (product.get("price_max") or 0) / spec["price_max_norm"])
    overlap = tag_overlap(profile["derived_tags"], product.get("tags") or [])
    tag_overlap_norm = min(1.0, overlap / spec["max_tag_overlap"])
    price_in_budget = 1 if (product.get("price_max", 0) >= profile["budget_min"] and product.get("price_min", 999) <= profile["budget_max"]) else 0

    feats = (
        occasion_onehot + relationship_onehot + age_onehot +
        [budget_min_norm, budget_max_norm, interest_norm, daily_norm] +
        [cat_id, price_min_norm, price_max_norm, tag_overlap_norm, price_in_budget]
    )
    return feats


def main():
    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    products = load_products()
    category_list = build_category_list(products)
    spec["category_list"] = category_list
    SPEC_PATH.write_text(json.dumps(spec, indent=2), encoding="utf-8")

    feature_names = spec["feature_names"]
    rows = [feature_names + ["product_id", "label"]]

    if STRATIFY_BY_OCCASION:
        profiles_per_occasion = max(1, NUM_PROFILES // len(OCCASIONS))
        profile_batches = []
        for occ in OCCASIONS:
            for _ in range(profiles_per_occasion):
                profile_batches.append(random_profile(occasion=occ))
        random.shuffle(profile_batches)
    else:
        profile_batches = [random_profile() for _ in range(NUM_PROFILES)]

    for profile in profile_batches:
        in_budget = [p for p in products if p["price_max"] >= profile["budget_min"] and p["price_min"] <= profile["budget_max"]]
        if len(in_budget) < TOP_POSITIVE + 5:
            continue
        scored = [(score_product(profile["derived_tags"], p), p) for p in in_budget]
        scored.sort(key=lambda x: -x[0])
        for i in range(min(TOP_POSITIVE, len(scored))):
            p = scored[i][1]
            feats = extract_features(profile, p, category_list, spec)
            rows.append([*feats, p["id"], 1])
        negatives = [scored[i][1] for i in range(TOP_POSITIVE, len(scored))]
        for p in random.sample(negatives, min(NEGATIVE_PER_PROFILE, len(negatives))):
            feats = extract_features(profile, p, category_list, spec)
            rows.append([*feats, p["id"], 0])

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"Wrote {len(rows)-1} training rows to {OUTPUT_CSV}")
    print(f"Categories: {len(category_list)}")


if __name__ == "__main__":
    main()
