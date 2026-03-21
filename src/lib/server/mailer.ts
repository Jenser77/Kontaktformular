import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private';

export interface ContactData {
    firstName: string;
    lastName: string;
    organization?: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createTransporter(): Transporter {
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587', 10),
        secure: SMTP_PORT === '465',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
}

export async function sendContactEmail(contactData: ContactData, targetEmail: string): Promise<void> {
    const transporter = createTransporter();

    const organizationLine = contactData.organization
        ? `<strong>Einrichtung/Organisation:</strong> ${escapeHtml(contactData.organization)}<br>`
        : '';
    const phoneLine = contactData.phone
        ? `<strong>Telefonnummer:</strong> ${escapeHtml(contactData.phone)}<br>`
        : '';

    const htmlBody = `
		<h2>Neue Kontaktanfrage über das Diakoniestiftung Portal</h2>
		<p>
			<strong>Name:</strong> ${escapeHtml(contactData.firstName)} ${escapeHtml(contactData.lastName)}<br>
			<strong>E-Mail:</strong> ${escapeHtml(contactData.email)}<br>
			${organizationLine}
			${phoneLine}
			<strong>Betreff:</strong> ${escapeHtml(contactData.subject)}
		</p>
		<hr>
		<h3>Nachricht:</h3>
		<p>${escapeHtml(contactData.message).replace(/\n/g, '<br>')}</p>
		<hr>
		<p><small>Der Benutzer hat die Datenschutzbestimmungen akzeptiert.</small></p>
	`;

    const textBody = `Neue Kontaktanfrage über das Diakoniestiftung Portal

Name: ${contactData.firstName} ${contactData.lastName}
E-Mail: ${contactData.email}
${contactData.organization ? `Einrichtung/Organisation: ${contactData.organization}\n` : ''}${contactData.phone ? `Telefonnummer: ${contactData.phone}\n` : ''}Betreff: ${contactData.subject}

Nachricht:
${contactData.message}

Der Benutzer hat die Datenschutzbestimmungen akzeptiert.`;

    await transporter.sendMail({
        from: `"Kontaktformular Portal" <${SMTP_USER}>`,
        to: targetEmail,
        replyTo: contactData.email,
        subject: `Neue Anfrage Portal: ${contactData.subject}`,
        text: textBody,
        html: htmlBody
    });
}
