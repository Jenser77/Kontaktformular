import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import bcrypt from 'bcryptjs';
import { adminSessionSetOptions } from '$lib/server/adminCookie';
import { createSession } from '$lib/server/adminSession';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { DEFAULT_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_WINDOW_MS } from '$lib/constants';
import { log } from '$lib/server/logger';
import { getClientIp } from '$lib/server/security';

export const actions: Actions = {
    default: async ({ request, cookies, getClientAddress }) => {
        const ip = getClientIp({ request, getClientAddress });
        if (
            await isRateLimited(
                ip,
                { windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS, max: DEFAULT_RATE_LIMIT_MAX },
                'admin-login'
            )
        ) {
            return fail(429, { error: 'Zu viele Anmeldeversuche. Bitte 15 Minuten warten.' });
        }

        const data = await request.formData();
        const username = data.get('username')?.toString() ?? '';
        const password = data.get('password')?.toString() ?? '';
        const usernameTrimmed = username.trim().replace(/\r/g, '');
        const usernameNorm = usernameTrimmed.toLowerCase();

        let dbUser: Awaited<ReturnType<typeof prisma.adminUser.findUnique>>;
        try {
            dbUser = usernameNorm
                ? await prisma.adminUser.findUnique({ where: { username: usernameNorm } })
                : null;
        } catch (error) {
            log.error({ err: error }, 'Admin login database lookup failed');
            return fail(503, { error: 'Login derzeit nicht verfügbar. Bitte später erneut versuchen.' });
        }

        if (!dbUser) {
            return fail(401, { error: 'Benutzername oder Passwort falsch.' });
        }

        const ok = await bcrypt.compare(password, dbUser.passwordHash);
        if (!ok) {
            return fail(401, { error: 'Benutzername oder Passwort falsch.' });
        }

        const token = await createSession({ adminUserId: dbUser.id });
        cookies.set('admin_session', token, adminSessionSetOptions);

        redirect(303, '/admin');
    }
};
