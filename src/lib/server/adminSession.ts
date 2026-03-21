import { prisma } from '$lib/server/prisma';

const SESSION_MS = 8 * 60 * 60 * 1000;

export async function createSession(): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MS);

    await prisma.adminSession.create({
        data: { id: token, expiresAt }
    });

    await prisma.adminSession.deleteMany({
        where: { expiresAt: { lt: new Date() } }
    });

    return token;
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    const row = await prisma.adminSession.findUnique({ where: { id: token } });
    if (!row) return false;

    if (row.expiresAt < new Date()) {
        await prisma.adminSession.delete({ where: { id: token } }).catch(() => {});
        return false;
    }

    return true;
}

export async function deleteSession(token: string): Promise<void> {
    await prisma.adminSession.deleteMany({ where: { id: token } });
}
