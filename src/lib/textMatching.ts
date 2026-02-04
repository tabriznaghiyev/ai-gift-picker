/**
 * COMPREHENSIVE FUZZY MATCHING DATASET
 * Massive synonym database covering thousands of terms for perfect gift matching
 */

// Simple stemming rules (removes common suffixes)
const STEMMING_RULES = [
  { pattern: /ing$/i, replacement: "" },
  { pattern: /ed$/i, replacement: "" },
  { pattern: /er$/i, replacement: "" },
  { pattern: /ers$/i, replacement: "" },
  { pattern: /s$/i, replacement: "" },
  { pattern: /ies$/i, replacement: "y" },
  { pattern: /ness$/i, replacement: "" },
];

// MASSIVE SYNONYM MAP - covers virtually any gift-related term
const SYNONYM_MAP: Record<string, string[]> = {
  // === SPORTS & FITNESS ===
  "fitness": ["gym", "exercise", "workout", "health", "wellness", "training", "athlete", "active", "sport"],
  "gym": ["fitness", "exercise", "workout", "weights", "training", "bodybuilding", "crossfit"],
  "yoga": ["wellness", "meditation", "fitness", "flexibility", "zen", "namaste", "pilates"],
  "running": ["jogging", "fitness", "cardio", "marathon", "runner", "track", "sprint"],
  "cycling": ["bike", "bicycle", "biker", "mountain bike", "road bike", "cycling"],
  "swimming": ["swim", "pool", "water", "lap", "swimmer"],
  "hiking": ["outdoor", "nature", "trekking", "backpacking", "trail", "mountain"],
  "climbing": ["rock climbing", "bouldering", "mountaineering", "rappelling"],

  // === TECH & ELECTRONICS ===
  "gaming": ["games", "gamer", "video games", "esports", "pc", "console", "playstation", "xbox", "nintendo", "switch"],
  "gamer": ["gaming", "games", "esports", "streamer", "twitch"],
  "tech": ["technology", "gadget", "electronics", "digital", "smart", "device", "high-tech"],
  "computer": ["pc", "laptop", "desktop", "tech", "computing", "macbook", "windows"],
  "smartphone": ["phone", "mobile", "iphone", "android", "cell", "samsung"],
  "tablet": ["ipad", "kindle", "android tablet", "e-reader"],
  "smartwatch": ["watch", "fitness tracker", "apple watch", "wearable"],
  "headphones": ["earbuds", "airpods", "audio", "music", "wireless"],
  "keyboard": ["mechanical", "typing", "gaming keyboard", "wireless keyboard"],
  "mouse": ["gaming mouse", "wireless mouse", "trackpad"],

  // === CREATIVE & ARTS ===
  "art": ["creative", "painting", "drawing", "artistic", "artist", "craft"],
  "creative": ["art", "craft", "diy", "maker", "artistic", "crafty", "handmade"],
  "painting": ["art", "artist", "watercolor", "acrylic", "oil painting", "canvas"],
  "drawing": ["art", "sketch", "sketching", "illustration", "pencil"],
  "photography": ["photo", "camera", "photographer", "photos", "pictures", "canon", "nikon", "sony"],
  "music": ["musical", "musician", "audio", "sound", "instrument", "band", "guitar", "piano"],
  "guitar": ["music", "musician", "acoustic", "electric", "bass"],
  "piano": ["music", "keyboard", "keys", "musician"],
  "singing": ["vocal", "singer", "karaoke", "music", "voice"],
  "crafts": ["craft", "diy", "handmade", "creative", "maker", "crafty"],
  "diy": ["craft", "handmade", "creative", "maker", "build", "project"],
  "sewing": ["craft", "tailor", "fabric", "needle", "quilting"],
  "knitting": ["craft", "yarn", "wool", "crochet"],
  "woodworking": ["carpenter", "woodwork", "diy", "craft", "build"],

  // === FOOD & COOKING ===
  "cooking": ["cook", "chef", "culinary", "kitchen", "baking", "food", "recipe", "cuisine"],
  "baking": ["baker", "cook", "cooking", "pastry", "bread", "cakes", "dessert"],
  "chef": ["cooking", "cook", "culinary", "kitchen", "professional chef"],
  "wine": ["drinks", "beverage", "sommelier", "vineyard", "red wine", "white wine", "winery"],
  "coffee": ["cafe", "espresso", "barista", "caffeine", "latte", "cappuccino", "brew"],
  "tea": ["chai", "beverage", "matcha", "green tea", "herbal"],
  "cocktails": ["drinks", "mixology", "bartender", "bar", "alcohol", "spirits"],
  "bbq": ["grill", "grilling", "barbecue", "outdoor", "smoking", "meat"],
  "vegan": ["vegetarian", "plant-based", "healthy", "organic"],
  "foodie": ["food", "cooking", "culinary", "gourmet", "eats", "dining"],

  // === OUTDOOR & TRAVEL ===
  "outdoor": ["outdoors", "nature", "hiking", "camping", "adventure", "wilderness"],
  "travel": ["traveler", "traveling", "trip", "vacation", "adventure", "wanderlust", "explorer"],
  "camping": ["outdoor", "nature", "backpacking", "tent", "wilderness"],
  "beach": ["ocean", "sea", "summer", "surf", "coastal", "tropical"],
  "surfing": ["surf", "beach", "ocean", "water sports", "waves"],
  "skiing": ["ski", "snow", "winter", "mountain", "snowboard"],
  "snowboarding": ["snowboard", "snow", "winter", "mountain", "ski"],
  "fishing": ["angler", "fish", "outdoor", "lake", "river", "ocean"],
  "boating": ["boat", "sailing", "yacht", "marina", "nautical", "sail"],

  // === HOME & LIFESTYLE ===
  "home": ["house", "decor", "interior", "living", "apartment", "homeowner"],
  "decor": ["decoration", "home", "interior", "design", "style"],
  "gardening": ["garden", "plants", "outdoor", "flowers", "green thumb", "landscape"],
  "plants": ["garden", "green thumb", "indoor plants", "succulents", "flowers"],
  "reading": ["books", "reader", "literature", "book lover", "bookworm"],
  "books": ["reading", "reader", "literature", "novel", "bookworm"],
  "writing": ["writer", "author", "journal", "creative writing", "blogger"],
  "movies": ["film", "cinema", "tv", "entertainment", "netflix", "streaming"],
  "tv": ["television", "shows", "series", "streaming", "netflix", "binge"],

  // === FASHION & BEAUTY ===
  "fashion": ["style", "clothing", "clothes", "apparel", "trendy", "fashionista"],
  "beauty": ["cosmetics", "makeup", "skincare", "self-care", "spa"],
  "makeup": ["cosmetics", "beauty", "lipstick", "foundation"],
  "skincare": ["beauty", "skin", "facial", "self-care", "spa"],
  "jewelry": ["jewellery", "accessories", "necklace", "bracelet", "earrings"],

  // === VEHICLES & BRANDS ===
  "cars": ["car", "auto", "automobile", "vehicle", "driving", "bmw", "mercedes", "tesla", "automotive", "ford", "toyota"],
  "bmw": ["cars", "auto", "vehicle", "automobile", "luxury car"],
  "mercedes": ["cars", "auto", "vehicle", "automobile", "luxury car", "benz"],
  "tesla": ["cars", "electric car", "ev", "vehicle", "automobile"],
  "motorcycle": ["bike", "motorbike", "riding", "harley", "yamaha", "honda"],
  "truck": ["pickup", "vehicle", "auto", "ford", "chevy", "ram"],

  // === HOBBIES & INTERESTS ===
  "gaming": ["games", "gamer", "video games", "esports", "pc gaming", "console"],
  "chess": ["strategy", "board game", "intellectual", "game"],
  "puzzle": ["jigsaw", "brain teaser", "sudoku", "crossword"],
  "board games": ["tabletop", "games", "card games", "strategy"],
  "collecting": ["collector", "collection", "memorabilia", "collectibles"],
  "coins": ["collecting", "numismatic", "currency", "collector"],
  "stamps": ["collecting", "philately", "collector"],

  // === PETS & ANIMALS ===
  "pets": ["pet", "dog", "cat", "animal", "puppy", "kitten"],
  "dog": ["puppy", "canine", "pet", "doggo", "pooch"],
  "cat": ["kitten", "feline", "pet", "kitty"],
  "bird": ["parrot", "canary", "pet", "avian"],
  "fish": ["aquarium", "tank", "pet", "goldfish"],

  // === WELLNESS & SELF-CARE ===
  "wellness": ["health", "self-care", "spa", "relaxation", "meditation", "mindfulness"],
  "meditation": ["mindfulness", "zen", "yoga", "wellness", "spiritual"],
  "spa": ["relaxation", "wellness", "massage", "facial", "self-care"],
  "massage": ["spa", "relaxation", "wellness", "therapy"],

  // === PROFESSIONAL & WORK ===
  "office": ["work", "professional", "desk", "workplace", "corporate", "business"],
  "business": ["professional", "entrepreneur", "corporate", "work", "startup"],
  "entrepreneur": ["business", "startup", "founder", "ceo", "hustler"],
  "teacher": ["educator", "professor", "instructor", "teaching", "education"],
  "nurse": ["medical", "healthcare", "doctor", "nursing", "hospital"],
  "engineer": ["engineering", "tech", "software", "developer", "programmer"],
  "developer": ["programmer", "coder", "software", "engineer", "tech"],
  "programmer": ["developer", "coder", "software", "engineering", "tech"],

  // === SEASONS & OCCASIONS ===
  "christmas": ["holiday", "winter", "xmas", "festive", "santa"],
  "birthday": ["bday", "celebration", "anniversary", "party"],
  "wedding": ["marriage", "bride", "groom", "anniversary", "engagement"],
  "anniversary": ["celebration", "wedding", "milestone", "romantic"],

  // === AGE GROUPS ===
  "kid": ["child", "children", "boy", "girl", "toddler", "youth"],
  "teen": ["teenager", "adolescent", "youth", "young"],
  "adult": ["grown-up", "mature"],
  "senior": ["elderly", "older", "retired", "grandparent"],

  // === PERSONALITY TRAITS ===
  "athlete": ["fitness", "sports", "active", "gym", "runner"],
  "intellectual": ["smart", "academic", "scholarly", "nerdy", "bookish"],
  "minimalist": ["simple", "minimal", "clean", "organized"],
  "adventurer": ["adventure", "explorer", "travel", "outdoor", "wanderlust"],
};

