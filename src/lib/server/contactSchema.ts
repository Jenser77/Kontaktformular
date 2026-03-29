import { z } from 'zod';

function trimmedNonEmpty(fieldLabel: string, max: number) {
    return z
        .string()
        .max(max)
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, { message: `${fieldLabel} ist erforderlich.` });
}

function optionalTrimmed(max: number) {
    return z
        .string()
        .max(max)
        .optional()
        .transform((s) => {
            if (s === undefined) return undefined;
            const t = s.trim();
            return t === '' ? undefined : t;
        });
}

export const contactRequestSchema = z.object({
    firstName: trimmedNonEmpty('Vorname', 200),
    lastName: trimmedNonEmpty('Nachname', 200),
    organization: optionalTrimmed(500),
    email: z
        .string()
        .max(320)
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, { message: 'E-Mail ist erforderlich.' })
        .refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), { message: 'Ungültige E-Mail-Adresse.' }),
    phone: optionalTrimmed(80),
    subject: trimmedNonEmpty('Betreff', 500),
    message: trimmedNonEmpty('Nachricht', 20_000),
    privacyAccepted: z.union([z.boolean(), z.literal('true'), z.literal('false')]).transform((v) => v === true || v === 'true'),
    recipientId: z.string().uuid({ message: 'Ungültiger Empfänger.' })
});

export type ContactRequestParsed = z.infer<typeof contactRequestSchema>;
