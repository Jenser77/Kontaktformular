# Kontaktformular

[![CI](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml/badge.svg)](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml)

Kontaktformular-Anwendung mit Admin-Dashboard, gebaut mit SvelteKit, Prisma und PostgreSQL.

## Stack

- **SvelteKit 2** + Svelte 5 (adapter-node)
- **Prisma 7** mit PostgreSQL
- **Nodemailer** für E-Mail-Versand
- **PM2** für Prozessverwaltung auf dem Server

## Entwicklung

```sh
bun install
bun run dev
```

## Code-Qualität

```sh
bun run lint      # ESLint
bun run check     # TypeScript + svelte-check
bun run build     # Produktions-Build
```

## CI/CD

Bei jedem Push zu `main` läuft automatisch:

1. **Lint** — ESLint mit Svelte- und TypeScript-Regeln
2. **Type Check** — svelte-check + TypeScript
3. **Build** — Produktions-Build
4. **Deploy** — `build/` und `prisma/` per rsync, `prisma migrate deploy`, `npm install`, PM2 restart (`DATABASE_URL` muss auf dem Server in `.env` o. Ä. stehen)

## Umgebungsvariablen

Siehe `.env.example` für alle benötigten Variablen.

## Datenbank & Migrationen

Nach Schema-Änderungen:

```sh
bunx prisma migrate deploy   # Produktion / Server
bunx prisma migrate dev      # lokal (entwickelt neue Migration)
```

## PostgreSQL bei Supabase

1. Im Supabase-Dashboard unter **Project Settings → Database** den **Connection string** (URI) kopieren und als `DATABASE_URL` setzen.
2. Für `prisma migrate deploy` die **direkte** Postgres-Verbindung nutzen (nicht zwingend den Transaction-Pooler); siehe [Supabase: Prisma](https://supabase.com/docs/guides/database/prisma).
3. Migrationen ausführen (Abschnitt oben).

**Admin-Login:** Sitzungen liegen in der Tabelle `AdminSession` — sie **überleben PM2-Neustarts** und können von mehreren App-Instanzen genutzt werden. Nach DB-Wechsel oder frischer Migration: neu anmelden.
