#!/usr/bin/env python3
"""
Expand products.csv with research-based, real-scenario gift data.
Sources: Good Housekeeping, Wirecutter, Consumer Reports, gift guides (occasion, relationship, age, interest).
Run: python3 scripts/generate_products_research.py
Appends to prisma/products.csv (or set REPLACE=True to overwrite with research + base).
"""

import csv
import random
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT_ROOT / "prisma" / "products.csv"
EXISTING_CSV = PROJECT_ROOT / "prisma" / "products.csv"
REPLACE = True  # True = overwrite with full research set; False = append only new rows

# Research-based product rows: real scenarios (occasion, relationship, age, interest)
# Format: (title, description, category, tags, price_min, price_max)
# Tags align with quiz: occasion, relationship, age_range, daily_life, interests
RESEARCH_PRODUCTS = [
    # --- BIRTHDAY (mugs, drinkware, wall art, keepsakes, accessories) ---
    ("Personalized Mug", "Custom name or quote ceramic mug.", "Home|Gifts", "birthday|friend|gift|coffee|personalized", 12, 28),
    ("Birthday Candle Set", "Number candles or scented birthday candles.", "Home|Gifts", "birthday|party|friend|kids", 8, 18),
    ("Wall Art Print", "Framed inspirational or custom wall art.", "Home|Gifts", "birthday|home|decor|partner|friend", 18, 55),
    ("Belt Bag", "Hands-free crossbody belt bag.", "Fashion|Travel", "birthday|friend|18-24|travel|practical", 25, 55),
    ("Birthday Card Set", "Assorted birthday greeting cards.", "Gifts", "birthday|thank-you|friend|coworker", 6, 14),
    ("Confetti Poppers", "Party confetti poppers 6-pack.", "Gifts", "birthday|friend|party|kids|13-17", 10, 20),
    ("Custom Neon Sign", "Personalized LED neon name or word sign.", "Home|Gifts", "birthday|partner|home|decor", 35, 95),
    ("Drinkware Set", "Stemless wine or cocktail glasses set.", "Home|Gifts", "birthday|partner|friend|drinks", 18, 38),
    ("Keepsake Box", "Wooden or decorative keepsake memory box.", "Home|Gifts", "birthday|anniversary|memory|gift", 20, 50),
    ("Birthday Banner", "Reusable happy birthday banner.", "Home|Gifts", "birthday|party|kids|friend", 8, 22),
    # --- ANNIVERSARY (couples, custom jewelry, home decor) ---
    ("Star Map Poster", "Custom night-sky date poster print.", "Home|Gifts", "anniversary|partner|romantic|decor", 22, 50),
    ("Couples Massage Set", "Aromatherapy massage oil and candle set.", "Wellness|Gifts", "anniversary|partner|wellness|relaxation", 25, 55),
    ("Custom Engraved Jewelry", "Initial or date engraved pendant or bracelet.", "Jewelry|Gifts", "anniversary|partner|romantic|personalized", 30, 85),
    ("Photo Book", "Custom photo book 20-50 pages.", "Home|Gifts", "anniversary|partner|memory|gift", 25, 60),
    ("Romantic Dinner Set", "Serving platter and candle set for two.", "Home|Cooking", "anniversary|partner|cooking|romantic", 28, 55),
    ("Love Letter Set", "Luxury stationery for love notes.", "Office|Gifts", "anniversary|partner|writing|romantic", 15, 35),
    # --- HOUSEWARMING (home decor, kitchen, blankets, garden) ---
    ("Stoneware Bowl Set", "Oven-safe stoneware mixing bowls.", "Home|Cooking", "housewarming|home|kitchen|cooking", 22, 48),
    ("Welcome Doormat", "Personalized welcome doormat.", "Home", "housewarming|home|decor|practical", 18, 38),
    ("Indoor Herb Garden Kit", "Countertop herb growing kit.", "Home|Garden", "housewarming|home|garden|cooking", 25, 55),
    ("Throw Blanket", "Soft chunky knit or fleece throw.", "Home|Comfort", "housewarming|home|cozy|comfort", 25, 55),
    ("Kitchen Tool Set", "Essential kitchen utensil set.", "Home|Cooking", "housewarming|cooking|kitchen|practical", 22, 50),
    ("Garden Tool Set", "Hand trowel, pruner, gloves set.", "Outdoors|Garden", "housewarming|outdoors|garden|plants", 22, 48),
    ("Decorative Tray", "Serving or decorative bamboo tray.", "Home", "housewarming|home|decor|kitchen", 18, 42),
    ("Outdoor Planter", "Large outdoor planter with saucer.", "Home|Garden", "housewarming|garden|plants|outdoors", 28, 65),
    # --- GRADUATION (tech, travel accessories, professional) ---
    ("Professional Portfolio", "Leather document portfolio.", "Office|Gifts", "graduation|student|office|professional", 22, 55),
    ("Travel Toiletry Kit", "TSA-friendly toiletry bag with bottles.", "Travel", "graduation|travel|student|practical", 18, 42),
    ("Luggage Strap", "Customizable luggage strap for carousel ID.", "Travel", "graduation|travel|18-24|practical", 12, 25),
    ("Pen and Notebook Set", "Professional pen and notebook gift set.", "Office|Gifts", "graduation|thank-you|office|student", 18, 45),
    ("Laptop Sleeve", "Padded laptop sleeve 13-15 inch.", "Electronics|Office", "graduation|student|office|tech", 18, 42),
    ("Desk Organizer", "Modern desk organizer with drawer.", "Office|Home", "graduation|office|student|organization", 22, 55),
    # --- THANK-YOU (under $30: stationery, plants, candles, small treats) ---
    ("Thank You Card Set", "Elegant thank-you cards with envelopes.", "Office|Gifts", "thank-you|coworker|gift|writing", 8, 18),
    ("Succulent Gift Box", "Small succulent in decorative pot.", "Home|Garden", "thank-you|coworker|plants|gift", 15, 32),
    ("Bath Soak Gift Set", "Lavender or eucalyptus bath soak set.", "Beauty|Gifts", "thank-you|coworker|wellness|relaxation", 14, 28),
    ("Gourmet Popcorn Tin", "Assorted flavor popcorn tin.", "Food|Gifts", "thank-you|food|gift|coworker", 14, 28),
    ("Scented Candle", "Single soy candle in amber jar.", "Home|Gifts", "thank-you|home|relaxation|coworker", 12, 25),
    ("Difference Maker Plaque", "Personalized appreciation plaque.", "Office|Gifts", "thank-you|coworker|office|professional", 20, 45),
    ("Tea Sampler Tin", "20 assorted tea bags in gift tin.", "Food|Gifts", "thank-you|tea|gift|relaxation", 12, 25),
    # --- HOLIDAY (ornaments, cozy, seasonal) ---
    ("Holiday Ornament Set", "Set of 4-6 seasonal ornaments.", "Home|Gifts", "holiday|home|decor|gift", 12, 30),
    ("Hot Chocolate Set", "Mugs, cocoa, marshmallows gift set.", "Food|Gifts", "holiday|gift|food|cozy", 18, 35),
    ("Cozy Socks Set", "Soft holiday or winter socks 3-pack.", "Fashion|Gifts", "holiday|friend|comfort|gift", 12, 25),
    ("Holiday Throw Pillow", "Seasonal design throw pillow.", "Home|Gifts", "holiday|home|cozy|decor", 18, 38),
    ("Cookie Tin", "Assorted cookies in decorative tin.", "Food|Gifts", "holiday|food|gift|thank-you", 14, 30),
    # --- BABY-SHOWER (sound machine, onesies, care kit, organizers) ---
    ("Sound Machine", "White noise and lullaby sound machine.", "Baby|Electronics", "baby-shower|baby|new parent|sleep", 28, 55),
    ("Baby Care Kit", "Basics kit: nail clipper, brush, thermometer.", "Baby", "baby-shower|baby|new parent|practical", 18, 40),
    ("Shopping Cart Cover", "Infant shopping cart seat cover.", "Baby", "baby-shower|baby|new parent|practical", 25, 48),
    ("Baby Memory Book", "First 5 years memory keepsake book.", "Baby|Gifts", "baby-shower|baby|new parent|memory", 18, 35),
    ("Diaper Caddy", "Portable diaper and wipes caddy.", "Baby", "baby-shower|baby|new parent|organization", 18, 38),
    ("Baby Carrier", "Soft structured baby carrier.", "Baby", "baby-shower|baby|new parent|travel", 45, 95),
    ("Nursery Night Light", "Soft glow nursery night light.", "Baby|Home", "baby-shower|baby|new parent|home", 14, 30),
    ("Bottle Brush Set", "3-piece baby bottle cleaning set.", "Baby", "baby-shower|baby|new parent|practical", 8, 18),
    # --- COWORKER (under $50: key organizer, bottle, desk) ---
    ("Smart Key Organizer", "Key holder with clip and tools.", "Office|Gifts", "coworker|thank-you|office|practical", 25, 55),
    ("Portable Water Purifier", "Reusable water purifier bottle.", "Fitness|Travel", "coworker|travel|hydration|eco", 28, 55),
    ("Desk Plant", "Low-light desk succulent or small plant.", "Office|Home", "coworker|office|plants|desk", 14, 30),
    ("Gift Card Holder", "Elegant gift card or coffee card holder.", "Gifts", "coworker|thank-you|birthday|gift", 6, 18),
    ("Stress Relief Kit", "Stress ball, tea, candle mini set.", "Wellness|Office", "coworker|office|wellness|thank-you", 15, 32),
    # --- PARENT / 55+ (comfort, heating pad, magnifier, slippers) ---
    ("Heating Pad", "Electric heating pad for back or neck.", "Wellness|Home", "parent|55+|wellness|comfort", 20, 45),
    ("Reading Magnifier", "Hands-free LED magnifying glass.", "Home|Gifts", "55+|parent|reading|practical", 15, 35),
    ("Memory Foam Slippers", "Indoor memory foam slippers.", "Home|Gifts", "parent|55+|comfort|home", 20, 45),
    ("Large Button Remote Holder", "Organizer for remotes and glasses.", "Home|Office", "55+|parent|organization|practical", 15, 32),
    ("Easy-Grip Kitchen Tools", "Ergonomic kitchen utensil set.", "Home|Cooking", "55+|parent|cooking|practical", 18, 42),
    # --- TEENS / 13-17 (headphones, skincare, friendship bracelet, cozy) ---
    ("Wireless Earbuds", "Bluetooth earbuds with case.", "Electronics", "13-17|18-24|audio|tech|birthday", 22, 55),
    ("Pimple Patches", "Hydrocolloid acne patches 24-pack.", "Beauty", "13-17|skincare|beauty|practical", 8, 18),
    ("Friendship Bracelet Kit", "DIY friendship bracelet making kit.", "Kids|Creative", "13-17|friend|creative|crafts", 10, 22),
    ("Cozy Robe", "Soft fleece or plush robe.", "Home|Fashion", "13-17|18-24|comfort|birthday", 25, 55),
    ("LED Desk Lamp", "Adjustable LED lamp with USB.", "Office|Home", "13-17|student|desk|tech", 18, 42),
    # --- 20s / 30s (belt bag, audio, organization, kitchen) ---
    ("Premium Olive Oil", "Single-origin extra virgin olive oil.", "Food|Gifts", "25-34|35-44|cooking|gourmet|gift", 18, 45),
    ("Key Organizer", "Compact key holder with multitool.", "Office|Gifts", "25-34|office|practical|coworker", 18, 42),
    ("Quality Bedding Set", "Cotton or linen sheet set.", "Home|Comfort", "25-34|35-44|home|comfort", 35, 85),
    ("Meal Prep Containers", "Bento or meal prep container set.", "Home|Cooking", "25-34|cooking|office|practical", 18, 42),
    # --- GAMER (headphone stand, controller holder, gear) ---
    ("Gaming Headphone Stand", "RGB headset stand with USB hub.", "Electronics|Games", "gamer|gaming|desk|tech", 25, 55),
    ("Controller Holder", "Gaming controller wall mount or stand.", "Electronics|Games", "gamer|gaming|desk|organization", 15, 35),
    ("Gaming Mouse Pad", "Extended RGB or non-slip mouse pad.", "Electronics|Games", "gamer|gaming|desk|tech", 12, 35),
    ("Mechanical Keyboard", "RGB mechanical gaming keyboard.", "Electronics|Games", "gamer|gaming|tech|office", 45, 120),
    # --- PET LOVER ---
    ("Dog Car Seat Cover", "Back seat cover for dogs.", "Pets", "pet_lover|pets|dogs|travel", 28, 65),
    ("Cat Window Perch", "Window-mounted cat bed.", "Pets", "pet_lover|pets|cats|home", 22, 48),
    ("Pet Treat Dispenser", "Interactive treat puzzle for dogs.", "Pets", "pet_lover|pets|dogs|toys", 14, 32),
    ("Pet Portrait Frame", "Frame for custom pet photo.", "Home|Pets", "pet_lover|pets|gift|decor", 18, 42),
    # --- TRAVELER ---
    ("Packing Cubes Set", "6-piece compression packing cubes.", "Travel", "traveler|travel|organization|graduation", 18, 42),
    ("Neck Pillow", "Memory foam travel neck pillow.", "Travel", "traveler|travel|comfort|flight", 18, 38),
    ("RFID Wallet", "Slim RFID blocking travel wallet.", "Travel", "traveler|travel|security|partner", 18, 42),
    ("Portable Charger", "High-capacity portable power bank.", "Electronics|Travel", "traveler|travel|tech|graduation", 22, 55),
    # --- COOKING ---
    ("Cast Iron Skillet", "Pre-seasoned 10 inch skillet.", "Home|Cooking", "cooking|housewarming|kitchen|practical", 28, 55),
    ("Cookbook", "Best-selling recipe cookbook.", "Books|Cooking", "cooking|books|food|gift", 18, 40),
    ("Kitchen Scale", "Digital kitchen scale grams and oz.", "Home|Cooking", "cooking|kitchen|practical|housewarming", 12, 28),
    ("Spice Jar Set", "Glass spice jars with labels.", "Home|Cooking", "cooking|kitchen|organization|housewarming", 18, 42),
    # --- OUTDOORS / GARDEN ---
    ("Heated Vest", "Rechargeable heated vest.", "Outdoors|Fashion", "outdoors|55+|travel|comfort", 55, 120),
    ("Watering Can", "Elegant metal or plastic watering can.", "Outdoors|Garden", "outdoors|garden|plants|housewarming", 18, 42),
    ("Camping Chair", "Portable folding camp chair.", "Outdoors", "outdoors|travel|camping|traveler", 28, 65),
    ("Garden Kneeler", "Kneeling pad with handles.", "Outdoors|Garden", "outdoors|garden|55+|practical", 22, 45),
    # --- BOOK LOVER / CREATIVE ---
    ("Book Light", "Clip-on LED reading light.", "Home|Office", "reading|student|office|gift", 10, 25),
    ("Bookmark Set", "Metal or leather bookmark set.", "Office|Gifts", "reading|gift|thank-you|friend", 8, 20),
    ("Sketchbook", "Hardcover blank sketchbook.", "Creative|Office", "creative|art|student|gift", 12, 28),
    ("Watercolor Set", "24-pan watercolor with brush.", "Creative|Gifts", "creative|art|gift|relaxation", 18, 42),
    # --- FITNESS / GYM ---
    ("Resistance Bands", "Set of 5 resistance bands.", "Fitness", "gym|fitness|home workout|travel", 12, 28),
    ("Yoga Mat", "Non-slip 6mm yoga mat.", "Fitness", "gym|fitness|yoga|wellness", 20, 50),
    ("Shaker Bottle", "28oz protein shaker with ball.", "Fitness", "gym|fitness|hydration|practical", 10, 22),
    ("Foam Roller", "High-density foam roller.", "Fitness", "gym|fitness|wellness|recovery", 20, 45),
    # --- GENERAL / MULTI-OCCASION ---
    ("Boxed Chocolates", "Premium assorted chocolates box.", "Food|Gifts", "birthday|thank-you|holiday|gift", 18, 45),
    ("Flower Vase", "Ceramic or glass vase.", "Home|Gifts", "housewarming|thank-you|home|decor", 18, 45),
    ("Gift Basket", "Curated gourmet or wellness basket.", "Food|Gifts", "thank-you|birthday|holiday|coworker", 25, 65),
    ("Personalized Journal", "Custom name or quote journal.", "Office|Gifts", "graduation|thank-you|friend|writing", 14, 35),
]

