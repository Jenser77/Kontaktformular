import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { adminSessionDeleteOptions } from '$lib/server/adminCookie';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';
import { deleteSession, getValidAdminSession, invalidateOtherAdminSessions } from '$lib/server/adminSession';

export const authActions = {
	logout: async ({ cookies }: RequestEvent) => {
		const token = cookies.get('admin_session');
		if (token) await deleteSession(token);
		cookies.delete('admin_session', adminSessionDeleteOptions);
		redirect(303, '/admin/login');
	},

	changePassword: async ({ request, cookies }: RequestEvent) => {
		const token = cookies.get('admin_session');
		const session = await getValidAdminSession(token);
		const username = session?.adminUser?.username;
		if (!username) {
			return fail(401, { error: 'Nicht angemeldet oder ungültige Sitzung.' });
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'Bitte alle Passwort-Felder ausfüllen.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'Die neuen Passwörter stimmen nicht überein.' });
		}

		if (newPassword.length < 10) {
			return fail(400, { error: 'Das neue Passwort muss mindestens 10 Zeichen lang sein.' });
		}

		if (newPassword === currentPassword) {
			return fail(400, { error: 'Das neue Passwort muss sich vom alten unterscheiden.' });
		}

		try {
			const user = await prisma.adminUser.findUnique({
				where: { username },
				select: { id: true, passwordHash: true }
			});

			if (!user) {
				return fail(401, { error: 'Admin-Benutzer nicht gefunden.' });
			}

			const ok = await bcrypt.compare(currentPassword, user.passwordHash);
			if (!ok) {
				return fail(400, { error: 'Das aktuelle Passwort ist falsch.' });
			}

			const passwordHash = await bcrypt.hash(newPassword, 10);
			await prisma.adminUser.update({
				where: { id: user.id },
				data: { passwordHash }
			});

			if (token) {
				await invalidateOtherAdminSessions(user.id, token);
			}

			return { success: true, passwordMessage: 'Passwort erfolgreich geändert.' };
		} catch (error) {
			log.error({ err: error }, 'Error changing admin password');
			return fail(500, { error: 'Passwort konnte nicht geändert werden.' });
		}
	}
};
