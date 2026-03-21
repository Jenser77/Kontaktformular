import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import bcrypt from 'bcryptjs';
import { createSession } from '$lib/server/adminSession';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

function getAdminUsers(): Array<{ user: string; pass: string }> {
    try {
        const raw = process.env.ADMIN_USERS;
        if (raw) return JSON.parse(raw);
    } catch { /* JSON.parse failed, use fallback */ }
    // Fallback to legacy single-user env vars
    return [{ user: process.env.ADMIN_USER ?? 'admin', pass: process.env.ADMIN_PASS ?? '' }];
}

export const actions: Actions = {
    default: async ({ request, cookies, getClientAddress }) => {
        const ip = getClientAddress();
        if (isRateLimited(ip, { windowMs: 15 * 60 * 1000, max: 5 })) {
            return fail(429, { error: 'Zu viele Anmeldeversuche. Bitte 15 Minuten warten.' });
        }

        const data = await request.formData();
        const username = data.get('username')?.toString() ?? '';
        const password = data.get('password')?.toString() ?? '';

        const usernameNorm = username.trim().toLowerCase();

        const dbUser = usernameNorm
            ? await prisma.adminUser.findUnique({ where: { username: usernameNorm } })
            : null;

        let token: string;

        if (dbUser) {
            const ok = await bcrypt.compare(password, dbUser.passwordHash);
            if (!ok) {
                return fail(401, { error: 'Benutzername oder Passwort falsch.' });
            }
            token = await createSession({ adminUserId: dbUser.id });
        } else {
            const users = getAdminUsers();
            const valid = users.some((u) => u.user === username && u.pass === password);
            if (!valid) {
                return fail(401, { error: 'Benutzername oder Passwort falsch.' });
            }
            token = await createSession({ loginLabel: username.trim() || null });
        }

        cookies.set('admin_session', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 8 * 60 * 60
        });

        redirect(303, '/admin');
    }
};
