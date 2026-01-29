const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.user.count();
        console.log("User count:", count);
        const first = await prisma.user.findFirst();
        console.log("First user:", first);
    } catch (e) {
        console.error(e);
    }
}
check();
