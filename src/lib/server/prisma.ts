import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (!globalForPrisma.prisma) {
            const connectionString = process.env.DATABASE_URL!;
            const adapter = new PrismaPg({ connectionString });
            globalForPrisma.prisma = new PrismaClient({ adapter });
        }
        const val = (globalForPrisma.prisma as Record<string | symbol, unknown>)[prop];
        return typeof val === 'function' ? val.bind(globalForPrisma.prisma) : val;
    }
});
