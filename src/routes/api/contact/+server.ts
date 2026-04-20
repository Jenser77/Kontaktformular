import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { sendContactEmail } from '$lib/server/mailer';
import type { ContactData } from '$lib/server/mailer';
import { contactRequestSchema } from '$lib/server/contactSchema';
import { log } from '$lib/server/logger';
import {
    CSRF_COOKIE_NAME,
    DEFAULT_RATE_LIMIT_MAX,
    DEFAULT_RATE_LIMIT_WINDOW_MS
} from '$lib/constants';
import {
    getClientIp,
    getCsrfTokenFromRequest,
    isAllowedApiOrigin,
    isValidDoubleSubmitCsrf
} from '$lib/server/security';

function honeypotTripped(raw: unknown): boolean {
    if (!raw || typeof raw !== 'object') return false;
    const v = (raw as Record<string, unknown>).phone_alt;
    return typeof v === 'string' && v.trim() !== '';
}

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
    if (!isAllowedApiOrigin(request, process.env.ALLOWED_ORIGIN ?? '')) {
        return json({ success: false, error: 'Ungültige Herkunft der Anfrage.' }, { status: 403 });
    }

    const requestCsrf = getCsrfTokenFromRequest(request);
    const cookieCsrf = cookies.get(CSRF_COOKIE_NAME) ?? '';
    if (!isValidDoubleSubmitCsrf(requestCsrf, cookieCsrf)) {
        return json({ success: false, error: 'Ungültiges Sicherheits-Token.' }, { status: 403 });
    }

    const ip = getClientIp({ request, getClientAddress });
    if (
        await isRateLimited(
            ip,
            { windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS, max: DEFAULT_RATE_LIMIT_MAX },
            'contact'
        )
    ) {
        return json(
            {
                success: false,
                error: 'Zu viele Anfragen von dieser IP-Adresse. Bitte versuchen Sie es in 15 Minuten erneut.'
            },
            { status: 429 }
        );
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return json({ success: false, error: 'Ungültiger Request-Body.' }, { status: 400 });
    }

    if (honeypotTripped(raw)) {
        log.warn({ ip }, 'Honeypot triggered in /api/contact');
        return json({ success: false, error: 'Spam erkannt. Anfrage abgelehnt.' }, { status: 400 });
    }

    const parsed = contactRequestSchema.safeParse(raw);
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        const msg = first?.message ?? 'Ungültige Eingaben.';
        return json({ success: false, error: msg }, { status: 400 });
    }

    const data = parsed.data;
    if (!data.privacyAccepted) {
        return json(
            { success: false, error: 'Bitte stimmen Sie der Datenschutzerklärung zu.' },
            { status: 400 }
        );
    }

    let targetEmail: string;
    let recipientLabel: string;
    try {
        const fachabteilung = await prisma.fachabteilung.findUnique({
            where: { id: data.recipientId },
            include: { einrichtung: { include: { mandant: true } } }
        });
        if (!fachabteilung) {
            return json({ success: false, error: 'Der ausgewählte Empfänger ist ungültig.' }, { status: 400 });
        }
        targetEmail = fachabteilung.email;
        recipientLabel = `${fachabteilung.einrichtung.mandant.name} → ${fachabteilung.einrichtung.name} → ${fachabteilung.name}`;
    } catch (e) {
        log.error({ err: e }, 'API /contact recipient lookup error');
        return json({ success: false, error: 'Datenbankfehler bei der Empfängerprüfung.' }, { status: 500 });
    }

    try {
        const contactData: ContactData = {
            firstName: data.firstName,
            lastName: data.lastName,
            organization: data.organization,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message
        };

        const contact = await prisma.contact.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                organization: data.organization ?? null,
                email: data.email,
                phone: data.phone ?? null,
                subject: data.subject,
                message: data.message,
                privacyAccepted: true,
                targetRecipient: data.recipientId,
                targetRecipientLabel: recipientLabel,
                emailSentAt: null
            }
        });

        await sendContactEmail(contactData, targetEmail);

        await prisma.contact.update({
            where: { id: contact.id },
            data: { emailSentAt: new Date() }
        });

        return json({
            success: true,
            message: 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze.'
        });
    } catch (error) {
        log.error({ err: error }, 'Contact API mail or persist error');
        return json(
            {
                success: false,
                error: 'Fehler beim Versuch die Nachricht zu versenden. Versuchen Sie es später nochmal.'
            },
            { status: 500 }
        );
    }
};
