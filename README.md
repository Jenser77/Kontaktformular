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
4. **Deploy** — rsync zum Server, npm install, PM2 restart

## Umgebungsvariablen

Siehe `.env.example` für alle benötigten Variablen.
