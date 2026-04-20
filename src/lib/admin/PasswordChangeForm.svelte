<script lang="ts">
	import { enhance } from "$app/forms";

	let passwordBusy = $state(false);
	let passwordFeedback = $state<{ type: "success" | "error"; text: string } | null>(null);

	function enhancePasswordForm() {
		passwordBusy = true;
		passwordFeedback = null;
		return async ({
			result,
			update,
		}: {
			result: { type: string; data?: unknown };
			update: (opts?: { reset?: boolean }) => Promise<void>;
		}) => {
			passwordBusy = false;
			if (result.type === "success") {
				passwordFeedback = { type: "success", text: "Passwort erfolgreich geändert." };
				await update({ reset: true });
				return;
			}

			if (result.type === "failure") {
				const maybeData = (result.data ?? {}) as { error?: string };
				passwordFeedback = {
					type: "error",
					text: maybeData.error ?? "Passwort konnte nicht geändert werden.",
				};
				return;
			}

			passwordFeedback = { type: "error", text: "Unbekannter Fehler beim Ändern des Passworts." };
		};
	}
</script>

<form method="POST" action="?/changePassword" use:enhance={enhancePasswordForm} class="password-form">
	<p class="password-title">Passwort ändern</p>
	<input
		type="password"
		name="currentPassword"
		placeholder="Aktuelles Passwort"
		autocomplete="current-password"
		required
		minlength="10"
	/>
	<input type="password" name="newPassword" placeholder="Neues Passwort" autocomplete="new-password" required minlength="10" />
	<input type="password" name="confirmPassword" placeholder="Neues Passwort wiederholen" autocomplete="new-password" required minlength="10" />
	<button type="submit" class="btn-password" disabled={passwordBusy}>
		{passwordBusy ? "Speichert …" : "Passwort speichern"}
	</button>
	{#if passwordFeedback}
		<p class="password-feedback {passwordFeedback.type}" role="status">
			{passwordFeedback.text}
		</p>
	{/if}
</form>
