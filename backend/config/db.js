const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function connectWithRetry(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log('✅ Database connected successfully');
            return;
        } catch (error) {
            console.error(`❌ Database connection failed (Attempt ${i + 1}/${retries}):`, error.message);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('🔥 Critical: Could not connect to database after multiple attempts.');
                process.exit(1);
            }
        }
    }
}

module.exports = { prisma, connectWithRetry };