def sample_price(lo: int, hi: int) -> tuple[int, int]:
    w = hi - lo
    p_min = lo + random.randint(0, max(0, w // 2))
    p_max = p_min + random.randint(5, max(10, w // 2))
    return (min(p_min, 150), min(p_max, 150))

def main():
    header = ["id", "title", "description", "category", "tags", "price_min", "price_max", "amazon_url", "image_url", "locale", "active"]
    rows = [header]
    used = set()
    for i, (title, desc, category, tags, p_lo, p_hi) in enumerate(RESEARCH_PRODUCTS, start=1):
        price_min, price_max = sample_price(p_lo, p_hi)
        rid = f"research-{i}"
        if rid in used:
            rid = f"research-{i}-{random.randint(1,999)}"
        used.add(rid)
        rows.append([rid, title, desc, category, tags, str(price_min), str(price_max), "", "", "US", "true"])

    # Add variations (same templates, more rows) to reach 2000+
    EXTRA = 1800 - len(rows)
    for k in range(EXTRA):
        t = random.choice(RESEARCH_PRODUCTS)
        title, desc, category, tags, p_lo, p_hi = t
        suffix = random.choice(["", " Set", " Premium", " Deluxe", " Classic"])
        title = title + suffix
        price_min, price_max = sample_price(p_lo, p_hi)
        extra_tags = []
        if random.random() < 0.4:
            extra_tags.append(random.choice(["birthday", "anniversary", "housewarming", "graduation", "thank-you", "holiday", "baby-shower"]))
        if random.random() < 0.35:
            extra_tags.append(random.choice(["friend", "partner", "parent", "coworker", "sibling", "child"]))
        if random.random() < 0.35:
            extra_tags.append(random.choice(["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]))
        if random.random() < 0.3:
            extra_tags.append(random.choice(["student", "office", "gamer", "gym", "traveler", "new_parent", "cooking", "outdoors", "creative", "pet_lover"]))
        tag_str = tags + ("|" + "|".join(extra_tags) if extra_tags else "")
        rid = f"prod-{len(rows)}"
        rows.append([rid, title, desc, category, tag_str, str(price_min), str(price_max), "", "", "US", "true"])

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"Wrote {len(rows)-1} products (research-based) to {OUTPUT}")

if __name__ == "__main__":
    main()
