import { PrismaClient } from '@prisma/client';

let prisma;

const initPrisma = (env) => {
    if (!prisma) {
        // Use env.DATABASE_URL from Cloudflare OR process.env for local
        const url = env?.DATABASE_URL || process.env.DATABASE_URL;

        console.log("Initializing Prisma with URL:", url ? "FOUND" : "MISSING");

        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: url
                }
            },
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    return prisma;
};

// For existing non-Cloudflare usage, we can export a default instance if possible, 
// but in Workers, we rely on initPrisma(env).
// We'll export a getter or just the init function.

export { initPrisma };

// Polyfill for legacy calls in passport etc.
// Note: This 'prisma' export will only work if initialized.
// For files importing 'prisma' directly, they might fail if called before init.
// We might need to refactor consumers to call getPrisma().

export const getPrisma = () => {
    if (!prisma) {
        // Fallback for local testing if env wasn't passed yet
        if (process.env.DATABASE_URL) return initPrisma(process.env);
        throw new Error("Prisma not initialized! Call initPrisma(env) first.");
    }
    return prisma;
};
