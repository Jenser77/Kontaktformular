import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async () => {
    const t0 = Date.now();
    let dbOk = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch (e) {
        log.error({ err: e }, 'health database unreachable');
    }

    return json({
        status: dbOk ? 'OK' : 'degraded',
        db: dbOk,
        uptime: process.uptime(),
        dbLatencyMs: Date.now() - t0
    });
};
