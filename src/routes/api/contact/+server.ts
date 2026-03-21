import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isRateLimited } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { sendContactEmail } from '$lib/server/mailer';
import type { ContactData } from '$lib/server/mailer';

interface ContactRequestBody {
    phone_alt?: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    privacyAccepted?: boolean | string;
    recipientId?: string;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    // 1. Rate Limiting
    const ip = getClientAddress();
    if (isRateLimited(ip)) {
        return json(
            { success: false, error: 'Zu viele Anfragen von dieser IP-Adresse. Bitte versuchen Sie es in 15 Minuten erneut.' },
            { status: 429 }
        );
    }

    // 2. Parse body
    let body: ContactRequestBody;
    try {
        body = await request.json();
    } catch {
        return json({ success: false, error: 'Ungültiger Request-Body.' }, { status: 400 });
    }

    // 3. Honeypot Check
    if (body.phone_alt) {
        console.warn(`[Security Warning] Honeypot ausgelöst von IP: ${ip}`);
        return json({ success: false, error: 'Spam erkannt. Anfrage abgelehnt.' }, { status: 400 });
    }

    // 4. Validate required fields
    const { firstName, lastName, email, subject, message, privacyAccepted, recipientId } = body;

    const missingFields: string[] = [];
    if (!firstName || firstName.trim() === '') missingFields.push('Vorname');
    if (!lastName || lastName.trim() === '') missingFields.push('Nachname');
    if (!email || email.trim() === '') missingFields.push('E-Mail');
    if (!subject || subject.trim() === '') missingFields.push('Betreff');
    if (!message || message.trim() === '') missingFields.push('Nachricht');
    if (!recipientId || recipientId.trim() === '') missingFields.push('Empfänger (Fachabteilung)');
    if (!privacyAccepted || privacyAccepted === 'false') missingFields.push('Datenschutz akzeptiert');

    if (missingFields.length > 0) {
        return json(
            { success: false, error: `Bitte füllen Sie alle erforderlichen Felder aus: ${missingFields.join(', ')}` },
            { status: 400 }
        );
    }

    // 5. Validate recipient via DB
    let targetEmail: string;
    try {
        const fachabteilung = await prisma.fachabteilung.findUnique({
            where: { id: recipientId! }
        });
        if (!fachabteilung) {
            return json({ success: false, error: 'Der ausgewählte Empfänger ist ungültig.' }, { status: 400 });
        }
        targetEmail = fachabteilung.email;
    } catch (e) {
        console.error('API /contact recipient lookup error:', e);
        return json({ success: false, error: 'Datenbankfehler bei der Empfängerprüfung.' }, { status: 500 });
    }

    // 6. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email!)) {
        return json({ success: false, error: 'Die angegebene E-Mail-Adresse ist ungültig.' }, { status: 400 });
    }

    // 7. Send email, then persist contact (same order: mail first)
    try {
        const contactData: ContactData = {
            firstName: firstName!,
            lastName: lastName!,
            organization: body.organization,
            email: email!,
            phone: body.phone,
            subject: subject!,
            message: message!
        };

        await sendContactEmail(contactData, targetEmail);

        await prisma.contact.create({
            data: {
                firstName: firstName!.trim(),
                lastName: lastName!.trim(),
                organization: body.organization?.trim() || null,
                email: email!.trim(),
                phone: body.phone?.trim() || null,
                subject: subject!.trim(),
                message: message!.trim(),
                privacyAccepted: true,
                targetRecipient: recipientId!
            }
        });

        return json({
            success: true,
            message: 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze.'
        });
    } catch (error) {
        console.error('[Contact API] Fehler beim Mailversand oder Speichern:', error);
        return json(
            { success: false, error: 'Fehler beim Versuch die Nachricht zu versenden. Versuchen Sie es später nochmal.' },
            { status: 500 }
        );
    }
};
