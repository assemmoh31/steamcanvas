const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ARTWORKS = [
    {
        id: '1',
        title: 'Neon Ronin',
        artist: 'CyberSage',
        price: 450,
        category: 'Featured',
        imageUrl: 'https://picsum.photos/seed/ronin/800/1000',
        r2Key: 'placeholder-ronin', // Placeholder as these are external images
        fileSize: 1024,
        description: 'A high-definition animated showcase featuring a wandering ronin in a cyberpunk cityscape.',
        isVerified: true,
        downloadPath: '/assets/downloads/neon-ronin.zip'
    },
    {
        id: 'p1',
        title: 'Ghost Shell',
        artist: 'TechLord',
        price: 350,
        category: 'Artwork',
        imageUrl: 'https://picsum.photos/seed/ghost/800/1000',
        r2Key: 'placeholder-ghost',
        fileSize: 2048,
        description: 'A minimalist futuristic frame designed for dark profiles.',
        isVerified: false,
        downloadPath: '/assets/downloads/ghost-shell.zip'
    },
    {
        id: 'p2',
        title: 'Cyber Deck',
        artist: 'RetroVibes',
        price: 500,
        category: 'Workshop',
        imageUrl: 'https://picsum.photos/seed/deck/800/1000',
        r2Key: 'placeholder-deck',
        fileSize: 4096,
        description: 'A comprehensive workshop layout with neon accents.',
        isVerified: false,
        downloadPath: '/assets/downloads/steamcanvas_pack_v1.zip'
    }
];

async function main() {
    console.log('Start seeding ...');

    // Create a default artist user if not exists to assign these artworks to
    const artist = await prisma.user.upsert({
        where: { steamId: '00000000000000000' },
        update: {},
        create: {
            steamId: '00000000000000000',
            displayName: 'System Artist',
            avatarUrl: 'https://picsum.photos/seed/system/100/100',
            walletBalance: 0,
            artistLevel: 5
        },
    });

    console.log(`Using Artist: ${artist.displayName} (${artist.id})`);

    for (const art of ARTWORKS) {
        const exists = await prisma.artwork.findUnique({ where: { id: art.id } });
        if (!exists) {
            const artwork = await prisma.artwork.create({
                data: {
                    id: art.id,
                    title: art.title,
                    description: art.description,
                    imageUrl: art.imageUrl,
                    r2Key: art.r2Key,
                    fileType: 'image/gif', // Assuming mock data is GIF-like
                    fileSize: art.fileSize,
                    price: art.price,
                    isVerified: art.isVerified,
                    downloadPath: art.downloadPath,
                    artistId: artist.id,
                },
            });
            console.log(`Created artwork with id: ${artwork.id}`);
        } else {
            console.log(`Artwork ${art.id} already exists - Updating downloadPath...`);
            await prisma.artwork.update({
                where: { id: art.id },
                data: { downloadPath: art.downloadPath }
            });
        }
    }
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
