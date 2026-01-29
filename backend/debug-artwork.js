
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArtwork() {
    const id = '50d670f7-c220-40d1-bdf8-d8dbb4e1d770';
    const artwork = await prisma.artwork.findUnique({
        where: { id: id }
    });
    console.log('Artwork:', artwork);
}

checkArtwork()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
