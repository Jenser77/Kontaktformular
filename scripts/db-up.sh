#!/usr/bin/env bash
# Startet Postgres aus docker-compose.yml — bevorzugt Podman (Fedora), sonst Docker.
set -euo pipefail
cd "$(dirname "$0")/.."

ensure_podman_socket() {
	local sock="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman/podman.sock"
	if [[ -S "$sock" ]]; then
		return 0
	fi
	# Rootless-Fedora: API-Socket oft aus — einmal User-Service aktivieren
	if systemctl --user enable --now podman.socket >/dev/null 2>&1; then
		sleep 1
	fi
	[[ -S "$sock" ]]
}

run_compose() {
	# Podman zuerst (typisch Fedora/Linux rootless)
	if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
		ensure_podman_socket || true
		if podman compose up -d; then
			return 0
		fi
	fi
	if docker compose version >/dev/null 2>&1; then
		docker compose up -d
		return 0
	fi
	return 1
}

if run_compose; then
	echo "Warte auf Postgres (Port 5432) …"
	for _ in $(seq 1 30); do
		if (echo >/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
			break
		fi
		sleep 1
	done
	echo "Postgres läuft. DATABASE_URL in .env z. B.:"
	echo "  postgresql://postgres:postgres@localhost:5432/postgres"
	echo "Dann: bun run db:deploy && bun run db:seed && bun run dev"
	exit 0
fi

echo "Konnte weder »podman compose« noch »docker compose« starten." >&2
echo >&2
echo "Fedora / Podman:" >&2
echo "  systemctl --user enable --now podman.socket" >&2
echo "  podman compose up -d" >&2
echo "  Fehlt qemu (nur für »podman machine« auf manchen Setups): sudo dnf install qemu-img qemu-system-x86-core" >&2
echo >&2
echo "Docker:" >&2
echo "  sudo systemctl enable --now docker && docker compose up -d" >&2
echo >&2
echo "Ohne lokalen Postgres: DATABASE_URL auf Supabase, dann bun run db:deploy" >&2
exit 1
