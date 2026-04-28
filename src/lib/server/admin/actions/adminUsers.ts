import { fail, type RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getValidAdminSession } from '$lib/server/adminSession';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';
import { DISABLED_DISPLAY_PREFIX, isDisabledDisplayName } from '$lib/server/admin/helpers';
import {
	isValidAdminUsername,
	normalizeAdminUsername,
	validateDeleteTarget,
	validateDisableTarget
} from './adminUserRules';

export const adminUserActions = {
	createAdminUser: async ({ request, cookies, getClientAddress }: RequestEvent) => {
		const token = cookies.get('admin_session');
		const session = await getValidAdminSession(token);
		const actorUsername = session?.adminUser?.username;
		if (!actorUsername) {
			return fail(401, { error: 'Nicht angemeldet oder ungültige Sitzung.' });
		}

		const formData = await request.formData();
		const usernameRaw = formData.get('username')?.toString() ?? '';
		const displayNameRaw = formData.get('displayName')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		const username = normalizeAdminUsername(usernameRaw);
		const displayName = displayNameRaw.trim();

		if (!username || !password || !confirmPassword) {
			return fail(400, { error: 'Bitte Benutzername und Passwort vollständig ausfüllen.' });
		}
		if (!isValidAdminUsername(username)) {
			return fail(400, {
				error: 'Benutzername ungültig. Erlaubt sind 3-64 Zeichen: a-z, 0-9, Punkt, Unterstrich, Bindestrich.'
			});
		}
		if (password.length < 10) {
			return fail(400, { error: 'Das Passwort muss mindestens 10 Zeichen lang sein.' });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Die Passwörter stimmen nicht überein.' });
		}

		try {
			const passwordHash = await bcrypt.hash(password, 10);
			await prisma.adminUser.create({
				data: {
					username,
					displayName: displayName || null,
					passwordHash
				}
			});
			log.info(
				{ actorUsername, createdUsername: username, ip: getClientAddress() },
				'Admin user created from admin UI'
			);
			return { success: true, message: `Admin-Benutzer "${username}" wurde angelegt.` };
		} catch (error) {
			log.error(
				{ err: error, actorUsername, createdUsername: username },
				'Error creating admin user from admin UI'
			);

			if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
				return fail(400, { error: 'Benutzername existiert bereits.' });
			}
			return fail(500, { error: 'Admin-Benutzer konnte nicht angelegt werden.' });
		}
	},

	disableAdminUser: async ({ request, cookies, getClientAddress }: RequestEvent) => {
		const token = cookies.get('admin_session');
		const session = await getValidAdminSession(token);
		const actorUsername = session?.adminUser?.username;
		if (!actorUsername) {
			return fail(401, { error: 'Nicht angemeldet oder ungültige Sitzung.' });
		}

		const formData = await request.formData();
		const targetUserId = formData.get('id');
		if (typeof targetUserId !== 'string' || !targetUserId) {
			return fail(400, { error: 'Ungültige Admin-ID.' });
		}

		try {
			const target = await prisma.adminUser.findUnique({
				where: { id: targetUserId },
				select: { id: true, username: true, displayName: true }
			});
			if (!target) {
				return fail(404, { error: 'Admin-Benutzer nicht gefunden.' });
			}
			const disableValidationError = validateDisableTarget(
				actorUsername,
				target.username,
				isDisabledDisplayName(target.displayName)
			);
			if (disableValidationError) {
				return fail(400, { error: disableValidationError });
			}

			const lockSecret = `${crypto.randomUUID()}-${Date.now()}`;
			const passwordHash = await bcrypt.hash(lockSecret, 10);
			const nextDisplayName =
				`${DISABLED_DISPLAY_PREFIX}${target.displayName?.trim() || target.username}`.slice(0, 190);

			await prisma.adminUser.update({
				where: { id: target.id },
				data: {
					passwordHash,
					displayName: nextDisplayName
				}
			});
			await prisma.adminSession.deleteMany({ where: { adminUserId: target.id } });

			log.warn(
				{ actorUsername, targetUsername: target.username, ip: getClientAddress() },
				'Admin user disabled from admin UI'
			);
			return { success: true, message: `Admin-Benutzer "${target.username}" wurde deaktiviert.` };
		} catch (error) {
			log.error({ err: error, actorUsername, targetUserId }, 'Error disabling admin user');
			return fail(500, { error: 'Admin-Benutzer konnte nicht deaktiviert werden.' });
		}
	},

	deleteAdminUser: async ({ request, cookies, getClientAddress }: RequestEvent) => {
		const token = cookies.get('admin_session');
		const session = await getValidAdminSession(token);
		const actorUsername = session?.adminUser?.username;
		if (!actorUsername) {
			return fail(401, { error: 'Nicht angemeldet oder ungültige Sitzung.' });
		}

		const formData = await request.formData();
		const targetUserId = formData.get('id');
		if (typeof targetUserId !== 'string' || !targetUserId) {
			return fail(400, { error: 'Ungültige Admin-ID.' });
		}

		try {
			const [target, userCount] = await Promise.all([
				prisma.adminUser.findUnique({
					where: { id: targetUserId },
					select: { id: true, username: true }
				}),
				prisma.adminUser.count()
			]);

			if (!target) {
				return fail(404, { error: 'Admin-Benutzer nicht gefunden.' });
			}
			const deleteValidationError = validateDeleteTarget(actorUsername, target.username, userCount);
			if (deleteValidationError) {
				return fail(400, { error: deleteValidationError });
			}

			await prisma.adminUser.delete({ where: { id: target.id } });

			log.warn(
				{ actorUsername, targetUsername: target.username, ip: getClientAddress() },
				'Admin user deleted from admin UI'
			);
			return { success: true, message: `Admin-Benutzer "${target.username}" wurde gelöscht.` };
		} catch (error) {
			log.error({ err: error, actorUsername, targetUserId }, 'Error deleting admin user');
			return fail(500, { error: 'Admin-Benutzer konnte nicht gelöscht werden.' });
		}
	}
};
