#!/usr/bin/env python3
"""
Generate enhanced product catalog with better diversity, more realistic products,
and better coverage across occasions, age groups, and interests.
This replaces the synthetic dataset with more gift-appropriate items.
"""
import csv
import random
from pathlib import Path

OUTPUT = Path(__file__).parent.parent / "prisma" / "products.csv"

# Product templates organized by category with realistic details
PRODUCTS = [
    # ===== TECH & ELECTRONICS ===== (Expanded from 50 to 100+)
    ("Wireless Earbuds", "True wireless earbuds with charging case and noise cancellation", "Electronics", 
     "tech|music|wireless|audio|18-24|25-34|birthday|graduation", 40, 80),
    ("Smart Watch", "Fitness tracking smartwatch with heart rate monitor", "Electronics|Fitness", 
     "tech|fitness|health|gadget|25-34|35-44|birthday|graduation", 150, 300),
    ("Portable Bluetooth Speaker", "Waterproof portable speaker with 12-hour battery", "Electronics", 
     "tech|music|party|outdoor|18-24|birthday|friend", 30, 70),
    ("Phone Stand with Wireless Charger", "Adjustable phone stand with fast wireless charging", "Electronics|Office", 
     "tech|office|practical|25-34|coworker|birthday", 25, 45),
    ("Smart LED Light Bulbs", "Color-changing WiFi LED bulbs 4-pack", "Electronics|Home", 
     "tech|home|smart home|mood lighting|25-34|housewarming", 35, 60),
    ("Tablet Stand", "Aluminum adjustable tablet stand for desk or kitchen", "Electronics|Office", 
     "tech|office|cooking|practical|coworker|birthday", 20, 35),
    ("USB-C Hub Adapter", "7-in-1 USB-C hub with HDMI and SD card reader", "Electronics|Office", 
     "tech|office|student|practical|graduation|25-34", 30, 50),
    ("Mechanical Keyboard", "RGB backlit mechanical gaming keyboard", "Electronics|Games", 
     "gaming|tech|office|18-24|25-34|birthday|gamer", 60, 120),
    ("Webcam HD 1080p", "High-definition webcam with built-in microphone", "Electronics|Office", 
     "tech|office|remote work|video calls|25-34|coworker", 40, 70),
    ("Power Bank 20000mAh", "High-capacity portable phone charger", "Electronics|Travel", 
     "tech|travel|practical|student|18-24|birthday", 25, 45),
    
    # ===== GAMING =====
    ("Gaming Mouse", "Ergonomic RGB gaming mouse with programmable buttons", "Electronics|Games", 
     "gaming|tech|pc|18-24|25-34|birthday|gamer", 30, 60),
    ("Gaming Headset", "Surround sound gaming headset with noise-canceling mic", "Electronics|Games", 
     "gaming|audio|tech|18-24|birthday|gamer", 50, 100),
    ("Game Controller", "Wireless game controller compatible with PC and console", "Electronics|Games", 
     "gaming|tech|18-24|birthday|friend|gamer", 40, 70),
    ("Gaming Chair Cushion", "Memory foam seat cushion for gaming chairs", "Games|Comfort", 
     "gaming|comfort|office|25-34|gamer", 30, 50),
    ("Retro Handheld Console", "Classic games handheld console with 500+ games", "Electronics|Games", 
     "gaming|nostalgia|retro|25-34|35-44|birthday|gamer", 35, 60),
    
    # ===== FASHION & ACCESSORIES =====
    ("Leather Wallet", "Genuine leather bi-fold wallet with RFID protection", "Fashion|Gifts", 
     "fashion|leather|practical|25-34|35-44|birthday|father", 30, 55),
    ("Sunglasses", "Polarized UV400 sunglasses with protective case", "Fashion|Outdoors", 
     "fashion|summer|outdoor|travel|18-24|25-34|birthday", 25, 60),
    ("Luxury Watch", "Classic analog watch with leather strap", "Fashion|Jewelry", 
     "fashion|jewelry|luxury|anniversary|25-34|35-44|partner", 100, 250),
    ("Scarf", "Cashmere blend winter scarf", "Fashion", 
     "fashion|winter|cozy|holiday|35-44|45-54|parent", 30, 50),
    ("Leather Belt", "Italian leather dress belt", "Fashion", 
     "fashion|professional|office|25-34|35-44|coworker", 25, 45),
    ("Crossbody Bag", "Canvas crossbody messenger bag", "Fashion|Travel", 
     "fashion|travel|practical|18-24|25-34|student|birthday", 35, 65),
    ("Baseball Cap", "Adjustable baseball cap with premium logo", "Fashion", 
     "fashion|casual|outdoor|18-24|birthday|friend", 15, 30),
    ("Tie Set", "Silk tie with matching pocket square and cufflinks", "Fashion|Office", 
     "fashion|professional|office|graduation|35-44|formal", 30, 55),
    
    # ===== COOKING & KITCHEN =====
    ("Cast Iron Skillet", "Pre-seasoned 12-inch cast iron skillet", "Cooking|Home", 
     "cooking|kitchen|housewarming|25-34|practical", 35, 60),
    ("Knife Set", "Professional chef knife set with wooden block", "Cooking|Home", 
     "cooking|kitchen|chef|housewarming|wedding|anniversary", 70, 150),
    ("Air Fryer", "Digital air fryer with 8 preset cooking functions", "Cooking|Electronics", 
     "cooking|kitchen|healthy|appliance|housewarming|wedding", 60, 120),
    ("Espresso Machine", "Manual espresso maker with milk frother", "Cooking|Home", 
     "coffee|cooking|kitchen|housewarming|coffee lover", 80, 180),
    ("Spice Rack Set", "Rotating spice rack with 20 glass jars", "Cooking|Home", 
     "cooking|kitchen|organization|housewarming|25-34", 25, 45),
    ("Cookbook", "Bestselling cookbook with 200+ recipes", "Cooking|Books", 
     "cooking|reading|food|housewarming|birthday", 20, 35),
    ("Dutch Oven", "Enameled cast iron Dutch oven 6-quart", "Cooking|Home", 
     "cooking|baking|kitchen|housewarming|wedding", 60, 120),
    ("Wine Aerator", "Electric wine aerator and dispenser", "Cooking|Gifts", 
     "wine|cooking|entertaining|anniversary|partner", 30, 55),
    ("Mixing Bowl Set", "Stainless steel mixing bowls 5-piece set", "Cooking|Home", 
     "cooking|baking|kitchen|housewarming|practical", 25, 40),
    ("Kitchen Scale", "Digital kitchen scale with nutritional calculator", "Cooking|Home", 
     "cooking|baking|healthy|fitness|housewarming", 20, 35),
    
    # ===== FITNESS & WELLNESS =====
    ("Yoga Mat", "Extra-thick non-slip yoga mat with carrying strap", "Fitness|Wellness", 
     "yoga|fitness|wellness|exercise|25-34|birthday|health", 25, 50),
    ("Resistance Bands Set", "Fitness resistance bands 5-piece set with bag", "Fitness", 
     "fitness|exercise|gym|home workout|25-34|health", 15, 30),
    ("Foam Roller", "High-density foam roller for muscle recovery", "Fitness|Wellness", 
     "fitness|recovery|massage|gym|25-34|35-44|athlete", 20, 40),
    ("Smart Water Bottle", "Insulated water bottle with time marker", "Fitness|Wellness", 
     "fitness|hydration|gym|health|18-24|25-34|practical", 20, 35),
    ("Fitness Tracker", "Activity and sleep tracker with heart rate monitor", "Electronics|Fitness", 
     "fitness|health|tech|tracker|25-34|birthday|wellness", 50, 100),
    ("Dumbbells Set", "Adjustable dumbbells 5-25 lbs per hand", "Fitness", 
     "fitness|gym|strength|home workout|25-34|35-44", 60, 120),
    ("Jump Rope", "Speed jump rope with counter and weighted handles", "Fitness", 
     "fitness|cardio|exercise|18-24|25-34|gym", 12, 25),
    ("Massage Gun", "Percussion massage gun for muscle recovery", "Fitness|Wellness", 
     "fitness|massage|recovery|wellness|athlete|35-44", 80, 150),
    
    # ===== OUTDOOR & TRAVEL =====
    ("Hiking Backpack", "40L hiking backpack with rain cover", "Outdoors|Travel", 
     "hiking|outdoor|travel|adventure|25-34|backpacking", 50, 100),
    ("Camping Hammock", "Lightweight portable hammock with tree straps", "Outdoors", 
     "camping|outdoor|relaxation|travel|18-24|25-34|summer", 30, 55),
    ("Travel Backpack", "Anti-theft travel backpack with USB charging port", "Travel", 
     "travel|practical|tech|student|25-34|graduation", 40, 75),
    ("Insulated Tumbler", "Stainless steel vacuum tumbler 30oz", "Outdoors|Travel", 
     "travel|coffee|practical|outdoor|25-34|coworker", 20, 35),
    ("Portable Camping Stove", "Compact camping stove with fuel canister", "Outdoors", 
     "camping|outdoor|cooking|adventure|25-34|backpacking", 25, 45),
    ("Headlamp", "Rechargeable LED headlamp for camping and running", "Outdoors|Fitness", 
     "outdoor|camping|running|practical|25-34|adventure", 18, 35),
    ("Picnic Blanket", "Waterproof outdoor picnic blanket extra large", "Outdoors", 
     "outdoor|picnic|beach|summer|family|25-34", 25, 45),
    ("Binoculars", "Compact binoculars for bird watching and travel", "Outdoors", 
     "outdoor|birdwatching|travel|nature|35-44|45-54", 40, 80),
    
    # ===== HOME & DECOR =====
    ("Throw Pillows Set", "Decorative throw pillows 2-pack with covers", "Home", 
     "home|decor|cozy|housewarming|25-34", 25, 45),
    ("Picture Frames Set", "Gallery wall picture frames 7-piece set", "Home|Gifts", 
     "home|decor|photos|memory|housewarming|wedding", 30, 55),
    ("Wall Clock", "Modern minimalist wall clock 12-inch", "Home", 
     "home|decor|practical|housewarming|office", 20, 40),
    ("Candle Set", "Scented soy candles gift set 3-pack", "Home|Gifts", 
     "home|relaxation|aromatherapy|cozy|thank-you|birthday", 20, 35),
    ("Throw Blanket", "Ultra-soft fleece throw blanket", "Home|Comfort", 
     "home|cozy|comfort|winter|housewarming|birthday", 25, 50),
    ("Plant Pot Set", "Ceramic planter pots with drainage 3-pack", "Home|Garden", 
     "home|plants|garden|decor|housewarming", 20, 35),
    ("Essential Oil Diffuser", "Ultrasonic aromatherapy diffuser with LED lights", "Home|Wellness", 
     "home|aromatherapy|wellness|relaxation|housewarming", 25, 45),
    ("String Lights", "LED string lights for bedroom or outdoor", "Home|Outdoors", 
     "home|decor|lighting|cozy|housewarming|18-24", 15, 30),
    ("Doormat", "Personalized welcome doormat coir fiber", "Home", 
     "home|housewarming|practical|decor", 20, 35),
    ("Bedside Lamp", "Touch control table lamp with USB charging port", "Home|Electronics", 
     "home|lighting|bedroom|practical|housewarming", 25, 45),
    
    # ===== OFFICE & PRODUCTIVITY =====
    ("Desk Organizer", "Bamboo desk organizer with phone holder", "Office|Home", 
     "office|organization|desk|work|coworker|graduation", 20, 35),
    ("Notebook Set", "Hardcover journal notebook 3-pack", "Office|Gifts", 
     "office|writing|journal|student|coworker|thank-you", 15, 28),
    ("Pen Set", "Luxury ballpoint pen set in gift box", "Office|Gifts", 
     "office|writing|professional|graduation|coworker", 25, 50),
    ("Monitor Stand", "Adjustable laptop and monitor stand with storage", "Office|Electronics", 
     "office|desk|ergonomic|work|remote work|coworker", 30, 55),
    ("Cable Management Kit", "Desk cable organizer and cord holder set", "Office|Electronics", 
     "office|organization|tech|practical|coworker", 12, 22),
    ("Whiteboard", "Magnetic dry erase board with markers", "Office|Home", 
     "office|organization|planning|student|home office", 20, 40),
    ("Bookends", "Decorative metal bookends pair", "Office|Home", 
     "office|home|organization|books|decor", 15, 30),
    ("Letter Opener", "Vintage brass letter opener", "Office|Gifts", 
     "office|vintage|professional|executive|thank-you", 12, 25),
    
    # ===== BOOKS & LEARNING =====
    ("Kindle E-Reader", "Digital e-reader with adjustable backlight", "Electronics|Books", 
     "reading|tech|books|student|25-34|birthday", 80, 140),
    ("Book Light", "Rechargeable LED book reading light clip-on", "Books", 
     "reading|books|practical|student|book lover", 12, 22),
    ("Bookshelf", "5-tier ladder bookshelf", "Home|Books", 
     "books|home|storage|housewarming|student", 50, 90),
    ("Bestseller Novel", "Current bestselling fiction hardcover", "Books", 
     "reading|books|fiction|birthday|book lover", 15, 28),
    ("Self-Help Book", "Popular self-improvement book", "Books", 
     "reading|personal growth|motivation|graduation", 12, 25),
    
    # ===== ART & CREATIVITY =====
    ("Watercolor Paint Set", "Professional watercolor set with brushes", "Creative|Art", 
     "art|painting|creative|hobby|18-24|birthday", 25, 50),
    ("Sketchbook", "Hardcover artist sketchbook 100 pages", "Creative|Art", 
     "art|drawing|creative|student|birthday", 12, 22),
    ("Adult Coloring Book", "Intricate designs coloring book with colored pencils", "Creative|Gifts", 
     "art|relaxation|stress relief|creative|25-34", 15, 25),
    ("Calligraphy Set", "Fountain pen calligraphy set for beginners", "Creative|Office", 
     "art|writing|creative|hobby|25-34|birthday", 20, 40),
    ("Craft Kit", "DIY craft project kit with all materials", "Creative|Gifts", 
     "creative|craft|hobby|DIY|25-34|birthday", 25, 45),
    ("LEGO Set", "Architecture or creator expert LEGO building set", "Creative|Games", 
     "building|creative|hobby|display|25-34|35-44|birthday", 60, 150),
    ("3D Pen", "3D printing pen with filament refills", "Creative|Electronics", 
     "tech|creative|art|hobby|18-24|birthday", 30, 60),
    
    # ===== FOOD & BEVERAGE =====
    ("Coffee Sampler", "Gourmet coffee beans variety pack", "Food|Gifts", 
     "coffee|food|gift|coffee lover|thank-you", 20, 35),
    ("Tea Set", "Premium loose leaf tea collection gift box", "Food|Gifts", 
     "tea|food|gift|relaxation|thank-you", 20, 40),
    ("Chocolate Box", "Artisan chocolate truffles gift box", "Food|Gifts", 
     "chocolate|food|gift|sweet|birthday|thank-you", 15, 35),
    ("Hot Sauce Set", "Gourmet hot sauce variety pack", "Food|Gifts", 
     "food|spicy|gift|cooking|birthday", 18, 32),
    ("Whiskey Stones", "Reusable whiskey chilling stones set", "Food|Gifts", 
     "whiskey|drinks|gift|25-34|35-44|anniversary", 15, 28),
    ("Wine Glasses Set", "Crystal wine glasses 4-pack", "Food|Home", 
     "wine|entertaining|home|housewarming|wedding", 30, 60),
    ("Cocktail Shaker Set", "Stainless steel cocktail making kit", "Food|Gifts", 
     "drinks|cocktails|entertaining|25-34|birthday", 25, 45),
    ("Cheese Board Set", "Bamboo cheese board with knives", "Food|Home", 
     "food|entertaining|wine|housewarming|wedding", 30, 55),
    
    # ===== PETS =====
    ("Pet Bed", "Orthopedic pet bed for dogs and cats", "Pets", 
     "pets|dog|cat|comfort|pet lover", 30, 60),
    ("Pet Toy Set", "Interactive pet toys variety pack", "Pets", 
     "pets|dog|cat|play|pet lover", 15, 30),
    ("Pet Grooming Kit", "Professional pet grooming tools set", "Pets", 
     "pets|grooming|dog|cat|pet lover", 25, 45),
    ("Automatic Pet Feeder", "Programmable automatic pet food dispenser", "Pets|Electronics", 
     "pets|tech|practical|pet lover|travel", 40, 80),
    ("Pet Camera", "WiFi pet camera with treat dispenser", "Pets|Electronics", 
     "pets|tech|surveillance|pet lover", 60, 120),
    
    # ===== BABY & KIDS =====
    ("Baby Monitor", "Video baby monitor with night vision", "Baby|Electronics", 
     "baby|parents|tech|baby shower|new parent", 60, 120),
    ("Diaper Bag", "Multi-pocket baby diaper backpack", "Baby", 
     "baby|practical|parents|baby shower|new parent", 35, 65),
    ("Baby Clothes Set", "Organic cotton baby onesies 5-pack", "Baby", 
     "baby|clothing|practical|baby shower|new parent", 20, 40),
    ("Baby Books Set", "Board books for babies 6-pack", "Baby|Books", 
     "baby|books|learning|baby shower|new parent", 18, 32),
    ("Teething Toys", "BPA-free silicone teething toys set", "Baby", 
     "baby|toys|teething|baby shower|new parent", 12, 22),
    ("Night Light", "Star projector baby night light", "Baby|Home", 
     "baby|sleep|lighting|baby shower|new parent", 20, 35),
    ("Kids Building Blocks", "Large building blocks set for toddlers", "Kids|Games", 
     "kids|toys|building|creative|13-17|birthday", 25, 50),
    ("Children's Book", "Popular illustrated children's storybook", "Kids|Books", 
     "kids|books|reading|birthday|13-17", 10, 20),
    
    # ===== JEWELRY =====
    ("Pendant Necklace", "Sterling silver pendant necklace", "Jewelry", 
     "jewelry|fashion|gift|anniversary|birthday|partner", 40, 80),
    ("Bracelet", "Personalized engraved bracelet", "Jewelry|Gifts", 
     "jewelry|personalized|gift|birthday|anniversary", 30, 60),
    ("Earrings", "Stud or hoop earrings set", "Jewelry", 
     "jewelry|fashion|gift|birthday|partner", 20, 50),
    ("Ring", "Fashion ring with gemstone", "Jewelry", 
     "jewelry|fashion|gift|birthday|anniversary", 35, 70),
    ("Watch", "Minimalist analog wristwatch", "Jewelry|Fashion", 
     "jewelry|watch|fashion|birthday|graduation", 50, 120),
    
    # ===== BEAUTY & PERSONAL CARE =====
    ("Skincare Set", "Complete skincare routine gift set", "Beauty|Gifts", 
     "beauty|skincare|self-care|birthday|partner", 40, 80),
    ("Makeup Organizer", "Acrylic makeup organizer with drawers", "Beauty|Home", 
     "beauty|organization|makeup|practical|18-24", 20, 40),
    ("Hair Styling Tool", "Professional hair straightener or curling iron", "Beauty|Electronics", 
     "beauty|hair|styling|birthday|25-34", 40, 90),
    ("Fragrance Set", "Luxury perfume or cologne gift set", "Beauty|Gifts", 
     "beauty|fragrance|luxury|birthday|anniversary", 50, 120),
    ("Bath Bombs Set", "Luxury bath bombs gift set 12-pack", "Beauty|Wellness", 
     "beauty|bath|relaxation|self-care|thank-you", 18, 32),
    ("Face Mask Set", "Korean sheet masks variety pack", "Beauty|Wellness", 
     "beauty|skincare|self-care|spa|birthday", 15, 28),
    
    # ===== MUSIC =====
    ("Guitar Capo", "Professional guitar capo with tuner", "Music", 
     "music|guitar|musician|hobby|birthday", 12, 22),
    ("Music Stand", "Portable folding music sheet stand", "Music", 
     "music|musician|practice|student", 15, 30),
    ("Record Player", "Vintage style turntable record player", "Music|Electronics", 
     "music|vinyl|retro|home|25-34|35-44|birthday", 80, 180),
    ("Vinyl Records", "Classic album vinyl record", "Music", 
     "music|vinyl|retro|collector|birthday", 15, 35),
    ("Instrument Case", "Padded gig bag for guitar or keyboard", "Music|Travel", 
     "music|musician|travel|protection", 30, 60),
    
    # ===== EXPERIENCE & UNIQUE =====
    ("Puzzle 1000 Pieces", "Scenic landscape jigsaw puzzle", "Games|Gifts", 
     "puzzle|hobby|relaxation|family|35-44|45-54", 12, 25),
    ("Board Game", "Strategy or party board game", "Games|Gifts", 
     "games|party|family|fun|birthday|friend", 20, 50),
    ("Playing Cards", "Luxury playing cards deck", "Games|Gifts", 
     "cards|games|magic|gift|birthday", 10, 20),
    ("Chess Set", "Wooden chess set with folding board", "Games", 
     "chess|strategy|games|gift|25-34|35-44", 25, 60),
    ("Terrarium Kit", "DIY glass terrarium with succulent plants", "Home|Garden|Creative", 
     "plants|DIY|home|creative|housewarming", 25, 45),
]

