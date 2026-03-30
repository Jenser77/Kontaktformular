import { describe, expect, it } from 'vitest';
import { contactRequestSchema } from '$lib/server/contactSchema';

const validPayload = {
    firstName: 'Max',
    lastName: 'Mustermann',
    organization: 'Firma',
    email: 'max@example.org',
    phone: '+49 123 456',
    subject: 'Test',
    message: 'Hallo Welt',
    privacyAccepted: true,
    recipientId: '11111111-1111-4111-8111-111111111111'
};

describe('contactRequestSchema', () => {
    it('accepts valid payloads', () => {
        const parsed = contactRequestSchema.safeParse(validPayload);
        expect(parsed.success).toBe(true);
    });

    it('rejects invalid email', () => {
        const parsed = contactRequestSchema.safeParse({
            ...validPayload,
            email: 'bad-email'
        });
        expect(parsed.success).toBe(false);
    });

    it('parses false privacy consent for server-side rejection logic', () => {
        const parsed = contactRequestSchema.safeParse({
            ...validPayload,
            privacyAccepted: false
        });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.privacyAccepted).toBe(false);
        }
    });
});
