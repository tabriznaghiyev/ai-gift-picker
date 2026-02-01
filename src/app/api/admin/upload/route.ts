/**
 * Admin CSV upload — protected by X-Admin-Secret header.
 * Expects multipart/form-data with "file" = CSV.
 * CSV format: id, title, description, category, tags, price_min, price_max, amazon_url, image_url, locale, active
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return true; // no secret set = allow in dev
  const header = request.headers.get("X-Admin-Secret");
  return header === ADMIN_SECRET;
}

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

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check action for auth-only (client sends { action: "check" } in JSON body when no file)
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    if (body.action === "check") return NextResponse.json({ ok: true });
  }

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expect multipart/form-data with file" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
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
    return NextResponse.json(
      { error: "CSV must have: id, title, description, category, tags, price_min, price_max" },
      { status: 400 }
    );
  }

  const get = (cells: string[], i: number) => (i >= 0 && cells[i] !== undefined ? cells[i].trim() : "");

  let count = 0;
  for (const line of rows) {
    const cells = parseCsvRow(line);
    const id = get(cells, idIdx);
    if (!id) continue;

    const priceMin = parseInt(get(cells, priceMinIdx), 10) || 0;
    const priceMax = parseInt(get(cells, priceMaxIdx), 10) || priceMin || 99;
    const active =
      activeIdx >= 0
        ? get(cells, activeIdx).toLowerCase() !== "false" && get(cells, activeIdx) !== "0"
        : true;

    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        title: get(cells, titleIdx) || "Untitled",
        description: get(cells, descriptionIdx) || "",
        category: get(cells, categoryIdx) || "Other",
        tags: get(cells, tagsIdx) || "",
        price_min: priceMin,
        price_max: priceMax,
        amazon_url: amazonUrlIdx >= 0 ? get(cells, amazonUrlIdx) || null : null,
        image_url: imageUrlIdx >= 0 ? get(cells, imageUrlIdx) || null : null,
        locale: localeIdx >= 0 ? get(cells, localeIdx) || "US" : "US",
        active,
      },
      update: {
        title: get(cells, titleIdx) || "Untitled",
        description: get(cells, descriptionIdx) || "",
        category: get(cells, categoryIdx) || "Other",
        tags: get(cells, tagsIdx) || "",
        price_min: priceMin,
        price_max: priceMax,
        amazon_url: amazonUrlIdx >= 0 ? get(cells, amazonUrlIdx) || null : undefined,
        image_url: imageUrlIdx >= 0 ? get(cells, imageUrlIdx) || null : undefined,
        locale: localeIdx >= 0 ? get(cells, localeIdx) || "US" : undefined,
        active,
      },
    });
    count++;
  }

  return NextResponse.json({ ok: true, count, message: `Imported ${count} products` });
}
