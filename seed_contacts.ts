import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get a valid Fachabteilung ID for the targetRecipient field
    const abteilung = await prisma.fachabteilung.findFirst();

    await prisma.contact.createMany({
        data: [
            {
                firstName: 'Maria',
                lastName: 'Mustermann',
                organization: 'Pflegezentrum Leipzig GmbH',
                email: 'maria.mustermann@beispiel.de',
                phone: '0341 123456',
                subject: 'Anfrage zur stationären Pflege',
                message: 'Sehr geehrte Damen und Herren,\n\nich interessiere mich für einen Platz in Ihrer Einrichtung für meine Mutter. Könnten Sie mir bitte weitere Informationen zukommen lassen?\n\nMit freundlichen Grüßen,\nMaria Mustermann',
                privacyAccepted: true,
                targetRecipient: abteilung?.id ?? null,
            },
            {
                firstName: 'Klaus',
                lastName: 'Berger',
                organization: null,
                email: 'k.berger@email.de',
                phone: null,
                subject: 'Frage zur ambulanten Betreuung',
                message: 'Guten Tag,\n\nich suche nach einer ambulanten Betreuungsmöglichkeit für meinen Vater. Welche Leistungen bieten Sie an und was sind die ungefähren Kosten?\n\nVielen Dank im Voraus.',
                privacyAccepted: true,
                targetRecipient: abteilung?.id ?? null,
            },
            {
                firstName: 'Sandra',
                lastName: 'Hoffmann',
                organization: 'Wohlfahrtsverband e.V.',
                email: 'sandra.hoffmann@wv.org',
                phone: '030 9876543',
                subject: 'Kooperationsanfrage',
                message: 'Sehr geehrte Damen und Herren,\n\nwir sind ein gemeinnütziger Verband und suchen nach Kooperationsmöglichkeiten im Bereich der Seniorenbetreuung. Über ein Gespräch würden wir uns sehr freuen.\n\nFreundliche Grüße,\nSandra Hoffmann',
                privacyAccepted: true,
                targetRecipient: abteilung?.id ?? null,
            },
        ]
    });

    console.log('✅ 3 Dummy-Kontaktanfragen erfolgreich angelegt!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
