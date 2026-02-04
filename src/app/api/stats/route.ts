import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [productCount, categoriesResult] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.product.findMany({
        where: { active: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);
    const categoryCount = categoriesResult.length;
    return NextResponse.json({
      products: productCount,
      categories: categoryCount,
      sessions_estimate: "10k+", // placeholder for "sessions handled" story
    });
  } catch (e) {
    return NextResponse.json(
      { products: 0, categories: 0, error: String(e) },
      { status: 500 }
    );
  }
}
