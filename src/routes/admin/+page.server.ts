import { adminSessionDeleteOptions } from '$lib/server/adminCookie';
import { log } from '$lib/server/logger';
import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteSession } from '$lib/server/adminSession';
import { CONTACTS_PER_PAGE, EMAIL_REGEX } from '$lib/constants';

interface ContactRecord {
    id: string;
    firstName: string;
    lastName: string;
    organization: string | null;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    privacyAccepted: boolean;
    targetRecipient: string | null;
    targetRecipientLabel: string | null;
    createdAt: Date;
}

function recipientLabel(
    dept:
        | {
              name: string;
              einrichtung: { name: string; mandant: { name: string } };
          }
        | undefined,
    fallbackId: string | null
): string | null {
    if (dept) {
        return `${dept.einrichtung.mandant.name} → ${dept.einrichtung.name} → ${dept.name}`;
    }
    if (fallbackId) {
        return `Nicht zuordenbar (ID: ${fallbackId})`;
    }
    return null;
}

export const load: PageServerLoad = async ({ url }) => {
    const pageRaw = Number(url.searchParams.get('page') ?? '1');
    const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

    const totalContacts = await prisma.contact.count({ where: { deletedAt: null } });
    const totalPages = Math.max(1, Math.ceil(totalContacts / CONTACTS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    // 1. Fetch Contact Requests
    const rows: ContactRecord[] = await prisma.contact.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * CONTACTS_PER_PAGE,
        take: CONTACTS_PER_PAGE
    });

    const recipientIds = [...new Set(rows.map((c) => c.targetRecipient).filter(Boolean))] as string[];

    const depts =
        recipientIds.length > 0
            ? await prisma.fachabteilung.findMany({
                  where: { id: { in: recipientIds } },
                  include: { einrichtung: { include: { mandant: true } } }
              })
            : [];

    const deptById = new Map(depts.map((d) => [d.id, d]));

    const contacts = rows.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        recipientLabel:
            c.targetRecipientLabel ??
            recipientLabel(
                c.targetRecipient ? deptById.get(c.targetRecipient) : undefined,
                c.targetRecipient
            )
    }));

    // 2. Fetch Recipient Structure
    const mandanten = await prisma.mandant.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
            einrichtungen: {
                orderBy: { createdAt: 'asc' },
                include: {
                    abteilungen: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            }
        }
    });

    return {
        contacts,
        currentPage: safePage,
        totalPages,
        totalContacts,
        mandanten: mandanten.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            einrichtungen: m.einrichtungen.map((e) => ({
                ...e,
                createdAt: e.createdAt.toISOString(),
                abteilungen: e.abteilungen.map((a) => ({
                    ...a,
                    createdAt: a.createdAt.toISOString()
                }))
            }))
        }))
    };
};

export const actions: Actions = {
    // --- Auth ---
    logout: async ({ cookies }) => {
        const token = cookies.get('admin_session');
        if (token) await deleteSession(token);
        cookies.delete('admin_session', adminSessionDeleteOptions);
        redirect(303, '/admin/login');
    },

    // --- Contact Requests ---
    deleteContact: async ({ request }) => {
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
    },

    // --- Mandant ---
    createMandant: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        if (typeof name !== 'string' || !name.trim()) return fail(400, { error: 'Name ist erforderlich.' });

        try {
            await prisma.mandant.create({ data: { name: name.trim() } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error creating Mandant');
            return fail(500, { error: 'Mandant konnte nicht angelegt werden.' });
        }
    },
    updateMandant: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name');

        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });
        if (typeof name !== 'string' || !name.trim()) return fail(400, { error: 'Name ist erforderlich.' });

        try {
            await prisma.mandant.update({ where: { id }, data: { name: name.trim() } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error updating Mandant');
            return fail(500, { error: 'Mandant konnte nicht aktualisiert werden.' });
        }
    },
    deleteMandant: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });

        try {
            await prisma.mandant.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error deleting Mandant');
            return fail(500, { error: 'Mandant konnte nicht gelöscht werden.' });
        }
    },

    // --- Einrichtung ---
    createEinrichtung: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const mandantId = formData.get('mandantId');
        if (typeof name !== 'string' || !name.trim() || typeof mandantId !== 'string' || !mandantId) {
            return fail(400, { error: 'Name und Mandant-ID sind erforderlich.' });
        }

        try {
            await prisma.einrichtung.create({ data: { name: name.trim(), mandantId } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error creating Einrichtung');
            return fail(500, { error: 'Einrichtung konnte nicht angelegt werden.' });
        }
    },
    updateEinrichtung: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name');

        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });
        if (typeof name !== 'string' || !name.trim()) return fail(400, { error: 'Name ist erforderlich.' });

        try {
            await prisma.einrichtung.update({ where: { id }, data: { name: name.trim() } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error updating Einrichtung');
            return fail(500, { error: 'Einrichtung konnte nicht aktualisiert werden.' });
        }
    },
    deleteEinrichtung: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });

        try {
            await prisma.einrichtung.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error deleting Einrichtung');
            return fail(500, { error: 'Einrichtung konnte nicht gelöscht werden.' });
        }
    },

    // --- Fachabteilung ---
    createFachabteilung: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const einrichtungId = formData.get('einrichtungId');

        if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof einrichtungId !== 'string' || !einrichtungId) {
            return fail(400, { error: 'Name, E-Mail und Einrichtung-ID sind erforderlich.' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return fail(400, { error: 'Ungültige E-Mail Adresse.' });
        }

        try {
            await prisma.fachabteilung.create({ data: { name: name.trim(), email: email.trim(), einrichtungId } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error creating Fachabteilung');
            return fail(500, { error: 'Fachabteilung konnte nicht angelegt werden.' });
        }
    },
    updateFachabteilung: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const email = formData.get('email');

        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });
        if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
            return fail(400, { error: 'Name und E-Mail sind erforderlich.' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return fail(400, { error: 'Ungültige E-Mail Adresse.' });
        }

        try {
            await prisma.fachabteilung.update({ where: { id }, data: { name: name.trim(), email: email.trim() } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error updating Fachabteilung');
            return fail(500, { error: 'Fachabteilung konnte nicht aktualisiert werden.' });
        }
    },
    deleteFachabteilung: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        if (typeof id !== 'string' || !id) return fail(400, { error: 'Ungültige ID.' });

        try {
            await prisma.fachabteilung.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            log.error({ err: error }, 'Error deleting Fachabteilung');
            return fail(500, { error: 'Fachabteilung konnte nicht gelöscht werden.' });
        }
    }
};
