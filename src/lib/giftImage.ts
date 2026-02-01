/**
 * Map product category to local placeholder image path.
 * Images live in public/images/gifts/
 */

const CATEGORY_TO_IMAGE: Record<string, string> = {
  electronics: "/images/gifts/electronics.svg",
  home: "/images/gifts/home.svg",
  baby: "/images/gifts/baby.svg",
  cooking: "/images/gifts/kitchen.svg",
  kitchen: "/images/gifts/kitchen.svg",
  travel: "/images/gifts/travel.svg",
  fitness: "/images/gifts/fitness.svg",
  gym: "/images/gifts/fitness.svg",
  office: "/images/gifts/office.svg",
  pets: "/images/gifts/pets.svg",
  games: "/images/gifts/games.svg",
  books: "/images/gifts/books.svg",
  beauty: "/images/gifts/beauty.svg",
  outdoors: "/images/gifts/outdoors.svg",
  food: "/images/gifts/food.svg",
  gifts: "/images/gifts/gifts.svg",
  wellness: "/images/gifts/wellness.svg",
  kids: "/images/gifts/kids.svg",
  creative: "/images/gifts/books.svg",
  comfort: "/images/gifts/home.svg",
  garden: "/images/gifts/outdoors.svg",
  student: "/images/gifts/office.svg",
  toys: "/images/gifts/kids.svg",
  fashion: "/images/gifts/gifts.svg",
  jewelry: "/images/gifts/gifts.svg",
};

const DEFAULT_IMAGE = "/images/gifts/default.svg";

export function getGiftImageUrl(productCategory: string | null, productImageUrl: string | null): string {
  if (productImageUrl?.trim()) return productImageUrl;
  if (!productCategory?.trim()) return DEFAULT_IMAGE;
  const first = productCategory.split("|")[0]?.trim().toLowerCase();
  if (!first) return DEFAULT_IMAGE;
  return CATEGORY_TO_IMAGE[first] ?? DEFAULT_IMAGE;
}
