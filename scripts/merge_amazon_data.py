
import csv
import hashlib
import os
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AMAZON_CSV = PROJECT_ROOT / "amazondataset" / "amazon_products_sales_data_cleaned.csv"
PRODUCTS_CSV = PROJECT_ROOT / "prisma" / "products.csv"

# Existing categories for mapping
CATEGORIES = [
    "art", "baby", "beauty", "books", "comfort", "cooking", "creative", "electronics",
    "fashion", "fitness", "food", "games", "garden", "gifts", "home", "jewelry",
    "kids", "music", "office", "outdoors", "pets", "travel", "wellness"
]

def map_category(amz_cat):
    """Fuzzy map Amazon category to our strict list."""
    if not amz_cat:
        return "gifts"
    
    amz_lower = amz_cat.lower()
    
    # Direct Keyword Matching
    if "art" in amz_lower or "craft" in amz_lower: return "art"
    if "baby" in amz_lower or "diaper" in amz_lower: return "baby"
    if "beauty" in amz_lower or "skin" in amz_lower or "hair" in amz_lower: return "beauty"
    if "book" in amz_lower: return "books"
    if "kitchen" in amz_lower or "cook" in amz_lower: return "cooking"
    if "tech" in amz_lower or "electronic" in amz_lower or "phone" in amz_lower or "camera" in amz_lower or "headphone" in amz_lower: return "electronics"
    if "cloth" in amz_lower or "wear" in amz_lower or "shoe" in amz_lower or "fashion" in amz_lower: return "fashion"
    if "fit" in amz_lower or "gym" in amz_lower or "sport" in amz_lower: return "fitness"
    if "food" in amz_lower or "snack" in amz_lower: return "food"
    if "game" in amz_lower or "toy" in amz_lower: return "games"
    if "garden" in amz_lower or "plant" in amz_lower: return "garden"
    if "jewel" in amz_lower: return "jewelry"
    if "kid" in amz_lower or "child" in amz_lower: return "kids"
    if "music" in amz_lower: return "music"
    if "office" in amz_lower or "desk" in amz_lower: return "office"
    if "outdoor" in amz_lower or "camp" in amz_lower: return "outdoors"
    if "pet" in amz_lower or "dog" in amz_lower or "cat" in amz_lower: return "pets"
    if "travel" in amz_lower or "trip" in amz_lower: return "travel"
    if "home" in amz_lower or "decor" in amz_lower: return "home"
    
    return "gifts" # Default fallback

def generate_tags(title, category):
    """Generate simple tags from title."""
    words = title.lower().replace(",", "").split()
    # Filter for interesting words (simple stoplist)
    stop = {"with", "and", "for", "the", "a", "by", "of", "in", "to", "set", "pack"}
    tags = [w for w in words if len(w) > 3 and w not in stop]
    tags.append(category)
    return "|".join(list(set(tags))[:10]) # Max 10 tags

def main():
    print("Loading existing products...")
    existing_ids = set()
    rows = []
    
    # Load existing to avoid dupes
    if PRODUCTS_CSV.exists():
        with open(PRODUCTS_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                existing_ids.add(row["id"])
                rows.append(row)
    else:
        fieldnames = ["id", "title", "description", "category", "tags", "price_min", "price_max", "amazon_url", "image_url", "locale", "active"]

    print(f"Found {len(rows)} existing products.")

    print("Processing Amazon dataset...")
    new_count = 0
    with open(AMAZON_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get("product_title", "")
            if not title: continue
            
            # Generate ID
            id_hash = hashlib.md5(title.encode("utf-8")).hexdigest()[:12]
            pid = f"amz_{id_hash}"
            
            if pid in existing_ids:
                continue
                
            # Prices
            try:
                price_min = float(row.get("discounted_price", 0) or 0)
                price_max = float(row.get("original_price", 0) or price_min)
            except ValueError:
                continue # Skip bad prices
                
            if price_min <= 0: continue

            # Map fields
            cat = map_category(row.get("product_category", ""))
            tags = generate_tags(title, cat)
            
            new_row = {
                "id": pid,
                "title": title[:200], # Trucate for sanity
                "description": title, # Use title as desc
                "category": cat,
                "tags": tags,
                "price_min": int(price_min),
                "price_max": int(price_max),
                "amazon_url": row.get("product_page_url", ""),
                "image_url": row.get("product_image_url", ""),
                "locale": "US",
                "active": "true"
            }
            
            rows.append(new_row)
            existing_ids.add(pid)
            new_count += 1

    print(f"Added {new_count} new products from Amazon dataset.")
    
    # Write back
    with open(PRODUCTS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print("Merge complete.")

if __name__ == "__main__":
    main()
