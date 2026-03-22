/**
 * Legt einen Admin-Benutzer in der Datenbank an oder aktualisiert Passwort/Anzeigenamen.
 *
 * Usage:
 *   bun run create-admin <username> <password> [displayName]
 *   (oder: npx tsx scripts/create-admin.ts …)
 *
 * Der Benutzername wird kleingeschrieben gespeichert.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/server/prisma.ts';

const [, , u, p, d] = process.argv;

if (!u || !p) {
    console.error('Usage: bun run create-admin <username> <password> [displayName]');
    process.exit(1);
}

const username = u.trim().toLowerCase();
const password = p;
const displayName = d?.trim() || null;

const passwordHash = await bcrypt.hash(password, 10);

await prisma.adminUser.upsert({
    where: { username },
    create: { username, displayName, passwordHash },
    update: { displayName, passwordHash }
});

console.log(`Admin-Benutzer "${username}" gespeichert.`);

await prisma.$disconnect();
