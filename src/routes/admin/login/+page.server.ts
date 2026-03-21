import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import bcrypt from 'bcryptjs';
import { createSession } from '$lib/server/adminSession';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

function getSingleAdminUser(): { user: string; pass: string } | null {
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASS;
    if (!user || !pass) return null;
    return { user, pass };
}

function getAdminUsersFromList(): Array<{ user: string; pass: string }> {
    try {
        const raw = process.env.ADMIN_USERS;
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter((u): u is { user: string; pass: string } =>
                typeof u?.user === 'string' && typeof u?.pass === 'string'
            );
        }
    } catch { /* JSON.parse failed */ }
    return [];
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
        const usernameTrimmed = username.trim();

        // Priority 1: ADMIN_USER / ADMIN_PASS
        const singleAdmin = getSingleAdminUser();
        if (singleAdmin && singleAdmin.user === usernameTrimmed && singleAdmin.pass === password) {
            const token = await createSession({ loginLabel: usernameTrimmed || null });
            cookies.set('admin_session', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 8 * 60 * 60
            });
            redirect(303, '/admin');
        }

        // Priority 2: ADMIN_USERS list
        const users = getAdminUsersFromList();
        const validListUser = users.some((u) => u.user === usernameTrimmed && u.pass === password);
        if (validListUser) {
            const token = await createSession({ loginLabel: usernameTrimmed || null });
            cookies.set('admin_session', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 8 * 60 * 60
            });
            redirect(303, '/admin');
        }

        // Priority 3: AdminUser table
        const usernameNorm = usernameTrimmed.toLowerCase();
        const dbUser = usernameNorm
            ? await prisma.adminUser.findUnique({ where: { username: usernameNorm } })
            : null;

        if (!dbUser) {
            return fail(401, { error: 'Benutzername oder Passwort falsch.' });
        }

        const ok = await bcrypt.compare(password, dbUser.passwordHash);
        if (!ok) {
            return fail(401, { error: 'Benutzername oder Passwort falsch.' });
        }

        const token = await createSession({ adminUserId: dbUser.id });
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
