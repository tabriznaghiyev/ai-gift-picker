#!/usr/bin/env python3
"""
Generate 1000+ logical gift products for products.csv.
Tags/categories align with quiz: occasion, relationship, age_range, daily_life, interests.
Run: python scripts/generate_products.py
Output: prisma/products_generated.csv (then replace or merge with prisma/products.csv)
"""

import csv
import random
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "prisma" / "products.csv"
TARGET_ROWS = 1050  # 1000+ products

OCCASIONS = ["birthday", "anniversary", "housewarming", "graduation", "thank-you", "holiday", "baby-shower", "other"]
RELATIONSHIPS = ["friend", "partner", "parent", "coworker", "sibling", "child", "other"]
AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
DAILY_LIFE = ["student", "office", "remote_worker", "gamer", "gym", "traveler", "new_parent", "cooking", "outdoors", "creative", "pet_lover", "other"]

# Product templates: (title_prefix, description, category, tag_templates, price_min, price_max)
# tag_templates can include {occasion}, {rel}, {age}, {life} for variation
TEMPLATES = [
    # Electronics & Tech
    ("Wireless Earbuds", "Noise-canceling wireless earbuds with long battery life.", "Electronics", "audio|tech|wireless|music", 25, 55),
    ("Bluetooth Speaker", "Portable waterproof speaker with 12hr battery.", "Electronics", "audio|tech|portable|music", 28, 60),
    ("Phone Charger", "Fast charging pad or cable for smartphones.", "Electronics", "tech|phone|charging|gadget", 12, 35),
    ("Desk Lamp LED", "LED desk lamp with adjustable brightness.", "Home|Office", "office|desk|light|tech", 22, 48),
    ("Wireless Keyboard", "Slim Bluetooth keyboard for tablet and PC.", "Electronics|Office", "office|tech|keyboard|bluetooth", 25, 55),
    ("Gaming Mouse", "RGB programmable gaming mouse.", "Electronics|Games", "gamer|tech|gaming|mouse", 24, 55),
    ("Webcam Cover", "Sliding privacy cover for laptop.", "Office|Electronics", "remote_worker|office|tech|privacy", 6, 18),
    ("Headphones", "Over-ear or on-ear wireless headphones.", "Electronics", "audio|tech|music|travel", 35, 95),
    ("Power Bank", "Portable power bank for phones and tablets.", "Electronics", "tech|travel|charging|portable", 18, 45),
    ("Smart Watch Band", "Replacement band for popular smartwatches.", "Electronics", "tech|gift|wearable", 12, 35),
    # Home & Comfort
    ("Throw Blanket", "Soft fleece or knit throw blanket.", "Home|Comfort", "home|cozy|gift|comfort", 18, 45),
    ("Scented Candle Set", "Soy or wax candles in assorted scents.", "Home|Gifts", "home|candle|relaxation|gift", 14, 35),
    ("Coasters Set", "Cork or ceramic coasters set of 4-6.", "Home", "home|housewarming|decor|practical", 10, 25),
    ("Photo Frame", "Table or wall photo frame.", "Home|Gifts", "home|gift|memory|decor", 14, 40),
    ("Throw Pillow", "Decorative throw pillow cover or insert.", "Home", "home|cozy|decor|gift", 14, 35),
    ("Doormat", "Welcome or decorative doormat.", "Home", "housewarming|home|decor|practical", 14, 30),
    ("Kitchen Towel Set", "Cotton or linen kitchen towels.", "Home|Cooking", "housewarming|cooking|home|kitchen", 14, 28),
    ("Mug", "Ceramic coffee or tea mug.", "Home|Gifts", "home|gift|coffee|office", 10, 28),
    ("Diffuser", "Essential oil or ultrasonic diffuser.", "Home|Wellness", "home|wellness|aromatherapy|relaxation", 18, 45),
    ("Plant Pot", "Ceramic or plastic pot with saucer.", "Home|Garden", "plants|home|garden|decor", 12, 35),
    # Office & Student
    ("Notebook Set", "College ruled or dotted notebooks.", "Office|Student", "office|student|notebooks|writing", 8, 22),
    ("Pen Set", "Ballpoint or gel pen gift set.", "Office|Gifts", "office|graduation|thank-you|writing", 10, 35),
    ("Desk Organizer", "Bamboo or metal desk organizer.", "Office|Home", "office|desk|organization", 16, 40),
    ("Planner", "Daily or academic year planner.", "Office|Student", "student|office|organization", 12, 28),
    ("Sticky Notes", "Assorted sticky note pads.", "Office", "office|coworker|organization", 5, 14),
    ("Card Holder", "Business or gift card holder.", "Office|Gifts", "coworker|office|thank-you|professional", 8, 22),
    ("Laptop Stand", "Adjustable laptop stand for desk.", "Office|Electronics", "office|remote_worker|desk|ergonomic", 22, 50),
    ("Desk Mat", "Anti-fatigue or decorative desk mat.", "Office|Home", "office|desk|comfort|ergonomic", 20, 45),
    # Fitness & Wellness
    ("Yoga Mat", "Non-slip yoga mat with strap.", "Fitness", "fitness|yoga|gym|wellness", 20, 50),
    ("Resistance Bands", "Set of resistance bands with door anchor.", "Fitness", "fitness|gym|home workout|resistance", 12, 32),
    ("Dumbbells", "Neoprene or vinyl hand weights.", "Fitness", "fitness|gym|weights|home workout", 18, 45),
    ("Water Bottle", "Insulated stainless steel water bottle.", "Fitness|Travel", "fitness|travel|eco|hydration", 18, 40),
    ("Gym Bag", "Sports or gym duffel bag.", "Fitness", "fitness|gym|travel|sports", 22, 50),
    ("Foam Roller", "High-density foam roller.", "Fitness", "fitness|gym|wellness|recovery", 18, 42),
    ("Meditation Cushion", "Zafu or meditation cushion.", "Wellness|Home", "wellness|meditation|yoga|home", 22, 48),
    ("Stress Ball", "Stress relief or grip balls.", "Wellness|Office", "wellness|office|coworker|stress", 6, 18),
    # Travel
    ("Travel Pillow", "Neck pillow for flights.", "Travel", "travel|comfort|pillow|flight", 14, 35),
    ("Packing Cubes", "Compression packing cubes set.", "Travel", "travel|organization|outdoors", 14, 35),
    ("Passport Holder", "RFID blocking passport holder.", "Travel", "travel|organization|security", 10, 28),
    ("Toiletry Bag", "TSA-friendly toiletry bag.", "Travel", "travel|toiletries|organization", 12, 32),
    ("Travel Adapter", "Universal travel power adapter.", "Travel|Electronics", "travel|tech|international", 14, 35),
    ("Luggage Tag", "Set of durable luggage tags.", "Travel", "travel|organization|gift", 6, 16),
    # Cooking & Food
    ("Cookbook", "Recipe book with photos.", "Books|Cooking", "cooking|books|recipes|food", 14, 35),
    ("Spice Rack", "Countertop or wall spice rack.", "Home|Cooking", "cooking|home|kitchen|organization", 18, 45),
    ("Kitchen Tool Set", "Utensil or gadget set.", "Home|Cooking", "cooking|housewarming|kitchen|practical", 18, 45),
    ("Coffee Sampler", "Whole bean or ground coffee sampler.", "Food|Gifts", "coffee|food|gift|gourmet", 16, 38),
    ("Tea Sampler", "Assorted tea bags or loose leaf tin.", "Food|Gifts", "tea|food|gift|relaxation", 12, 30),
    ("Chocolate Gift Box", "Premium chocolate assortment.", "Food|Gifts", "gift|thank-you|food|holiday", 14, 40),
    ("Wine Tumbler", "Insulated wine or cocktail tumbler.", "Home|Gifts", "home|gift|wine|drinks", 18, 38),
    # Kids & Baby
    ("Kids Art Supplies", "Crayons markers paper for ages 3+.", "Kids|Creative", "kids|art|creative|crafts", 10, 28),
    ("Building Blocks", "Construction or building block set.", "Kids|Toys", "kids|toys|building|creative", 14, 40),
    ("Storybook", "Picture or chapter book for kids.", "Kids|Books", "kids|child|books|birthday", 8, 22),
    ("Baby Onesie", "Organic cotton baby onesie or set.", "Baby", "baby|new parent|clothing|organic", 12, 32),
    ("Baby Blanket", "Soft receiving or swaddle blanket.", "Baby", "baby-shower|baby|new parent|organic", 14, 35),
    ("Baby Bottle Set", "BPA-free baby bottle set.", "Baby", "baby|new parent|practical|feeding", 18, 40),
    ("Kids Puzzle", "Age-appropriate jigsaw puzzle.", "Kids|Toys", "kids|child|puzzle|creative", 8, 22),
    ("Plush Toy", "Soft plush stuffed animal.", "Kids|Toys", "kids|child|birthday|gift", 12, 28),
    # Pets
    ("Dog Toy", "Durable chew or puzzle toy for dogs.", "Pets", "pets|dogs|toys|pet_lover", 8, 28),
    ("Cat Toy", "Interactive or puzzle feeder for cats.", "Pets", "pets|cats|toys|pet_lover", 8, 25),
    ("Pet Treat Jar", "Ceramic or plastic treat storage.", "Pets", "pet_lover|pets|dogs|cats|home", 12, 28),
    ("Dog Bed", "Orthopedic or cushion dog bed.", "Pets", "pet_lover|pets|dogs|comfort", 28, 65),
    # Games & Fun
    ("Board Game", "Family or strategy board game.", "Games", "games|family|friend|fun", 18, 50),
    ("Card Game", "2+ player card game.", "Games", "games|sibling|friend|fun", 8, 22),
    ("Jigsaw Puzzle", "500-1000 piece puzzle.", "Games|Home", "games|puzzle|relaxation|home", 12, 35),
    ("Party Game", "Party game for 4+ players.", "Games", "games|friend|party|birthday", 18, 40),
    # Books & Creative
    ("Journal", "Blank or lined journal with pen.", "Office|Gifts", "journal|writing|gift|office", 10, 28),
    ("Coloring Book", "Adult or kids coloring book.", "Books|Creative", "creative|books|relaxation|art", 6, 18),
    ("Art Set", "Watercolor or sketch set.", "Creative|Gifts", "creative|art|gift|student", 14, 40),
    ("Craft Kit", "DIY craft or bracelet kit.", "Kids|Creative", "kids|creative|crafts|art", 10, 28),
    # Gifts & Occasion-specific
    ("Gift Card Holder", "Elegant gift card holder.", "Gifts", "gift|thank-you|coworker|birthday", 6, 18),
    ("Greeting Card Set", "Assorted greeting cards.", "Gifts", "birthday|thank-you|holiday|gift", 6, 14),
    ("Photo Album", "Leather or fabric photo album.", "Home|Gifts", "anniversary|partner|gift|memory", 16, 40),
    ("Diploma Frame", "Graduation diploma display frame.", "Office|Gifts", "graduation|gift|office|student", 18, 45),
    ("Anniversary Keepsake", "Custom or engraved keepsake.", "Home|Gifts", "anniversary|partner|romantic|gift", 20, 55),
    ("Housewarming Basket", "Kitchen or home starter basket.", "Home|Gifts", "housewarming|home|gift|practical", 25, 60),
    ("Thank You Gift Set", "Gourmet or wellness thank-you set.", "Food|Gifts", "thank-you|food|gift|coworker", 18, 45),
    ("Holiday Ornament", "Seasonal decorative ornament.", "Home|Gifts", "holiday|home|decor|gift", 8, 25),
    ("Baby Shower Gift Set", "New parent gift bundle.", "Baby|Gifts", "baby-shower|baby|new parent|gift", 22, 55),
    # Outdoors
    ("Outdoor Blanket", "Picnic or beach blanket.", "Outdoors|Travel", "outdoors|travel|picnic|blanket", 20, 45),
    ("Headlamp", "Rechargeable or battery headlamp.", "Outdoors|Travel", "outdoors|travel|hiking|light", 16, 42),
    ("Camping Hammock", "Portable camping hammock.", "Outdoors", "outdoors|travel|camping|relaxation", 28, 65),
    ("Grill Tools", "BBQ or grill tool set.", "Outdoors|Cooking", "cooking|outdoors|grill|bbq", 22, 50),
    ("Gardening Gloves", "Leather or fabric gardening gloves.", "Outdoors|Garden", "outdoors|garden|plants|45-54", 10, 25),
    # Beauty & Self-care
    ("Skincare Set", "Cleanser moisturizer travel set.", "Beauty", "beauty|skincare|gift|self-care", 22, 55),
    ("Hand Cream Set", "Nourishing hand cream set.", "Beauty|Gifts", "gift|thank-you|coworker|beauty", 10, 28),
    ("Bath Bomb Set", "Assorted bath bombs.", "Beauty|Home", "home|wellness|relaxation|gift", 12, 28),
    # Age / relationship targeted
    ("Reading Magnifier", "Hands-free LED magnifier.", "Home|Gifts", "55+|parent|reading|practical", 12, 30),
    ("Slippers", "Memory foam or cozy slippers.", "Home|Gifts", "parent|home|comfort|gift", 18, 42),
    ("Heating Pad", "Electric heating pad.", "Wellness|Home", "parent|55+|wellness|comfort", 18, 40),
    ("Couples Journal", "Prompt journal for two.", "Gifts|Books", "partner|anniversary|gift|writing", 14, 32),
    ("Massage Oil Set", "Relaxing essential oil blends.", "Wellness|Gifts", "anniversary|partner|wellness|relaxation", 14, 35),
    ("Teen Earbuds", "Wireless earbuds for teens.", "Electronics|Kids", "18-24|13-17|audio|tech", 22, 50),
    ("Backpack", "Laptop or school backpack.", "Office|Travel", "office|travel|backpack|student", 35, 75),
    ("Lunch Bag", "Insulated lunch bag.", "Office|Food", "office|lunch|food|eco", 12, 28),
]

