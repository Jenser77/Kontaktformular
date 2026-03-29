import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Cookies } from '@sveltejs/kit';
import { getValidAdminSession } from '$lib/server/adminSession';
import { prisma } from '$lib/server/prisma';

function csvCell(value: string | number | boolean | null | undefined): string {
    const s = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

async function csvExportResponse(cookies: Cookies): Promise<Response> {
    const token = cookies.get('admin_session');
    if (!(await getValidAdminSession(token))) {
        error(401, 'Nicht angemeldet');
    }

    const rows = await prisma.contact.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    const header = [
        'createdAt',
        'firstName',
        'lastName',
        'email',
        'phone',
        'organization',
        'subject',
        'message',
        'privacyAccepted',
        'targetRecipient',
        'targetRecipientLabel'
    ];

    const lines = [
        header.join(','),
        ...rows.map((r) =>
            [
                r.createdAt.toISOString(),
                r.firstName,
                r.lastName,
                r.email,
                r.phone,
                r.organization,
                r.subject,
                r.message,
                r.privacyAccepted,
                r.targetRecipient,
                r.targetRecipientLabel
            ].map(csvCell).join(',')
        )
    ];

    const body = '\uFEFF' + lines.join('\r\n');

    return new Response(body, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="kontaktanfragen-${new Date().toISOString().slice(0, 10)}.csv"`
        }
    });
}

export const POST: RequestHandler = async ({ cookies }) => csvExportResponse(cookies);

export const GET: RequestHandler = () =>
    new Response('Method Not Allowed — CSV-Export nur per POST aus dem Admin-Bereich.', {
        status: 405,
        headers: { Allow: 'POST' }
    });
