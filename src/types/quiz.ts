// Quiz form shape (one question per screen)
export type Occasion =
  | "birthday"
  | "anniversary"
  | "housewarming"
  | "graduation"
  | "thank-you"
  | "holiday"
  | "baby-shower"
  | "other";

export type Relationship =
  | "friend"
  | "partner"
  | "parent"
  | "coworker"
  | "sibling"
  | "child"
  | "other";

export type AgeRange =
  | "13-17"
  | "18-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55+";

export type DailyLife =
  | "student"
  | "office"
  | "remote_worker"
  | "gamer"
  | "gym"
  | "traveler"
  | "new_parent"
  | "cooking"
  | "outdoors"
  | "creative"
  | "pet_lover"
  | "other";

export interface QuizForm {
  occasion: Occasion;
  relationship: Relationship;
  age_range: AgeRange;
  budget_min: number;
  budget_max: number;
  interests: string[]; // multi-select + free text tags
  daily_life: DailyLife[];
  avoid_list: string[];
  notes: string;
}

export const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "housewarming", label: "Housewarming" },
  { value: "graduation", label: "Graduation" },
  { value: "thank-you", label: "Thank you" },
  { value: "holiday", label: "Holiday" },
  { value: "baby-shower", label: "Baby shower" },
  { value: "other", label: "Other" },
];

export const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: "friend", label: "Friend" },
  { value: "partner", label: "Partner" },
  { value: "parent", label: "Parent" },
  { value: "coworker", label: "Coworker" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "other", label: "Other" },
];

export const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: "13-17", label: "13–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55+", label: "55+" },
];

export const DAILY_LIFE_OPTIONS: { value: DailyLife; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "office", label: "Office worker" },
  { value: "remote_worker", label: "Remote worker" },
  { value: "gamer", label: "Gamer" },
  { value: "gym", label: "Gym / fitness" },
  { value: "traveler", label: "Traveler" },
  { value: "new_parent", label: "New parent" },
  { value: "cooking", label: "Cooking" },
  { value: "outdoors", label: "Outdoors" },
  { value: "creative", label: "Creative / arts" },
  { value: "pet_lover", label: "Pet lover" },
  { value: "other", label: "Other" },
];
