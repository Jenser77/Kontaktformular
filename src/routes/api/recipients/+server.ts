import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';
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
        const mandanten = await prisma.mandant.findMany({
            include: {
                einrichtungen: {
                    include: {
                        abteilungen: {
                            select: { id: true, name: true } // WICHTIG: EMail wird nicht auf Client freigelegt
                        }
                    }
                }
            }
        });

        // The exact structure expected by the frontend script.js
        const structure = mandanten.map((m) => ({
            id: m.id,
            name: m.name,
            einrichtungen: m.einrichtungen.map((e) => ({
                id: e.id,
                name: e.name,
                abteilungen: e.abteilungen.map((a) => ({
                    id: a.id,
                    name: a.name
                }))
            }))
        }));

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
