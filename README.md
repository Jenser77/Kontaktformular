# Kontaktformular

[![CI](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml/badge.svg)](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml)

SvelteKit, Prisma, PostgreSQL, Nodemailer; auf dem Server läuft der Build mit PM2.

---

## Lokal entwickeln

1. **`cp .env.example .env`** und **`DATABASE_URL`** setzen (siehe unten).
2. **`bun install`**
3. **`bun run db:up`** — startet Postgres (bevorzugt **Podman** Compose; sonst Docker).
4. **`bun run db:deploy`** — legt Tabellen an (Migrationen).
5. **`bun run db:seed`** — Demo-Mandanten/Einrichtungen/Fachabteilungen (nur wenn noch leer).
6. **`bun run dev`**

**Fedora + Podman:** Falls Compose die API nicht findet, einmal **`systemctl --user enable --now podman.socket`** — **`db:up`** versucht das mit. Ohne lokalen Postgres: **`DATABASE_URL`** auf **Supabase**, dann nur **`db:deploy`**.

**Datenbank — genau eine Variante:**

| Variante | `DATABASE_URL` |
|----------|----------------|
| **Container** (`bun run db:up`) | `postgresql://postgres:postgres@localhost:5432/postgres` |
| **Supabase** | URI aus Dashboard (Direct, Port 5432), mit `?sslmode=require` — Details unter [Supabase](#supabase-postgresql-in-der-cloud) |

Hilfe: `bun run db:status` · neues Migrationsskript: `bun run db:dev`

---

## Code-Qualität

```sh
bun run lint
bun run check
bun run build
```

---

## Auf den Server deployen

### Einmalig: Server vorbereiten

- Verzeichnis **`/opt/kontaktformular`** anlegen (Schreibrechte für den Deploy-User).
- **Node.js** (LTS) und **npm** installieren; global **`pm2`**: `npm install -g pm2` (damit `pm2 start` im SSH-Befehl funktioniert).
- Datei **`/opt/kontaktformular/.env`** anlegen — Inhalt wie **`.env.example`**, aber mit echten Werten: **`DATABASE_URL`** (z. B. Supabase), **SMTP**, **`ADMIN_*`**, ggf. **`PORT`**. Diese Datei wird **nicht** per Git ausgeliefert und **nicht** von rsync überschrieben.

### Einmalig: GitHub

Im Repo unter **Settings → Secrets and variables → Actions** drei Secrets setzen:

| Secret | Inhalt |
|--------|--------|
| **`DEPLOY_HOST`** | Hostname oder IP des Servers |
| **`DEPLOY_USER`** | SSH-Login-User (z. B. `deploy`) |
| **`DEPLOY_SSH_KEY`** | Privater SSH-Key (kompletter Inkl. `BEGIN`/`END`), passend zum öffentlichen Key in **`~/.ssh/authorized_keys`** dieses Users |

Der User braucht SSH-Zugang und Schreibrechte unter **`/opt/kontaktformular`**.

### Bei jedem Deploy

```text
git push origin main
```

Der Workflow baut in GitHub Actions, kopiert per **rsync** nach **`/opt/kontaktformular`** (`build/`, `prisma/`, `package.json`, `prisma.config.ts`), führt auf dem Server **`prisma migrate deploy`**, **`npm install --omit=dev --ignore-scripts`** aus und startet die App mit **PM2** neu (**`kontaktformular`**, Script **`build/index.js`**). Die laufende Konfiguration kommt ausschließlich aus der Server-**`.env`**.

**Ohne GitHub:** lokal **`bun run build`**, dann `build/`, `prisma/`, `package.json`, `prisma.config.ts` manuell auf den Server legen und auf dem Server dieselben Befehle wie im Workflow ausführen (migrate, npm install, pm2).

---

## Supabase (PostgreSQL in der Cloud)

Kein Extra-Paket auf dem Server — nur **`DATABASE_URL`**.

1. [supabase.com](https://supabase.com) → neues Projekt → **Database password** notieren.
2. **Settings → Database → Connection string → URI → Direct** (`db.….supabase.co`, Port **5432**).
3. `[YOUR-PASSWORD]` ersetzen; bei Bedarf **`?sslmode=require`** anhängen.  
   [Supabase + Prisma](https://supabase.com/docs/guides/database/prisma)

**Produktion:** dieselbe URI in **`/opt/kontaktformular/.env`**, dann deployen (Migration läuft im CI mit).

**IPv4:** Erreicht der Server Supabase nicht, ggf. [IPv4 Add-on](https://supabase.com/docs/guides/platform/ipv4-address) oder Pooler (6543) laut Supabase-Doku.

**Alte DB:** Inhalte separat migrieren (`pg_dump` / manuell); Schema kommt von Prisma.

---

## Admin & Sitzungen

- **`bun run create-admin <user> <pass> ["Anzeigename"]`** — legt `AdminUser` an (lokal mit passender `DATABASE_URL` auch gegen Supabase möglich).
- Login-Reihenfolge: **`ADMIN_USER` / `ADMIN_PASS`** → **`ADMIN_USERS`** → **`AdminUser`** in der DB.
- Sitzungen: Tabelle **`AdminSession`** (überleben PM2-Neustarts). Nach DB-Wechsel: neu einloggen.

Weitere Variablen: **`.env.example`**.
