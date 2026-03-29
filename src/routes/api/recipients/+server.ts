import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async () => {
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

        return json({ success: true, data: structure });
    } catch (e) {
        log.error({ err: e }, 'API /recipients error');
        return json({ success: false, error: 'Ein interner Serverfehler ist aufgetreten.' }, { status: 500 });
    }
};
