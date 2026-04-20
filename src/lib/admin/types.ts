export interface ContactView {
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
	recipientLabel: string | null;
	createdAt: string;
}

export interface FachabteilungView {
	id: string;
	name: string;
	email: string;
	einrichtungId: string;
	createdAt: string;
}

export interface EinrichtungView {
	id: string;
	name: string;
	mandantId: string;
	abteilungen: FachabteilungView[];
	createdAt: string;
}

export interface MandantView {
	id: string;
	name: string;
	einrichtungen: EinrichtungView[];
	createdAt: string;
}
