import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { log } from '$lib/server/logger';
import { getRecipientTree } from '$lib/server/recipientTree';
import { isRateLimited } from '$lib/server/rateLimit';
import { DEFAULT_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_WINDOW_MS } from '$lib/constants';
import { getClientIp } from '$lib/server/security';

export const GET: RequestHandler = async ({ request, getClientAddress }) => {
    const ip = getClientIp({ request, getClientAddress });
    if (
        await isRateLimited(
            ip,
            { windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS, max: DEFAULT_RATE_LIMIT_MAX * 4 },
            'recipients'
        )
    ) {
        return json(
            { success: false, error: 'Zu viele Anfragen. Bitte später erneut versuchen.' },
            { status: 429 }
        );
    }

    try {
        const structure = await getRecipientTree();

        return json(
            { success: true, data: structure },
            {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
                }
            }
        );
    } catch (e) {
        log.error({ err: e }, 'API /recipients error');
        return json({ success: false, error: 'Ein interner Serverfehler ist aufgetreten.' }, { status: 500 });
    }
};