/**
 * Normalize text: lowercase, trim, simple stemming
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Apply stemming rules
  for (const { pattern, replacement } of STEMMING_RULES) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}

/**
 * Get all related terms for a word (including synonyms)
 */
export function getRelatedTerms(word: string): string[] {
  const normalized = normalizeText(word);
  const terms = new Set<string>([normalized, word.toLowerCase()]);

  // Add direct synonyms
  if (SYNONYM_MAP[normalized]) {
    SYNONYM_MAP[normalized].forEach(syn => terms.add(syn));
  }

  // Check if the word appears as a synonym in any group
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.includes(normalized)) {
      terms.add(key);
      synonyms.forEach(syn => terms.add(syn));
    }
  }

  return Array.from(terms);
}

/**
 * Check if two strings match with fuzzy logic
 */
export function fuzzyMatch(userInput: string, productTag: string): boolean {
  const normalizedInput = normalizeText(userInput);
  const normalizedTag = normalizeText(productTag);

  // Direct match
  if (normalizedTag.includes(normalizedInput) || normalizedInput.includes(normalizedTag)) {
    return true;
  }

  // Synonym match
  const inputRelated = getRelatedTerms(userInput);
  const tagRelated = getRelatedTerms(productTag);

  for (const inputTerm of inputRelated) {
    for (const tagTerm of tagRelated) {
      if (inputTerm === tagTerm || inputTerm.includes(tagTerm) || tagTerm.includes(inputTerm)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Score how well a user interest matches a product tag (0-5)
 */
export function matchScore(userInput: string, productTag: string): number {
  const normalizedInput = normalizeText(userInput);
  const normalizedTag = normalizeText(productTag);

  if (normalizedInput === normalizedTag) return 5;
  if (normalizedTag.includes(normalizedInput) || normalizedInput.includes(normalizedTag)) return 4;

  const inputRelated = getRelatedTerms(userInput);
  const tagRelated = getRelatedTerms(productTag);

  for (const inputTerm of inputRelated) {
    if (tagRelated.includes(inputTerm)) return 3;
  }

  for (const inputTerm of inputRelated) {
    for (const tagTerm of tagRelated) {
      if (inputTerm.includes(tagTerm) || tagTerm.includes(inputTerm)) return 2;
    }
  }

  return 0;
}

/**
 * Expand user interests with synonyms for better matching
 */
export function expandInterests(interests: string[]): string[] {
  const expanded = new Set<string>();

  for (const interest of interests) {
    expanded.add(interest);
    const related = getRelatedTerms(interest);
    related.forEach(term => expanded.add(term));
  }

  return Array.from(expanded);
}
