/**
 * Amazon Product Advertising API (PA-API) — gated by ENABLE_PAAPI.
 * OFF for MVP. When enabled: refresh missing image_url, price, availability.
 * Do not block recommendations if PA-API fails.
 */

const ENABLED = process.env.ENABLE_PAAPI === "true";

export interface PAProductUpdate {
  product_id: string;
  image_url?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  available?: boolean | null;
}

/**
 * Fetch live data from Amazon for given ASINs. No-op if ENABLE_PAAPI is false.
 */
export async function fetchAmazonProductUpdates(
  asins: string[]
): Promise<PAProductUpdate[]> {
  if (!ENABLED || asins.length === 0) return [];

  try {
    // Placeholder for real PA-API call (SearchItems / GetItems).
    // Requires: PAAPI_ACCESS_KEY, PAAPI_SECRET_KEY, PAAPI_PARTNER_TAG
    // const client = new ProductAdvertisingAPI(...)
    // const result = await client.getItems({ ItemIds: asins, ... })
    return [];
  } catch {
    // Do not block recommendations if PA-API fails
    return [];
  }
}

/**
 * Whether PA-API is enabled (for UI/feature flags).
 */
export function isPAAPIEnabled(): boolean {
  return ENABLED;
}