def sample_price(lo: int, hi: int) -> tuple[int, int]:
    w = hi - lo
    p_min = lo + random.randint(0, max(0, w // 2))
    p_max = p_min + random.randint(5, max(10, w // 2))
    return (min(p_min, 99), min(p_max, 120))

def main():
    rows = [["id", "title", "description", "category", "tags", "price_min", "price_max", "amazon_url", "image_url", "locale", "active"]]
    used_titles: set[str] = set()
    for i in range(1, TARGET_ROWS + 1):
        t = random.choice(TEMPLATES)
        title_prefix, desc, category, tag_templates, p_lo, p_hi = t
        # Vary title slightly to avoid duplicates
        suffix = random.choice(["", " Premium", " Set", " Pro", " Deluxe", " Basic", " Classic"])
        title = title_prefix + suffix
        if title in used_titles:
            title = f"{title} ({random.choice(['A','B','II','XL'])}"
        used_titles.add(title)
        price_min, price_max = sample_price(p_lo, p_hi)
        # Occasionally add occasion/relationship/life tags to broaden matching
        extra_tags = []
        if random.random() < 0.3:
            extra_tags.append(random.choice(OCCASIONS))
        if random.random() < 0.25:
            extra_tags.append(random.choice(RELATIONSHIPS))
        if random.random() < 0.25:
            extra_tags.append(random.choice(DAILY_LIFE))
        if random.random() < 0.2:
            extra_tags.append(random.choice(AGE_RANGES))
        tags = tag_templates
        if extra_tags:
            tags = tag_templates + "|" + "|".join(extra_tags)
        rows.append([
            f"prod-{i}",
            title,
            desc,
            category,
            tags,
            str(price_min),
            str(price_max),
            "",
            "",
            "US",
            "true",
        ])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"Wrote {len(rows)-1} products to {OUTPUT}")

if __name__ == "__main__":
    main()
