import { fail, type RequestEvent } from '@sveltejs/kit';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';

export const contactActions = {
	deleteContact: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });

		try {
			await prisma.contact.update({
				where: { id },
				data: { deletedAt: new Date() }
			});
			return { success: true };
		} catch (error) {
			log.error({ err: error }, 'Error soft-deleting contact');
			return fail(500, { error: 'Fehler beim Löschen.' });
		}
	}
};
