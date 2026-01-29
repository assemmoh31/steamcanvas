const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeData() {
    console.log('Starting database wipe...');
    try {
        console.log('Deleting Purchases...');
        const purchases = await prisma.purchase.deleteMany({});
        console.log(`Deleted ${purchases.count} purchases.`);

        console.log('Deleting Transactions linking to Artworks...');
        // We need to clear transactions that reference artworks to free up the artwork records
        const transactions = await prisma.transaction.deleteMany({
            where: {
                artworkId: {
                    not: null
                }
            }
        });
        console.log(`Deleted ${transactions.count} transactions linked to artworks.`);

        console.log('Deleting Artworks...');
        const artworks = await prisma.artwork.deleteMany({});
        console.log(`Deleted ${artworks.count} artworks.`);

        console.log('Database wipe completed successfully.');
    } catch (error) {
        console.error('Error wiping database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

wipeData();
