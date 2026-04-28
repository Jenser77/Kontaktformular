export function normalizeAdminUsername(usernameRaw: string): string {
	return usernameRaw.trim().toLowerCase();
}

export function isValidAdminUsername(username: string): boolean {
	return /^[a-z0-9._-]{3,64}$/.test(username);
}

export function validateDisableTarget(
	actorUsername: string,
	targetUsername: string,
	alreadyDisabled: boolean
): string | null {
	if (targetUsername === actorUsername) {
		return 'Sie können Ihren eigenen Account nicht deaktivieren.';
	}
	if (alreadyDisabled) {
		return 'Admin-Benutzer ist bereits deaktiviert.';
	}
	return null;
}

export function validateDeleteTarget(
	actorUsername: string,
	targetUsername: string,
	userCount: number
): string | null {
	if (targetUsername === actorUsername) {
		return 'Sie können Ihren eigenen Account nicht löschen.';
	}
	if (userCount <= 1) {
		return 'Der letzte Admin-Benutzer kann nicht gelöscht werden.';
	}
	return null;
}
