import type { Mandant } from '$lib/kontakt/wizard/types';
import { prisma } from '$lib/server/prisma';

/** Mandant → Einrichtung → Fachabteilung for contact routing (no department emails exposed). */
export async function getRecipientTree(): Promise<Mandant[]> {
	const mandanten = await prisma.mandant.findMany({
		include: {
			einrichtungen: {
				include: {
					abteilungen: {
						select: { id: true, name: true }
					}
				}
			}
		}
	});

	return mandanten.map((m) => ({
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
}
