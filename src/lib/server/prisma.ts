import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: InstanceType<typeof Pool> | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }

    const pool =
        globalForPrisma.pgPool ??
        new Pool({
            connectionString,
            max: Number(process.env.PG_POOL_MAX ?? 10),
            idleTimeoutMillis: 20_000,
            connectionTimeoutMillis: 10_000
        });

    if (!globalForPrisma.pgPool) {
        globalForPrisma.pgPool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
