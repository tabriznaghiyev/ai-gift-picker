"use server";

import { prisma } from "@/lib/db";

export async function getSystemStats() {
    try {
        const productCount = await prisma.product.count();
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: true,
            orderBy: {
                _count: { category: 'desc' }
            },
            take: 5
        });

        return {
            productCount,
            topCategories: categories.map(c => ({ name: c.category, count: c._count })),
            status: "online"
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return {
            productCount: 0,
            topCategories: [],
            status: "offline"
        };
    }
}
