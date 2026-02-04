#!/usr/bin/env node
/**
 * Remove printer-related products from prisma/products.csv and add new diverse products.
 * Run from repo root: node scripts/filter-printers-add-products.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "..", "prisma", "products.csv");

function parseCsvRow(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || c === "\n" || c === "\r") {
      if (c === "\n" || c === "\r") break;
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

const PRINTER_KEYWORDS = [
  "printer",
  "ink cartridge",
  "printer paper",
  "deskjet",
  "officejet",
  "ecotank",
  "copy printer",
  "printers |",
  "for hp printers",
  "supertank printer",
  "inkjet printer",
];

function isPrinterRow(title = "", description = "") {
  const combined = `${(title || "").toLowerCase()} ${(description || "").toLowerCase()}`;
  return PRINTER_KEYWORDS.some((k) => combined.includes(k.toLowerCase()));
}

// New products to add across categories (image_url empty = use category image from giftImage.ts)
const NEW_PRODUCTS = [
  { title: "Noise-Cancelling Headphones", description: "Over-ear Bluetooth headphones with 30hr battery", category: "Electronics", tags: "tech|audio|music|travel|25-34|birthday", price_min: 80, price_max: 150 },
  { title: "Kindle E-Reader", description: "Paperwhite e-reader with built-in light", category: "Electronics|Books", tags: "reading|tech|books|25-34|55+|birthday", price_min: 100, price_max: 140 },
  { title: "Yoga Mat Premium", description: "Eco-friendly non-slip yoga mat with carrying strap", category: "Fitness|Wellness", tags: "fitness|yoga|wellness|25-34|birthday", price_min: 25, price_max: 45 },
  { title: "Resistance Bands Set", description: "Set of 5 resistance bands with door anchor", category: "Fitness", tags: "fitness|home workout|25-34|35-44|birthday", price_min: 20, price_max: 35 },
  { title: "Stainless Steel Water Bottle", description: "Insulated 32oz bottle keeps drinks cold 24hr", category: "Fitness|Travel", tags: "fitness|travel|eco|18-24|birthday", price_min: 28, price_max: 45 },
  { title: "Aromatherapy Diffuser", description: "Ultrasonic essential oil diffuser with LED lights", category: "Wellness|Home", tags: "wellness|home|relax|25-34|housewarming", price_min: 25, price_max: 45 },
  { title: "Board Game Strategy", description: "Award-winning strategy board game for 2-4 players", category: "Games", tags: "games|family|party|25-34|birthday", price_min: 35, price_max: 55 },
  { title: "Puzzle 1000 Pieces", description: "Premium 1000-piece jigsaw puzzle", category: "Home|Gifts", tags: "puzzle|relax|family|35-44|birthday", price_min: 18, price_max: 28 },
  { title: "Cookbook Best Sellers", description: "Curated cookbook with 150+ easy recipes", category: "Cooking|Books", tags: "cooking|books|food|housewarming|birthday", price_min: 22, price_max: 35 },
  { title: "Silicone Baking Set", description: "Non-stick baking mats and mold set", category: "Cooking|Home", tags: "cooking|kitchen|baking|25-34|housewarming", price_min: 25, price_max: 40 },
  { title: "French Press Coffee Maker", description: "Glass French press 34oz", category: "Cooking|Home", tags: "coffee|kitchen|25-34|coworker|birthday", price_min: 22, price_max: 38 },
  { title: "Throw Blanket Soft", description: "Cozy microfiber throw blanket", category: "Home|Comfort", tags: "home|cozy|holiday|25-34|housewarming", price_min: 28, price_max: 50 },
  { title: "Scented Candle Set", description: "Set of 3 soy candles in seasonal scents", category: "Home|Gifts", tags: "home|relax|gift|25-34|birthday", price_min: 24, price_max: 42 },
  { title: "Desk Organizer Set", description: "Bamboo desk organizer with pen holder", category: "Office|Home", tags: "office|desk|organization|25-34|coworker", price_min: 22, price_max: 38 },
  { title: "Wireless Mouse Ergonomic", description: "Ergonomic wireless mouse with silent click", category: "Electronics|Office", tags: "office|tech|productivity|25-34|birthday", price_min: 28, price_max: 45 },
  { title: "Passport Holder", description: "RFID-blocking leather passport holder", category: "Fashion|Travel", tags: "travel|fashion|25-34|birthday", price_min: 18, price_max: 32 },
  { title: "Running Shoes Lightweight", description: "Lightweight running shoes for men and women", category: "Fitness", tags: "fitness|running|sports|25-34|birthday", price_min: 55, price_max: 95 },
  { title: "Skincare Gift Set", description: "Cleanser, serum, and moisturizer gift set", category: "Beauty|Gifts", tags: "beauty|skincare|25-34|birthday|partner", price_min: 35, price_max: 65 },
  { title: "Pet Bed Orthopedic", description: "Memory foam pet bed for dogs and cats", category: "Pets", tags: "pets|dog|cat|25-34|birthday", price_min: 35, price_max: 60 },
  { title: "Dog Treat Puzzle Toy", description: "Interactive puzzle toy for dogs", category: "Pets", tags: "pets|dog|toys|birthday", price_min: 15, price_max: 28 },
  { title: "Baby Onesie Set", description: "Organic cotton 5-pack baby onesies", category: "Baby", tags: "baby|newborn|shower|birthday", price_min: 25, price_max: 42 },
  { title: "Kids Art Supplies Set", description: "Crayons, markers, and sketch pad set", category: "Kids|Games", tags: "kids|art|creative|birthday", price_min: 18, price_max: 32 },
  { title: "Camping Hammock", description: "Portable camping hammock with straps", category: "Outdoors|Travel", tags: "outdoors|camping|travel|25-34|birthday", price_min: 35, price_max: 55 },
  { title: "LED Book Light", description: "Clip-on LED book light with adjustable brightness", category: "Electronics|Books", tags: "reading|books|25-34|birthday", price_min: 15, price_max: 28 },
  { title: "Journal Leather", description: "Handmade leather journal with refillable pages", category: "Creative|Gifts", tags: "journal|writing|25-34|graduation|birthday", price_min: 22, price_max: 40 },
  { title: "Bluetooth Beanie", description: "Knit beanie with built-in wireless headphones", category: "Electronics|Fashion", tags: "tech|fashion|winter|25-34|birthday", price_min: 35, price_max: 55 },
  { title: "Tea Sampler Set", description: "Assorted premium loose-leaf tea sampler", category: "Food|Gifts", tags: "tea|wellness|25-34|55+|birthday", price_min: 22, price_max: 38 },
  { title: "Gourmet Chocolate Box", description: "Artisan dark chocolate assortment", category: "Food|Gifts", tags: "food|chocolate|gift|birthday|anniversary", price_min: 28, price_max: 48 },
  { title: "Succulent Garden Kit", description: "3 small succulents with pots and soil", category: "Home|Garden", tags: "plants|home|garden|25-34|housewarming", price_min: 28, price_max: 45 },
  { title: "Wireless Earbuds Sport", description: "Sweat-proof wireless earbuds for running", category: "Electronics|Fitness", tags: "fitness|running|audio|18-24|birthday", price_min: 45, price_max: 75 },
];

function escapeCsv(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const [header, ...rows] = lines;
  const cols = header.split(",").map((c) => c.trim().toLowerCase());
  const titleIdx = cols.indexOf("title");
  const descriptionIdx = cols.indexOf("description");
  const idIdx = cols.indexOf("id");

  let kept = 0;
  let removed = 0;
  const outRows = [header];

  for (const line of rows) {
    const cells = parseCsvRow(line);
    const get = (i) => (i >= 0 && cells[i] !== undefined ? cells[i].trim() : "");
    const id = get(idIdx);
    if (!id) continue;

    const title = get(titleIdx);
    const description = get(descriptionIdx);
    if (isPrinterRow(title, description)) {
      removed++;
      continue;
    }
    outRows.push(line);
    kept++;
  }

  // Append new products with unique ids
  const maxId = outRows.slice(1).reduce((acc, row) => {
    const cells = parseCsvRow(row);
    const id = cells[idIdx] || "";
    const num = id.replace(/\D/g, "");
    const n = parseInt(num, 10) || 0;
    return Math.max(acc, n);
  }, 0);

  let nextId = maxId + 1;
  for (const p of NEW_PRODUCTS) {
    const id = p.id || `prod-new-${nextId++}`;
    const row = [
      id,
      escapeCsv(p.title),
      escapeCsv(p.description),
      escapeCsv(p.category),
      escapeCsv(p.tags),
      p.price_min,
      p.price_max,
      "",
      "",
      "US",
      "true",
    ].join(",");
    outRows.push(row);
  }

  fs.writeFileSync(CSV_PATH, outRows.join("\n") + "\n", "utf-8");
  console.log(`Removed ${removed} printer-related products. Kept ${kept}. Added ${NEW_PRODUCTS.length} new products. Total rows: ${outRows.length - 1}.`);
}

main();
