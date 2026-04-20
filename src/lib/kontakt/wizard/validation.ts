import { EMAIL_REGEX } from '$lib/constants';

export const TOTAL_STEPS = 4;

export const STEP_LABELS = [
	'',
	'Schritt 1: Empfänger',
	'Schritt 2: Kontaktdaten',
	'Schritt 3: Nachricht',
	'Schritt 4: Prüfen und absenden'
];

export const stepFields: Record<number, string[]> = {
	1: ['mandant', 'einrichtung', 'recipientId'],
	2: ['firstName', 'lastName', 'email'],
	3: ['subject', 'message']
};

/** Field values used by `validateField` (IDs match DOM `id` / server payload names). */
export type WizardFieldValues = {
	mandantId: string;
	einrichtungId: string;
	recipientId: string;
	firstName: string;
	lastName: string;
	email: string;
	subject: string;
	message: string;
};

export function validateField(fieldId: string, v: WizardFieldValues): boolean {
	switch (fieldId) {
		case 'mandant':
			return v.mandantId.trim() !== '';
		case 'einrichtung':
			return v.einrichtungId.trim() !== '';
		case 'recipientId':
			return v.recipientId.trim() !== '';
		case 'firstName':
			return v.firstName.trim() !== '';
		case 'lastName':
			return v.lastName.trim() !== '';
		case 'email':
			return v.email.trim() !== '' && EMAIL_REGEX.test(v.email.trim());
		case 'subject':
			return v.subject.trim() !== '';
		case 'message':
			return v.message.trim() !== '';
		default:
			return true;
	}
}

export function firstInvalidInStep(step: number, v: WizardFieldValues): string | null {
	for (const id of stepFields[step] ?? []) {
		if (!validateField(id, v)) return id;
	}
	return null;
}
