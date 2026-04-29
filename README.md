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
bun run test:unit
bun run build
```

**End-to-End (Playwright):** Einmal Browser installieren: **`bunx playwright install chromium`**. Tests starten einen Dev-Server auf Port **4199** (überschreibbar mit **`PLAYWRIGHT_PORT`**, Basis-URL mit **`PLAYWRIGHT_BASE_URL`**). Postgres muss laufen; dieselbe **`DATABASE_URL`** wie oben. Empfehlung: **`bun run db:seed`**, damit das Kontaktformular Empfänger hat.

```sh
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" bun run test:e2e
```

Optional: **`E2E_ADMIN_USERNAME`** und **`E2E_ADMIN_PASSWORD`** setzen, dann prüft **`tests/e2e/admin-login.spec.ts`** auch die erfolgreiche Anmeldung (sonst wird dieser Fall übersprungen).

---

## Architektur (Kurzüberblick)

- **`src/routes/`** — SvelteKit-Routen: öffentliches Kontaktformular (`+page`), Admin-Dashboard (`admin/+page` mit serverseitiger Suche/Sortierung/Pagination), Admin-Login, API-Endpunkte unter **`api/`** (Kontaktanfrage, Empfängerbaum, Health).
- **`src/lib/kontakt/`** — Wizard und Formularfelder für das Kontaktformular.
- **`src/lib/admin/`** — Aufgeteilte Admin-UI (Sidebar, Kontakttabelle, Empfänger-Verwaltung, Typen, gemeinsames **`admin.css`**).
- **`src/lib/server/`** — Prisma-Zugriff, Sitzungen, Rate-Limiting, Mailversand, Sicherheits-Helfer.
- **`prisma/`** — Schema und Migrationen (u. a. Kontakte mit **`emailSentAt`** nach erfolgreichem Versand).

---

## Auf den Server deployen

### Frontend wirkt nach Deploy „unverändert“

1. **Richtige URL:** Diese App ist die **eigenständige SvelteKit-Instanz** (typisch eigene Subdomain oder Pfad hinter Nginx). Die **Hauptwebsite** der Stiftung im CMS ist **nicht** automatisch dieselbe Oberfläche wie dieses Kontaktformular.
2. **Deploy prüfen:** Unter GitHub **Actions** muss der Workflow **„Deploy to Server“** nach dem Push auf `main` **erfolgreich** durchlaufen; erst dann liegt der neue `build/` auf dem Server.
3. **Browser-Cache:** Hart neu laden (**Strg+F5**) oder privates Fenster. Wenn **Nginx** (oder ein CDN) **`/`** oder HTML lange cached, können noch alte Seiten- und Chunk-Referenzen erscheinen — für HTML kurzes Caching oder `no-cache` verwenden (die App setzt für HTML zusätzlich restriktive Header).
4. **Erkennbarkeit:** Im gerenderten Markup hat der Seitenrahmen das Attribut **`data-kontakt-chrome="editorial-clean"`**. Am oberen Rand des Headers liegt ein **dünner Farbverlauf** (Stiftungsviolett → Akzent-Türkis).

### PostgreSQL auf dem Server (Produktion)

Damit die Daten **auf deinem Server** bleiben:

1. **Postgres** auf dem VPS betreiben — ab jedem Deploy liegen **`docker-compose.yml`** und **`scripts/db-up.sh`** unter **`/opt/kontaktformular/`** (siehe CI). Einmalig: **`cd /opt/kontaktformular && bash scripts/db-up.sh`** (oder manuell **`docker compose up -d`** / **`podman compose up -d`**). Die Compose-Datei bindet Postgres nur an **127.0.0.1:5432**. **Wichtig:** Standardpasswort **`postgres`** in **`docker-compose.yml`** auf dem Server durch ein **starkes Passwort** ersetzen und **`DATABASE_URL`** entsprechend anpassen.
2. In **`/opt/kontaktformular/.env`**: **`DATABASE_URL`** auf diese Instanz, z. B. **`postgresql://postgres:DEIN_PASS@127.0.0.1:5432/postgres`** (User/Passwort und ggf. TLS nach deinem Setup).
3. Nach dem ersten Deploy: **`prisma migrate deploy`** läuft im CI gegen genau diese URL — Backup-Strategie für das Datenverzeichnis des Postgres-Containers nicht vergessen.

Die App spricht nur **Prisma → Postgres**; es muss **kein** Supabase-Stack auf dem Server laufen, wenn dir ein schlankes Postgres reicht.

### Einmalig: Server vorbereiten

