// API / recommendation types

export interface RecipientProfile {
  recipient_summary: string;
  ranked_intents: string[];
  derived_tags: string[];
  hard_constraints: {
    budget_min: number;
    budget_max: number;
    avoid: string[];
    locale: string;
  };
}

export interface CandidateProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price_min: number;
  price_max: number;
  amazon_url: string | null;
  image_url: string | null;
}

export interface RankedItem {
  product_id: string;
  score: number;
  why_bullets: [string, string, string];
  best_for_label: string;
}

export interface RecommendResult {
  top_3: RankedItem[];
  alternatives_3: RankedItem[];
}

export interface RecommendResponse {
  session_id: string;
  profile: RecipientProfile;
  top_3: (CandidateProduct & RankedItem)[];
  alternatives_3: (CandidateProduct & RankedItem)[];
}
