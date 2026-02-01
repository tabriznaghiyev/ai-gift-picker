/**
 * ML inference: load ONNX model and feature_spec, compute features (match Python), run model.
 * Used when USE_ML=true. Results are based on the locally trained model (ml/model.onnx).
 * Dynamic import of onnxruntime-node so the app builds even if the package isn't installed.
 */

import * as path from "path";
import * as fs from "fs";
import type { QuizForm } from "@/types/quiz";
import type { CandidateProduct } from "@/types/recommend";

export interface MLSpec {
  occasion_values: string[];
  relationship_values: string[];
  age_range_values: string[];
  daily_life_values: string[];
  budget_max_norm: number;
  price_max_norm: number;
  max_interest_count: number;
  max_daily_life_count: number;
  max_tag_overlap: number;
  feature_names: string[];
  category_list: string[];
}

let spec: MLSpec | null = null;
let session: { run: (feeds: Record<string, unknown>) => Promise<Record<string, { data: Float32Array; dims: number[] }>> } | null = null;

function getSpec(): MLSpec {
  if (spec) return spec;
  const mlPath = path.join(process.cwd(), "ml", "feature_spec.json");
  const raw = fs.readFileSync(mlPath, "utf-8");
  spec = JSON.parse(raw) as MLSpec;
  return spec!;
}

async function getSession(): Promise<{ run: (feeds: Record<string, unknown>) => Promise<Record<string, { data: Float32Array; dims: number[] }>> }> {
  if (session) return session;
  // Load at runtime only; webpackIgnore prevents bundler from requiring the package at build time
  const ort = await import(/* webpackIgnore: true */ "onnxruntime-node").catch(() => null);
  if (!ort) throw new Error("onnxruntime-node not installed. Run: npm install onnxruntime-node");
  const modelPath = path.join(process.cwd(), "ml", "model.onnx");
  session = await ort.InferenceSession.create(modelPath);
  return session;
}

function categoryToId(categoryStr: string, categoryList: string[]): number {
  const parts = (categoryStr || "").split("|").map((p) => p.trim().toLowerCase()).filter(Boolean);
  for (const p of parts) {
    const idx = categoryList.indexOf(p);
    if (idx >= 0) return idx;
  }
  return 0;
}

function tagOverlap(profileTags: Set<string>, productTags: string[]): number {
  const pt = new Set(productTags.map((t) => t.toLowerCase()));
  let count = 0;
  for (const t of profileTags) {
    const tl = t.toLowerCase();
    for (const x of pt) {
      if (tl.includes(x) || x.includes(tl)) {
        count++;
        break;
      }
    }
  }
  return count;
}

/**
 * Build derived tags from form (same as localRecommend.buildLocalProfile).
 */
function derivedTags(form: QuizForm): Set<string> {
  const tags = new Set<string>([
    form.occasion,
    form.relationship,
    form.age_range,
    ...form.interests,
    ...form.daily_life,
  ].filter(Boolean).map((t) => String(t).toLowerCase().replace(/\s+/g, "_")));
  return tags;
}

/**
 * Compute 30-dim feature vector for (form, product). Must match Python generate_training_data.
 */
export function computeFeatures(form: QuizForm, product: CandidateProduct, mlSpec: MLSpec): number[] {
  const occIdx = mlSpec.occasion_values.indexOf(form.occasion);
  const relIdx = mlSpec.relationship_values.indexOf(form.relationship);
  const ageIdx = mlSpec.age_range_values.indexOf(form.age_range);

  const occasionOnehot = mlSpec.occasion_values.map((_, i) => (i === occIdx ? 1 : 0));
  const relationshipOnehot = mlSpec.relationship_values.map((_, i) => (i === relIdx ? 1 : 0));
  const ageOnehot = mlSpec.age_range_values.map((_, i) => (i === ageIdx ? 1 : 0));

  const budgetMinNorm = Math.min(1, form.budget_min / mlSpec.budget_max_norm);
  const budgetMaxNorm = Math.min(1, form.budget_max / mlSpec.budget_max_norm);
  const interestNorm = Math.min(1, form.interests.length / mlSpec.max_interest_count);
  const dailyNorm = Math.min(1, form.daily_life.length / mlSpec.max_daily_life_count);

  const categoryId = categoryToId(product.category, mlSpec.category_list);
  const priceMinNorm = Math.min(1, product.price_min / mlSpec.price_max_norm);
  const priceMaxNorm = Math.min(1, product.price_max / mlSpec.price_max_norm);
  const profileTags = derivedTags(form);
  const overlap = tagOverlap(profileTags, product.tags);
  const tagOverlapNorm = Math.min(1, overlap / mlSpec.max_tag_overlap);
  const priceInBudget =
    product.price_max >= form.budget_min && product.price_min <= form.budget_max ? 1 : 0;

  return [
    ...occasionOnehot,
    ...relationshipOnehot,
    ...ageOnehot,
    budgetMinNorm,
    budgetMaxNorm,
    interestNorm,
    dailyNorm,
    categoryId,
    priceMinNorm,
    priceMaxNorm,
    tagOverlapNorm,
    priceInBudget,
  ];
}

/**
 * Run ONNX model on a batch of feature vectors. Returns probability of class 1 (relevant) per row.
 * Uses the model trained on our dataset (training_data.csv from our products + keyword labels).
 */
export async function runModel(features: number[][]): Promise<number[]> {
  const ort = await import(/* webpackIgnore: true */ "onnxruntime-node").catch(() => null);
  if (!ort) throw new Error("onnxruntime-node not installed. Run: npm install onnxruntime-node");
  const sess = await getSession();
  const size = features.length * features[0].length;
  const float32 = new Float32Array(size);
  for (let i = 0; i < features.length; i++) {
    for (let j = 0; j < features[i].length; j++) {
      float32[i * features[i].length + j] = features[i][j];
    }
  }
  const tensor = new ort.Tensor("float32", float32, [features.length, features[0].length]);
  const results = await sess.run({ float_input: tensor });
  const outputName = Object.keys(results)[0];
  const output = results[outputName] as { data: Float32Array; dims: number[] };
  const data = output.data;
  const dims = output.dims;
  const lastDim = dims[dims.length - 1];
  const scores: number[] = [];
  for (let i = 0; i < features.length; i++) {
    if (lastDim === 2) {
      scores.push(data[i * 2 + 1]);
    } else {
      scores.push(data[i]);
    }
  }
  return scores;
}

/**
 * Rank candidates by ML score. Returns same candidates reordered (top first).
 */
export async function rankByML(
  form: QuizForm,
  candidates: CandidateProduct[]
): Promise<CandidateProduct[]> {
  const mlSpec = getSpec();
  const features = candidates.map((p) => computeFeatures(form, p, mlSpec));
  if (features.length === 0) return [];
  const scores = await runModel(features);
  const indexed = candidates.map((c, i) => ({ candidate: c, score: scores[i] }));
  indexed.sort((a, b) => b.score - a.score);
  return indexed.map((x) => x.candidate);
}

export function isMLAvailable(): boolean {
  try {
    const mlPath = path.join(process.cwd(), "ml", "model.onnx");
    const specPath = path.join(process.cwd(), "ml", "feature_spec.json");
    return fs.existsSync(mlPath) && fs.existsSync(specPath);
  } catch {
    return false;
  }
}
