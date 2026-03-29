import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

export interface RateLimitOptions {
    windowMs: number;
    max: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

const upstashLimiters = new Map<string, Ratelimit>();

function isRateLimitDisabled(): boolean {
    const raw = process.env.RATE_LIMIT_DISABLED?.trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function windowMsToUpstashLabel(windowMs: number): Duration {
    const sec = Math.floor(windowMs / 1000);
    if (sec <= 0) return '1 s';
    if (sec < 60) return `${sec} s` as Duration;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} m` as Duration;
    const h = Math.floor(min / 60);
    return `${h} h` as Duration;
}

function getUpstashLimiter(options: RateLimitOptions): Ratelimit | null {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) {
        return null;
    }

    const key = `${options.max}:${options.windowMs}`;
    let limiter = upstashLimiters.get(key);
    if (!limiter) {
        const redis = new Redis({ url, token });
        limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(options.max, windowMsToUpstashLabel(options.windowMs)),
            prefix: `kf:rl:${key}`
        });
        upstashLimiters.set(key, limiter);
    }
    return limiter;
}

function memoryRateLimited(ip: string, namespace: string, options: RateLimitOptions): boolean {
    const storeKey = `${namespace}:${ip}`;
    const now = Date.now();
    const entry = memoryStore.get(storeKey);

    if (!entry) {
        memoryStore.set(storeKey, { count: 1, firstRequest: now });
        return false;
    }

    if (now - entry.firstRequest > options.windowMs) {
        memoryStore.set(storeKey, { count: 1, firstRequest: now });
        return false;
    }

    entry.count += 1;
    return entry.count > options.max;
}

/**
 * Returns true if the request should be blocked (rate limited).
 * Uses Upstash when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set; otherwise in-memory (per process).
 */
export async function isRateLimited(
    ip: string,
    options: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 5 },
    namespace = 'default'
): Promise<boolean> {
    if (isRateLimitDisabled()) {
        return false;
    }

    const limiter = getUpstashLimiter(options);
    if (limiter) {
        const id = `${namespace}:${ip}`;
        const { success } = await limiter.limit(id);
        return !success;
    }

    return memoryRateLimited(ip, namespace, options);
}

setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    for (const [key, entry] of memoryStore) {
        if (now - entry.firstRequest > windowMs) {
            memoryStore.delete(key);
        }
    }
}, 5 * 60 * 1000);
