
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function benchmark() {
    console.log('--- DB Benchmark Start ---');
    const count = await prisma.product.count();
    console.log(`Total Products: ${count}`);

    const startTime = Date.now();
    const results = await prisma.product.findMany({
        where: {
            OR: [
                { title: { contains: 'baby' } },
                { tags: { contains: 'baby' } }
            ],
            price_max: { lte: 50 }
        },
        take: 50
    });
    const endTime = Date.now();
    console.log(`Matched Products: ${results.length}`);
    console.log(`Query Time: ${endTime - startTime}ms`);

    if (endTime - startTime > 1000) {
        console.warn('WARNING: Query time is high (>1s)!');
    } else {
        console.log('SUCCESS: Query performance is acceptable.');
    }

    await prisma.$disconnect();
}

benchmark();
