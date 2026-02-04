/**
 * Product image mapping - uses real product images from Unsplash (free to use)
 * One representative image per category type for visual consistency
 */

const CATEGORY_IMAGES: Record<string, string> = {
  // Tech & Electronics
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  "Electronics|Games": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
  "Electronics|Office": "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80",
  "Electronics|Fitness": "https://images.unsplash.com/photo-1575481932661-6a8f8e79ff79?w=800&q=80",

  // Gaming
  "Games": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",

  // Fashion & Accessories
  "Fashion": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
  "Fashion|Gifts": "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80",
  "Fashion|Travel": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  "Jewelry": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "Jewelry|Gifts": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",

  // Cooking & Kitchen
  "Cooking|Home": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  "Cooking|Electronics": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
  "Food|Gifts": "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",

  // Fitness & Wellness
  "Fitness": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "Fitness|Wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  "Wellness": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",

  // Outdoor & Travel
  "Outdoors": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  "Outdoors|Travel": "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",

  // Home & Decor
  "Home": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "Home|Gifts": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
  "Home|Comfort": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
  "Home|Garden": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80",

  // Office & Productivity
  "Office|Home": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80",
  "Office|Electronics": "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80",

  // Books
  "Books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
  "Electronics|Books": "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80",

  // Creative & Art
  "Creative|Art": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  "Creative|Gifts": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",

  // Music
  "Music": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  "Music|Electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",

  // Pets
  "Pets": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",

  // Baby & Kids
  "Baby": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  "Baby|Electronics": "https://images.unsplash.com/photo-1618303440320-3b0ebcc1c8b9?w=800&q=80",
  "Kids|Games": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
  " Kids|Books": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",

  // Beauty
  "Beauty|Gifts": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
};

// Keyword fallbacks for partial matches
const KEYWORD_IMAGES: Record<string, string> = {
  // Electronics & Gadgets
  "gaming": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
  "game": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
  "tech": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  "phone": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  "laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  "audio": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",

  // Home & Kitchen
  "cook": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  "kitchen": "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80",
  "home": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "decor": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "tool": "https://images.unsplash.com/photo-1581235720704-06d3acfcb363?w=800&q=80",

  // Fashion & Accessories
  "jewelry": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "bag": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
  "shoe": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "clothing": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",

  // Hobbies & Leisure
  "fitness": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "book": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
  "music": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  "outdoor": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  "travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  "art": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",

  // Toys & Kids
  "toy": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
  "puzzle": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
  "lego": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80",
  "doll": "https://images.unsplash.com/photo-1582239632832-6a682855b721?w=800&q=80",
  "car": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80",
  "baby": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",

  // Beauty
  "beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  "perfume": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
  "makeup": "https://images.unsplash.com/photo-1522335789203-abd652327ed8?w=800&q=80",

  // Office
  "office": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
  "desk": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80";

export function getGiftImageUrl(category: string, providedUrl: string | null): string {
  if (providedUrl && providedUrl.startsWith("http")) {
    return providedUrl;
  }

  // Exact match
  if (CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }

  // Keyword search
  const categoryLower = category.toLowerCase();
  for (const [keyword, imageUrl] of Object.entries(KEYWORD_IMAGES)) {
    if (categoryLower.includes(keyword)) {
      return imageUrl;
    }
  }

  return DEFAULT_IMAGE;
}
