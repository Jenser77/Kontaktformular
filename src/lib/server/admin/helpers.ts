export const DISABLED_DISPLAY_PREFIX = '[DEAKTIVIERT] ';

export function isDisabledDisplayName(displayName: string | null | undefined): boolean {
	return (displayName ?? '').startsWith(DISABLED_DISPLAY_PREFIX);
}

export function recipientLabel(
	dept:
		| {
				name: string;
				einrichtung: { name: string; mandant: { name: string } };
		  }
		| undefined,
	fallbackId: string | null
): string | null {
	if (dept) {
		return `${dept.einrichtung.mandant.name} → ${dept.einrichtung.name} → ${dept.name}`;
	}
	if (fallbackId) {
		return `Nicht zuordenbar (ID: ${fallbackId})`;
	}
	return null;
}