Als **`root`** auf dem VPS ausführen:

1. **Verzeichnis + Node + PM2:**

   ```sh
   mkdir -p /opt/kontaktformular
   # Node.js (LTS) + npm installieren (falls nicht vorhanden), dann:
   npm install -g pm2
   ```

2. **Deploy-User `deploy` anlegen** (App läuft nicht als `root`):

   ```sh
   useradd --create-home --shell /bin/bash deploy
   mkdir -p /home/deploy/.ssh
   cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
   chown -R deploy:deploy /home/deploy/.ssh
   chmod 700 /home/deploy/.ssh
   chmod 600 /home/deploy/.ssh/authorized_keys
   chown -R deploy:deploy /opt/kontaktformular
   usermod -aG docker deploy 2>/dev/null || true
   ```

3. **PM2 beim Booten automatisch starten** (als `deploy`):

   ```sh
   su - deploy -c "pm2 startup" 2>&1 | grep "sudo" | bash
   ```

   Das erzeugt einen systemd-Service, der PM2 als `deploy` bei jedem Server-Reboot startet.

### Secrets auf dem Server (wichtig)

Secrets gehören **nicht** in eine welt-lesbare `.env` im App-Verzeichnis — und niemals in Git.

1. **Env-Datei anlegen** (als `root`):

   ```sh
   touch /etc/kontaktformular.env
   chmod 600 /etc/kontaktformular.env
   chown deploy:deploy /etc/kontaktformular.env
   ```

