import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';
import { isRateLimited } from '$lib/server/rateLimit';
import {
    DEFAULT_RATE_LIMIT_MAX,
    DEFAULT_RATE_LIMIT_WINDOW_MS,
    HEALTH_DB_LATENCY_WARN_MS
} from '$lib/constants';

export const GET: RequestHandler = async ({ getClientAddress }) => {
    const ip = getClientAddress();
    if (
        await isRateLimited(
            ip,
            { windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS, max: DEFAULT_RATE_LIMIT_MAX * 12 },
            'health'
        )
    ) {
        return json({ status: 'rate_limited' }, { status: 429 });
    }

    const t0 = Date.now();
    let dbOk = false;
    const alerts: string[] = [];
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch (e) {
        log.error({ err: e }, 'health database unreachable');
        alerts.push('db_unreachable');
    }

    const dbLatencyMs = Date.now() - t0;
    if (dbOk && dbLatencyMs > HEALTH_DB_LATENCY_WARN_MS) {
        alerts.push('db_slow');
        log.warn({ dbLatencyMs }, 'health database latency high');
    }

    return json({
        status: !dbOk ? 'degraded' : alerts.includes('db_slow') ? 'slow' : 'OK',
        db: dbOk,
        uptime: process.uptime(),
        dbLatencyMs,
        alerts
    });
};
