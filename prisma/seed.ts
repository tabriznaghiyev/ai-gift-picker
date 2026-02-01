/**
 * Seed products from prisma/products.csv into SQLite.
 * CSV columns: id, title, description, category, tags, price_min, price_max, amazon_url, image_url, locale, active
 * Header required. tags = "tag1|tag2|...". amazon_url, image_url can be empty.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, "products.csv");

function parseCsvRow(line: string): string[] {
  const out: string[] = [];
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

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("Missing prisma/products.csv. Create it with columns: id, title, description, category, tags, price_min, price_max, amazon_url, image_url, locale, active");
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const [header, ...rows] = lines;
  const cols = header.split(",").map((c) => c.trim().toLowerCase());

  const idIdx = cols.indexOf("id");
  const titleIdx = cols.indexOf("title");
  const descriptionIdx = cols.indexOf("description");
  const categoryIdx = cols.indexOf("category");
  const tagsIdx = cols.indexOf("tags");
  const priceMinIdx = cols.indexOf("price_min");
  const priceMaxIdx = cols.indexOf("price_max");
  const amazonUrlIdx = cols.indexOf("amazon_url");
  const imageUrlIdx = cols.indexOf("image_url");
  const localeIdx = cols.indexOf("locale");
  const activeIdx = cols.indexOf("active");

  if ([idIdx, titleIdx, categoryIdx, tagsIdx, priceMinIdx, priceMaxIdx].some((i) => i === -1)) {
    console.error("CSV must have: id, title, description, category, tags, price_min, price_max");
    process.exit(1);
  }

  let count = 0;
  for (const line of rows) {
    const cells = parseCsvRow(line);
    const get = (i: number) => (i >= 0 && cells[i] !== undefined ? cells[i].trim() : "");
    const id = get(idIdx);
    if (!id) continue;

    const priceMin = parseInt(get(priceMinIdx), 10) || 0;
    const priceMax = parseInt(get(priceMaxIdx), 10) || priceMin || 99;
    const active = activeIdx >= 0 ? get(activeIdx).toLowerCase() !== "false" && get(activeIdx) !== "0" : true;

    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        title: get(titleIdx) || "Untitled",
        description: get(descriptionIdx) || "",
        category: get(categoryIdx) || "Other",
        tags: get(tagsIdx) || "",
        price_min: priceMin,
        price_max: priceMax,
        amazon_url: amazonUrlIdx >= 0 ? get(amazonUrlIdx) || null : null,
        image_url: imageUrlIdx >= 0 ? get(imageUrlIdx) || null : null,
        locale: localeIdx >= 0 ? get(localeIdx) || "US" : "US",
        active,
      },
      update: {
        title: get(titleIdx) || "Untitled",
        description: get(descriptionIdx) || "",
        category: get(categoryIdx) || "Other",
        tags: get(tagsIdx) || "",
        price_min: priceMin,
        price_max: priceMax,
        amazon_url: amazonUrlIdx >= 0 ? get(amazonUrlIdx) || null : undefined,
        image_url: imageUrlIdx >= 0 ? get(imageUrlIdx) || null : undefined,
        locale: localeIdx >= 0 ? get(localeIdx) || "US" : undefined,
        active,
      },
    });
    count++;
  }

  console.log(`Seeded ${count} products from ${CSV_PATH}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
