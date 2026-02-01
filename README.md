# US Gift Finder — AI-Personalized Recommendations

A visitor answers a short quiz (one question per screen). The system returns **3 top gift recommendations** plus **3 alternatives**, each from a real product catalog. No hallucinated products: the AI only chooses from retrieved candidates.

## Stack

- **Next.js** (App Router) + TypeScript
- **SQLite** (dev) with **Prisma** — easy upgrade to Postgres later
- **Local mode (default):** no API keys — runs 100% local. Set `ENABLE_OPENAI=false` or leave it unset; recommendations use DB + keyword scoring.
- **ML ranking (optional):** set `USE_ML=true` and run the Python ML pipeline once to train and export `ml/model.onnx`; the API will rank candidates with the trained model locally.
- **OpenAI (optional):** set `ENABLE_OPENAI=true` and a valid `OPENAI_API_KEY` for LLM profile + rerank (gpt-4o-mini)
- **Amazon PA-API** — module present but **OFF** for MVP (`ENABLE_PAAPI=false`)

## Setup

1. **Clone and install**

   ```bash
   cd ai-gift-picker
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL="file:./dev.db"` (or your SQLite path)
   - **Local run (no API):** set `ENABLE_OPENAI=false` or leave it unset — recommendations use the database and keyword scoring only. You can leave or remove `OPENAI_API_KEY`; the app will not call OpenAI unless `ENABLE_OPENAI=true`.
   - Optional: set `ENABLE_OPENAI=true` and a valid `OPENAI_API_KEY` for AI-personalized bullets and reranking.
   - Optional: `ADMIN_SECRET` for protecting `/admin` CSV upload

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed products**

   Place a `products.csv` in `prisma/` (or use the included sample), then:

   ```bash
   npm run db:seed
   ```

   CSV columns: `id`, `title`, `description`, `category`, `tags`, `price_min`, `price_max`, `amazon_url`, `image_url`, `locale`, `active`. Header required. `tags` = `tag1|tag2|...`.

5. **Run**

   ```bash
   npm run dev
   ```

   - Quiz: [http://localhost:3000](http://localhost:3000)
   - Admin (CSV upload): [http://localhost:3000/admin](http://localhost:3000/admin)

## How to add products

- **Option A — Seed script:** Add or edit rows in `prisma/products.csv`, then run `npm run db:seed`. Existing rows are upserted by `id`.
- **Option B — Admin UI:** Go to `/admin`, enter your `ADMIN_SECRET` (if set), and upload a CSV with the same columns. Products are upserted by `id`.

Aim for **200–500 products** for good variety. For **1800+ research-based products** (real gift scenarios by occasion, relationship, age, interest), run `python3 scripts/generate_products_research.py` (overwrites `prisma/products.csv`), then `npm run db:seed`. Or use `python3 scripts/generate_products.py` for 1000+ template-based products.

## ML pipeline (train locally, predict in Next.js)

Recommendations can be ranked by a **locally trained** model instead of keyword score only.

1. **Generate 1000+ products** (optional; already done if you ran the script above):

   ```bash
   python3 scripts/generate_products.py
   npm run db:seed
   ```

2. **Install Python ML deps** (one-time; use `pip3` or `python3 -m pip` if `pip` is not found):

   ```bash
   python3 -m pip install -r ml/requirements.txt
   ```

3. **Generate training data** (profiles + products + labels from keyword scoring):

   ```bash
   python3 ml/generate_training_data.py
   ```

   Writes `ml/training_data.csv` and updates `ml/feature_spec.json` with `category_list`.

4. **Train and export ONNX**:

   ```bash
   python3 ml/train.py
   ```

   Produces `ml/model.onnx` and `ml/feature_spec.json`. The app uses these for inference.

5. **Enable ML in the app**: In `.env` set `USE_ML=true`. Restart the dev server. The recommend API will rank candidates with the ONNX model (same 3 + 3 results, better order).

No GPU required; training and inference run on CPU. To go back to keyword-only ranking, set `USE_ML=false`.

**Are results based on our ML trained data?** Yes. When `USE_ML=true` and `ml/model.onnx` + `ml/feature_spec.json` exist, the API uses the model you trained on `ml/training_data.csv` (profiles + products + labels from our keyword scoring). It computes the same 30 features for each (form, product) pair and runs the ONNX model to get a relevance score, then returns the top 6 by that score. So the order of recommendations comes from your trained model, not from keyword score alone.

**Build error "Can't resolve 'onnxruntime-node'"**: The package is optional. Run `npm install` (or `npm install onnxruntime-node`) so it’s in `node_modules`. If you don’t use ML, set `USE_ML=false` and the app will build and run without it (keyword-only ranking).

## Enabling Amazon PA-API later

1. Set in `.env`:
   - `ENABLE_PAAPI=true`
   - `PAAPI_ACCESS_KEY=...`
   - `PAAPI_SECRET_KEY=...`
   - `PAAPI_PARTNER_TAG=...` (your affiliate tag)

2. The app already includes a gated module `src/lib/paapi.ts`. When enabled, it can refresh missing `image_url`, price, and availability. Recommendations are **not** blocked if PA-API fails.

3. Extend the recommend pipeline (e.g. in `src/app/api/recommend/route.ts`) to call `fetchAmazonProductUpdates(asinList)` and update product records or response payload as needed.

## Cost controls

- LLM results are cached by hash of the quiz form (in-memory for MVP).
- Candidate list is capped at 30; output tokens are limited; JSON schema is enforced.
- You can add a max 2 regenerations per session per IP in front of the recommend API if needed.

## Project layout

- `src/app/page.tsx` — Quiz UI (7 steps) + results
- `src/app/api/recommend/route.ts` — Validate → profile → retrieval → rerank → session
- `src/app/admin/` — Protected admin page for CSV upload
- `src/lib/llm.ts` — OpenAI profile + rerank (no product IDs outside candidate list)
- `src/lib/retrieval.ts` — Keyword + budget + locale → top 30 candidates
- `src/lib/mlInference.ts` — ONNX model loader + feature computation + ranking (when `USE_ML=true`)
- `src/lib/paapi.ts` — Amazon PA-API (gated by `ENABLE_PAAPI`)
- `prisma/schema.prisma` — Product, Session
- `prisma/seed.ts` — Import from `prisma/products.csv`
- `ml/` — Python ML pipeline: stratified training data, GradientBoostingClassifier, ONNX export; `generate_training_data.py`, `train.py`, `model.onnx`, `feature_spec.json`
- `scripts/generate_products.py` — Generate 1000+ product rows for `prisma/products.csv`
- `scripts/generate_products_research.py` — Generate 1800+ research-based products (real gift scenarios from occasion/relationship/age/interest)

## Disclaimer

Price and availability may change — users are prompted to check on Amazon before purchasing.
