# Kontaktformular

[![CI](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml/badge.svg)](https://github.com/Jenser77/Kontaktformular/actions/workflows/ci.yml)

SvelteKit, Prisma, PostgreSQL, Nodemailer; auf dem Server läuft der Build mit PM2.

**Datenhaltung:** In der **Produktion** soll **`DATABASE_URL`** auf **PostgreSQL auf deinem eigenen Server** zeigen (oder im gleichen Rechenzentrum) — die Daten liegen dann **nicht** bei einem SaaS-Anbieter. **Supabase Cloud** ist nur eine **optionale** Alternative; lokal kannst du **`npx supabase start`** oder **`bun run db:up`** nutzen.

---

## Lokal entwickeln

1. **`cp .env.example .env`** und **`DATABASE_URL`** setzen (siehe unten).
2. **`bun install`**
3. **Postgres starten** — empfohlen: **`npx supabase start`** (lokaler Supabase-Stack inkl. Studio; siehe [unten](#supabase-lokal-cli--docker)). Alternative ohne Supabase: **`bun run db:up`** (nur Postgres via Compose, bevorzugt **Podman**).
4. **`bun run db:deploy`** — legt Tabellen an (Migrationen).
5. **`bun run db:seed`** — Demo-Mandanten/Einrichtungen/Fachabteilungen (nur wenn noch leer).
6. **`bun run dev`**

**Fedora + Podman:** Für **`supabase start`** / Compose brauchst du laufendes **Docker** oder **Podman** mit Compose. Bei **`db:up`**: falls die API fehlt, **`systemctl --user enable --now podman.socket`**.

**Datenbank — genau eine Variante aktiv:**

| Variante | `DATABASE_URL` |
|----------|----------------|
| **Produktion (eigener Server)** | Postgres auf dem VPS, z. B. `postgresql://USER:PASS@127.0.0.1:5432/postgres` — siehe [unten](#postgresql-auf-dem-server-produktion) |
| **Supabase lokal** (CLI, Dev) | `postgresql://postgres:postgres@127.0.0.1:55322/postgres` — [Abschnitt](#supabase-lokal-cli--docker) |
| **Nur Postgres lokal** (`bun run db:up`) | `postgresql://postgres:postgres@localhost:5432/postgres` |
| **Supabase Cloud** (optional, Daten bei Supabase) | [Abschnitt](#supabase-postgresql-in-der-cloud-optional) |

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

### PostgreSQL auf dem Server (Produktion)

Damit die Daten **auf deinem Server** bleiben:

1. **Postgres** auf dem VPS betreiben — ab jedem Deploy liegen **`docker-compose.yml`** und **`scripts/db-up.sh`** unter **`/opt/kontaktformular/`** (siehe CI). Einmalig: **`cd /opt/kontaktformular && bash scripts/db-up.sh`** (oder manuell **`docker compose up -d`** / **`podman compose up -d`**). Die Compose-Datei bindet Postgres nur an **127.0.0.1:5432**. **Wichtig:** Standardpasswort **`postgres`** in **`docker-compose.yml`** auf dem Server durch ein **starkes Passwort** ersetzen und **`DATABASE_URL`** entsprechend anpassen.
2. In **`/opt/kontaktformular/.env`**: **`DATABASE_URL`** auf diese Instanz, z. B. **`postgresql://postgres:DEIN_PASS@127.0.0.1:5432/postgres`** (User/Passwort und ggf. TLS nach deinem Setup).
3. Nach dem ersten Deploy: **`prisma migrate deploy`** läuft im CI gegen genau diese URL — Backup-Strategie für das Datenverzeichnis des Postgres-Containers nicht vergessen.

Die App spricht nur **Prisma → Postgres**; es muss **kein** Supabase-Stack auf dem Server laufen, wenn dir ein schlankes Postgres reicht.

### Einmalig: Server vorbereiten

- Verzeichnis **`/opt/kontaktformular`** anlegen (Schreibrechte für den Deploy-User).
- **Node.js** (LTS) und **npm** installieren; global **`pm2`**: `npm install -g pm2` (damit `pm2 start` im SSH-Befehl funktioniert).
- Datei **`/opt/kontaktformular/.env`** anlegen — Inhalt wie **`.env.example`**, aber mit echten Werten: **`DATABASE_URL`** (Postgres **auf dem Server**, siehe oben), **SMTP**, **`ADMIN_*`**, ggf. **`PORT`**. Diese Datei wird **nicht** per Git ausgeliefert und **nicht** von rsync überschrieben.

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

Der Workflow baut in GitHub Actions, kopiert per **rsync/scp** nach **`/opt/kontaktformular`** (`build/`, `prisma/`, `package.json`, `prisma.config.ts`, **`docker-compose.yml`**, **`scripts/`**), führt auf dem Server **`prisma migrate deploy`**, **`npm install --omit=dev --ignore-scripts`** aus und startet die App mit **PM2** neu (**`kontaktformular`**, Script **`build/index.js`**). Die laufende Konfiguration kommt ausschließlich aus der Server-**`.env`** (wird nicht überschrieben).

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

## Supabase (PostgreSQL in der Cloud, optional)

**Nur wenn du bewusst willst**, dass die Datenbank bei **Supabase** (Cloud) liegt — nicht für „Daten nur auf eigenem Server“.

Kein Extra-Paket auf dem Server — nur **`DATABASE_URL`** auf die gehostete DB.

1. [supabase.com](https://supabase.com) → neues Projekt → **Database password** notieren.
2. **Settings → Database → Connection string → URI → Direct** (`db.….supabase.co`, Port **5432**).
3. `[YOUR-PASSWORD]` ersetzen; bei Bedarf **`?sslmode=require`** anhängen.  
   [Supabase + Prisma](https://supabase.com/docs/guides/database/prisma)

**Produktion:** dieselbe URI in **`/opt/kontaktformular/.env`**, dann deployen (Migration läuft im CI mit).

**IPv4:** Erreicht der Server Supabase nicht, ggf. [IPv4 Add-on](https://supabase.com/docs/guides/platform/ipv4-address) oder Pooler (6543) laut Supabase-Doku.

**Alte DB:** Inhalte separat migrieren (`pg_dump` / manuell); Schema kommt von Prisma.

---

## Admin & Sitzungen

- **`bun run create-admin <user> <pass> ["Anzeigename"]`** — legt `AdminUser` an (gegen jede erreichbare Postgres-URL aus **`DATABASE_URL`**).
- Login-Reihenfolge: **`ADMIN_USER` / `ADMIN_PASS`** → **`ADMIN_USERS`** → **`AdminUser`** in der DB.
- Sitzungen: Tabelle **`AdminSession`** (überleben PM2-Neustarts). Nach DB-Wechsel: neu einloggen.

Weitere Variablen: **`.env.example`**.
