/**
 * Legt Demo-Mandant → Einrichtung → Fachabteilungen an, damit das Kontaktformular
 * Dropdowns und Mail-Ziele hat. Überspringt, wenn schon Mandanten existieren.
 */
import 'dotenv/config';
import { prisma } from '../src/lib/server/prisma.ts';

const main = async () => {
    const n = await prisma.mandant.count();
    if (n > 0) {
        console.log(`Übersprungen: es gibt bereits ${n} Mandant(en).`);
        return;
    }

    await prisma.mandant.create({
        data: {
            name: 'Demo-Mandant (Beispiel)',
            einrichtungen: {
                create: [
                    {
                        name: 'Einrichtung Musterstadt',
                        abteilungen: {
                            create: [
                                {
                                    name: 'Pflegedienst',
                                    email: 'pflege@example.com'
                                },
                                {
                                    name: 'Verwaltung',
                                    email: 'verwaltung@example.com'
                                }
                            ]
                        }
                    },
                    {
                        name: 'Einrichtung Beispielhausen',
                        abteilungen: {
                            create: [
                                {
                                    name: 'Zentrale Anfragen',
                                    email: 'anfragen@example.com'
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('Demo-Routing angelegt: 1 Mandant, 2 Einrichtungen, 3 Fachabteilungen.');
    console.log('E-Mails sind Platzhalter — im Admin anpassen oder neue Einträge anlegen.');
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
