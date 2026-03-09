interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

interface RateLimitOptions {
    windowMs: number;
    max: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if a given IP has exceeded the rate limit.
 * Returns `true` if the request should be blocked.
 */
export function isRateLimited(ip: string, options: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 5 }): boolean {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry) {
        store.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    // Reset window if expired
    if (now - entry.firstRequest > options.windowMs) {
        store.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    entry.count += 1;

    if (entry.count > options.max) {
        return true;
    }

    return false;
}

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    for (const [ip, entry] of store) {
        if (now - entry.firstRequest > windowMs) {
            store.delete(ip);
        }
    }
}, 5 * 60 * 1000);
