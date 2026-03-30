import { prisma } from '$lib/server/prisma';
import { log } from '$lib/server/logger';
import { SESSION_DURATION_MS } from '$lib/constants';

export type ValidAdminSession = {
    adminUser: { username: string; displayName: string | null } | null;
    loginLabel: string | null;
};

export async function getValidAdminSession(token: string | undefined): Promise<ValidAdminSession | null> {
    if (!token) return null;

    const row = await prisma.adminSession.findUnique({
        where: { id: token },
        include: { adminUser: { select: { username: true, displayName: true } } }
    });

    if (!row) return null;

    if (row.expiresAt < new Date()) {
        await prisma.adminSession.delete({ where: { id: token } }).catch((err) => {
            log.debug({ err }, 'Failed to delete expired admin session');
        });
        return null;
    }

    return {
        adminUser: row.adminUser,
        loginLabel: row.loginLabel
    };
}

export function displayNameFromSession(s: ValidAdminSession): string {
    if (s.adminUser) {
        const d = s.adminUser.displayName?.trim();
        return d || s.adminUser.username;
    }
    const label = s.loginLabel?.trim();
    return label || 'Administrator';
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
    return (await getValidAdminSession(token)) !== null;
}

export type CreateSessionOptions = {
    adminUserId?: string | null;
    loginLabel?: string | null;
};

export async function createSession(opts: CreateSessionOptions = {}): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.adminSession.create({
        data: {
            id: token,
            expiresAt,
            adminUserId: opts.adminUserId ?? null,
            loginLabel: opts.loginLabel ?? null
        }
    });

    await prisma.adminSession.deleteMany({
        where: { expiresAt: { lt: new Date() } }
    });

    return token;
}

export async function deleteSession(token: string): Promise<void> {
    await prisma.adminSession.deleteMany({ where: { id: token } });
}
