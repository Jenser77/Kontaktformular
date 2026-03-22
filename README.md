# Kontaktformular

[![CI](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml/badge.svg)](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml)

SvelteKit, Prisma, PostgreSQL, Nodemailer; auf dem Server läuft der Build mit PM2.

---

## Lokal entwickeln

1. **`cp .env.example .env`** und **`DATABASE_URL`** setzen (siehe unten).
2. **`bun install`**
3. **Postgres starten** — empfohlen: **`npx supabase start`** (lokaler Supabase-Stack inkl. Studio; siehe [unten](#supabase-lokal-cli--docker)). Alternative ohne Supabase: **`bun run db:up`** (nur Postgres via Compose, bevorzugt **Podman**).
4. **`bun run db:deploy`** — legt Tabellen an (Migrationen).
5. **`bun run db:seed`** — Demo-Mandanten/Einrichtungen/Fachabteilungen (nur wenn noch leer).
6. **`bun run dev`**

**Fedora + Podman:** Für **`supabase start`** / Compose brauchst du laufendes **Docker** oder **Podman** mit Compose. Bei **`db:up`**: falls die API fehlt, **`systemctl --user enable --now podman.socket`**.

**Datenbank — genau eine Variante:**

| Variante | `DATABASE_URL` |
|----------|----------------|
| **Supabase lokal** (CLI, empfohlen) | `postgresql://postgres:postgres@127.0.0.1:55322/postgres` — siehe [unten](#supabase-lokal-cli--docker) |
| **Nur Postgres** (`bun run db:up`) | `postgresql://postgres:postgres@localhost:5432/postgres` |
| **Supabase Cloud** | URI aus Dashboard (Direct, Port 5432), mit `?sslmode=require` — [Abschnitt](#supabase-postgresql-in-der-cloud) |

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

### Startseite wirkt „ungestyled“ (nur HTML)

Die Seite lädt **`/design-new.css`**, **`/script.js`** usw. aus **`build/client/`** über dieselbe Node-App. Wenn **Caddy/Nginx** die Startseite aus einem **statischen Verzeichnis** ausliefert, die Anfragen für **CSS/JS** aber **nicht** an den Node-Prozess weiterreichen, fehlen die Styles.

**Lösung:** Alle Pfade (mindestens `/`, `/_app/*`, `/*.css`, `/*.js`, Bilder) per **`reverse_proxy`** an die App (z. B. `127.0.0.1:3000`) — oder statische Assets identisch unter dem Webroot bereitstellen.

**PM2:** App mit **`cwd /opt/kontaktformular`** und **`node build/index.js`** (oder `build/index.js` als Skript) starten; der Code findet `build/client/index.html` auch ohne `static/` auf dem Server.

---

## Supabase lokal (CLI + Docker)

Damit läuft bei dir **Postgres + Studio** wie bei Supabase in der Cloud, aber auf **127.0.0.1**. In **`supabase/config.toml`** nutzt dieses Repo **55320–55329** statt der CLI-Defaults **54320–54329**, damit es nicht mit einem **zweiten** lokalen Supabase-Projekt kollidiert; **`docker compose`** bleibt auf **5432**.

1. **Docker** oder **Podman** installiert und laufend.
2. **Supabase CLI** installieren — siehe [Install](https://supabase.com/docs/guides/cli/getting-started).
3. Im Projektroot (einmalig):

   ```sh
   npx supabase init
   ```

4. Stack starten:

   ```sh
   npx supabase start
   ```

   Am Ende zeigt die CLI u. a. die **DB-URL**. Standard für Prisma lokal:

   `postgresql://postgres:postgres@127.0.0.1:55322/postgres`

   Falls Prisma meckert, anhängen: **`?sslmode=disable`**

5. In **`.env`** diese URL als **`DATABASE_URL`** setzen, dann:

   ```sh
   bun run db:deploy
   bun run db:seed
   bun run dev
   ```

6. Stoppen: **`npx supabase stop`**

**Hinweis:** `supabase/` nach **`supabase init`** kannst du committen (Konfiguration). Secrets landen nicht in Git. Die **lokale DB** ist nur auf deinem Rechner.

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