def generate_csv():
    """Generate enhanced products CSV with better diversity and quality"""
    rows = [["id", "title", "description", "category", "tags", "price_min", "price_max", "amazon_url", "image_url", "locale", "active"]]
    
    # Add base products
    for idx, (title, desc, category, tags, price_min, price_max) in enumerate(PRODUCTS, 1):
        rows.append([
            f"prod-{idx}",
            title,
            desc,
            category,
            tags,
            price_min,
            price_max,
            "",  # amazon_url - can add later
            "",  # image_url - can add later
            "US",
            "true"
        ])
    
    # Add price-point variants (budget, mid, premium versions of popular items)
    variant_groups = [
        ("Water Bottle", [
            ("Budget Water Bottle", "BPA-free plastic water bottle 32oz", "Fitness", "fitness|hydration|practical|budget", 8, 12),
            ("Premium Insulated Bottle", "Double-wall vacuum insulated bottle 40oz", "Fitness|Outdoors", "fitness|premium|insulated|hydration", 35, 50),
        ]),
        ("Backpack", [
            ("School Backpack", "Classic school backpack with laptop sleeve", "Office|Travel", "student|school|practical|18-24", 20, 35),
            ("Hiking Backpack 60L", "Professional trekking backpack with frame", "Outdoors|Travel", "hiking|camping|adventure|premium", 90, 150),
        ]),
        ("Coffee Maker", [
            ("Pour Over Coffee Set", "Manual pour over coffee maker kit", "Cooking|Home", "coffee|manual|brewing|coffee lover", 20, 35),
            ("Automatic Coffee Maker", "12-cup programmable drip coffee maker", "Cooking|Electronics", "coffee|automatic|kitchen|housewarming", 40, 80),
        ]),
    ]
    
    base_id = len(PRODUCTS) + 1
    for group_name, variants in variant_groups:
        for title, desc, category, tags, price_min, price_max in variants:
            rows.append([
                f"prod-{base_id}",
                title,
                desc,
                category,
                tags,
                price_min,
                price_max,
                "",
                "",
                "US",
                "true"
            ])
            base_id += 1
    
    # Write CSV
    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print(f"✅ Generated {len(rows)-1} products to {OUTPUT}")
    print(f"\n📊 Statistics:")
    print(f"   - Total products: {len(rows)-1}")
    
    # Category breakdown
    categories = {}
    for row in rows[1:]:
        cat = row[3]
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"   - Unique categories: {len(categories)}")
    print(f"\n🏆 Top 10 categories:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:10]:
        print(f"      {cat}: {count}")
    
    # Price analysis
    prices = [int(row[6]) for row in rows[1:]]
    print(f"\n💰 Price distribution:")
    print(f"   - Average price: ${sum(prices)/len(prices):.2f}")
    print(f"   - Price range: ${min(prices)}-${max(prices)}")
    low = sum(1 for p in prices if p < 20)
    mid = sum(1 for p in prices if 20 <= p < 60)
    high = sum(1 for p in prices if p >= 60)
    print(f"   - Budget (<$20): {low}")
    print(f"   - Mid ($20-$60): {mid}")
    print(f"   - Premium (>$60): {high}")

if __name__ == "__main__":
    generate_csv()