2. **Inhalt** (echte Werte, keine Platzhalter):

   ```env
   PORT=3000
   DATABASE_URL=postgresql://postgres:STARKES_PASSWORT@127.0.0.1:5432/postgres
   SMTP_HOST=smtp.dein-anbieter.de
   SMTP_PORT=587
   SMTP_USER=kontakt@firma.de
   SMTP_PASS=APP_PASSWORT
   ALLOWED_ORIGIN=https://www.firma.de
   ```

   **Keine** `ADMIN_USER`/`ADMIN_PASS` — Admin-Zugänge stattdessen über **`bun run create-admin`** in der DB anlegen (siehe [Admin & Sitzungen](#admin--sitzungen)).

3. **PM2** nutzt diese Datei über **`ecosystem.config.cjs`** (wird per CI mit deployt). Die App liest `process.env` — keine separate `.env` im App-Ordner nötig.

4. **Kein `/opt/kontaktformular/.env` in Produktion.** Falls noch eine alte existiert: löschen, nachdem `/etc/kontaktformular.env` korrekt gesetzt ist.

5. **App starten / neu starten:**

   ```sh
   su - deploy -c "cd /opt/kontaktformular && pm2 start ecosystem.config.cjs && pm2 save --force"
   ```

   Falls Port 3000 belegt ist (z. B. alte Root-PM2-Instanz): erst **`pm2 kill`** als `root`, dann den Befehl oben als `deploy`.

### Einmalig: GitHub

Im Repo unter **Settings → Secrets and variables → Actions** drei Secrets setzen:

| Secret | Inhalt |
|--------|--------|
| **`DEPLOY_HOST`** | Hostname oder IP des Servers |
| **`DEPLOY_USER`** | **`deploy`** (nicht `root`) |
| **`DEPLOY_SSH_KEY`** | Privater SSH-Key (komplett inkl. `BEGIN`/`END`), passend zum öffentlichen Key in **`/home/deploy/.ssh/authorized_keys`** |

Der User `deploy` braucht SSH-Zugang und Schreibrechte unter **`/opt/kontaktformular`**.

### Bei jedem Deploy

```text
git push origin main
```

Der Workflow baut in GitHub Actions, kopiert per **rsync/scp** nach **`/opt/kontaktformular`** (`build/`, `prisma/`, `package.json`, `prisma.config.ts`, `ecosystem.config.cjs`, **`docker-compose.yml`**, **`scripts/`**), führt auf dem Server **`prisma migrate deploy`**, **`npm install --omit=dev --ignore-scripts`** aus und startet die App mit **PM2** neu über **`ecosystem.config.cjs`** (liest Secrets aus **`/etc/kontaktformular.env`**, nicht aus einer `.env` im App-Ordner).

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

## Server-Umzug (auf neuen VPS)

Domain bleibt gleich, nur die IP ändert sich. Im Repo ändert sich **nichts** — nur GitHub Secrets und Server-Setup.

### Phase 1: Neuen VPS vorbereiten (als `root`)

```sh
# 1. Basis
apt update && apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs docker.io docker-compose-plugin
npm install -g pm2

# 2. deploy-User
useradd --create-home --shell /bin/bash deploy
mkdir -p /home/deploy/.ssh
# Eigenen öffentlichen Key eintragen (oder vom alten Server kopieren):
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
mkdir -p /opt/kontaktformular
chown -R deploy:deploy /opt/kontaktformular
usermod -aG docker deploy

# 3. PM2 Autostart
su - deploy -c "pm2 startup" 2>&1 | grep "sudo" | bash

# 4. Firewall (ufw-Beispiel)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Phase 2: Secrets + Postgres

```sh
# Env-Datei (als root)
touch /etc/kontaktformular.env
chmod 600 /etc/kontaktformular.env
chown deploy:deploy /etc/kontaktformular.env
nano /etc/kontaktformular.env
```

Inhalt — **echte Werte**, neues starkes DB-Passwort:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:NEUES_STARKES_PASSWORT@127.0.0.1:5432/postgres
SMTP_HOST=smtp.dein-anbieter.de
SMTP_PORT=587
SMTP_USER=kontakt@firma.de
SMTP_PASS=APP_PASSWORT
ALLOWED_ORIGIN=https://www.firma.de
```

Postgres starten (vorab `docker-compose.yml` nach `/opt/kontaktformular/` kopieren, **Passwort** dort ebenfalls anpassen):

```sh
cd /opt/kontaktformular && docker compose up -d
```

### Phase 3: Daten migrieren

Einzige zustandsbehaftete Komponente ist **Postgres**. Alles andere kommt per CI.

```sh
# Alter Server:
docker exec kontaktformular-db-1 pg_dump -U postgres -d postgres -F c > /tmp/kontaktformular.dump
scp /tmp/kontaktformular.dump root@NEUE_IP:/tmp/

# Neuer Server:
docker cp /tmp/kontaktformular.dump kontaktformular-db-1:/tmp/
docker exec kontaktformular-db-1 pg_restore -U postgres -d postgres --clean --if-exists /tmp/kontaktformular.dump
```

Prüfen: `prisma migrate status` auf dem neuen Server — sollte keine offenen Migrationen zeigen.

### Phase 4: GitHub Secrets umstellen + Deploy

In **GitHub → Settings → Secrets → Actions**:

| Secret | Aktion |
|--------|--------|
| **`DEPLOY_HOST`** | Auf **neue IP** ändern |
| **`DEPLOY_USER`** | **`deploy`** (bleibt gleich) |
| **`DEPLOY_SSH_KEY`** | Neuen Key eintragen, falls anderer Key; sonst bleibt er gleich |

Dann **`git push origin main`** — CI deployt auf den neuen Server. Test: `curl http://NEUE_IP:3000/api/health`.

### Phase 5: DNS + TLS

1. **TTL** beim DNS-Provider vorher auf **300 s** (5 Min) senken.
2. **A-Record** der Domain auf die **neue IP** ändern.
3. **TLS** einrichten (z. B. Caddy mit Auto-HTTPS oder Certbot + Nginx) — erst möglich, wenn DNS auf die neue IP zeigt.
4. **Reverse Proxy** konfigurieren: HTTPS → `127.0.0.1:3000`.

### Phase 6: Alten Server abschalten

1. Seite auf neuem Server prüfen: Formular absenden, Admin-Login, E-Mail-Versand.
2. Auf dem alten Server: `pm2 kill`, `docker compose down`. Optional: letzten Dump für Archiv sichern.
3. Alten VPS kündigen (wenn nichts anderes darauf läuft).

**Achtung Daten-Drift:** Zwischen Dump und DNS-Switch können noch Anfragen auf dem alten Server eingehen — kurz vor der Umstellung nochmal dumpen oder den alten Server vorher offline nehmen.

**Achtung SMTP:** Prüfen ob der neue Hoster ausgehend Port 587 erlaubt (manche blockieren SMTP standardmäßig).

---

## Admin & Sitzungen

- **`bun run create-admin <user> <pass> ["Anzeigename"]`** — legt `AdminUser` an (bcrypt-Hash in der DB). **Empfohlen für Produktion** — kein Klartext-Passwort in Umgebungsvariablen nötig.
- Login erfolgt **ausschließlich** über **`AdminUser`** in der DB (bcrypt). Es gibt keine Klartext-Admin-Variablen mehr in der `.env`.
- Sitzungen: Tabelle **`AdminSession`** (überleben PM2-Neustarts). Nach DB-Wechsel: neu einloggen.

Weitere Variablen: **`.env.example`**.
