import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { sendContactEmail } from '$lib/server/mailer';
import type { ContactData } from '$lib/server/mailer';
import { contactRequestSchema } from '$lib/server/contactSchema';

function honeypotTripped(raw: unknown): boolean {
    if (!raw || typeof raw !== 'object') return false;
    const v = (raw as Record<string, unknown>).phone_alt;
    return typeof v === 'string' && v.trim() !== '';
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    const ip = getClientAddress();
    if (await isRateLimited(ip, { windowMs: 15 * 60 * 1000, max: 5 }, 'contact')) {
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
        console.warn(`[Security Warning] Honeypot ausgelöst von IP: ${ip}`);
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
        console.error('API /contact recipient lookup error:', e);
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

        await sendContactEmail(contactData, targetEmail);

        await prisma.contact.create({
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
                targetRecipientLabel: recipientLabel
            }
        });

        return json({
            success: true,
            message: 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze.'
        });
    } catch (error) {
        console.error('[Contact API] Fehler beim Mailversand oder Speichern:', error);
        return json(
            {
                success: false,
                error: 'Fehler beim Versuch die Nachricht zu versenden. Versuchen Sie es später nochmal.'
            },
            { status: 500 }
        );
    }
};
