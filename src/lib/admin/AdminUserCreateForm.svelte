<script lang="ts">
	import { enhance } from "$app/forms";

	interface Props {
		adminUsers: {
			id: string;
			username: string;
			displayName: string | null;
			isDisabled: boolean;
			createdAt: string;
		}[];
	}

	let { adminUsers }: Props = $props();

	let adminUserCreateBusy = $state(false);
	let adminUserFeedback = $state<{ type: "success" | "error"; text: string } | null>(null);

	function enhanceAdminUserCreateForm() {
		adminUserCreateBusy = true;
		adminUserFeedback = null;
		return async ({
			result,
			update,
		}: {
			result: { type: string; data?: unknown };
			update: (opts?: { reset?: boolean }) => Promise<void>;
		}) => {
			adminUserCreateBusy = false;
			if (result.type === "success") {
				const maybeData = (result.data ?? {}) as { message?: string };
				adminUserFeedback = {
					type: "success",
					text: maybeData.message ?? "Admin-Benutzer angelegt.",
				};
				await update({ reset: true });
				return;
			}

			if (result.type === "failure") {
				const maybeData = (result.data ?? {}) as { error?: string };
				adminUserFeedback = {
					type: "error",
					text: maybeData.error ?? "Admin-Benutzer konnte nicht angelegt werden.",
				};
				return;
			}

			adminUserFeedback = { type: "error", text: "Unbekannter Fehler beim Anlegen des Admin-Benutzers." };
		};
	}

	function enhanceAdminUserActionForm(
		actionType: "disable" | "delete",
		confirmText: string,
		successFallback: string,
		errorFallback: string,
	) {
		return ({ cancel }: { cancel: () => void }) => {
			if (!confirm(confirmText)) {
				cancel();
				return;
			}

			adminUserFeedback = null;
			return async ({
				result,
				update,
			}: {
				result: { type: string; data?: unknown };
				update: (opts?: { reset?: boolean }) => Promise<void>;
			}) => {
				if (result.type === "success") {
					const maybeData = (result.data ?? {}) as { message?: string };
					adminUserFeedback = {
						type: "success",
						text: maybeData.message ?? successFallback,
					};
					await update({ reset: false });
					return;
				}

				if (result.type === "failure") {
					const maybeData = (result.data ?? {}) as { error?: string };
					adminUserFeedback = {
						type: "error",
						text: maybeData.error ?? errorFallback,
					};
					return;
				}

				adminUserFeedback = {
					type: "error",
					text:
						actionType === "disable"
							? "Unbekannter Fehler beim Deaktivieren des Admin-Benutzers."
							: "Unbekannter Fehler beim Löschen des Admin-Benutzers.",
				};
			};
		};
	}
</script>

<form
	method="POST"
	action="?/createAdminUser"
	use:enhance={enhanceAdminUserCreateForm}
	class="admin-user-create-form"
>
	<p class="admin-user-create-title">Admin-Benutzer anlegen</p>
	<input type="text" name="username" placeholder="Benutzername" autocomplete="username" required />
	<input type="text" name="displayName" placeholder="Anzeigename (optional)" autocomplete="name" />
	<input
		type="password"
		name="password"
		placeholder="Passwort"
		autocomplete="new-password"
		required
		minlength="10"
	/>
	<input
		type="password"
		name="confirmPassword"
		placeholder="Passwort wiederholen"
		autocomplete="new-password"
		required
		minlength="10"
	/>
	<button type="submit" class="admin-user-create-btn" disabled={adminUserCreateBusy}>
		{adminUserCreateBusy ? "Legt an …" : "Admin anlegen"}
	</button>
	{#if adminUserFeedback}
		<p class="admin-user-create-feedback {adminUserFeedback.type}" role="status">
			{adminUserFeedback.text}
		</p>
	{/if}
</form>

<div class="admin-user-list">
	<p class="admin-user-create-title">Admin-Benutzer</p>
	{#if adminUsers.length === 0}
		<p class="admin-user-create-feedback">Noch keine Admin-Benutzer vorhanden.</p>
	{:else}
		<ul class="admin-user-list-items">
			{#each adminUsers as user (user.id)}
				<li class="admin-user-list-item">
					<div class="admin-user-list-info">
						<span class="admin-user-list-username">{user.username}</span>
						<span class="admin-user-list-status {user.isDisabled ? 'error' : 'success'}">
							{user.isDisabled ? "Deaktiviert" : "Aktiv"}
						</span>
					</div>
					<div class="admin-user-list-actions">
						<form
							method="POST"
							action="?/disableAdminUser"
							use:enhance={enhanceAdminUserActionForm(
								"disable",
								`Admin-Benutzer "${user.username}" wirklich deaktivieren?`,
								"Admin-Benutzer wurde deaktiviert.",
								"Admin-Benutzer konnte nicht deaktiviert werden.",
							)}
						>
							<input type="hidden" name="id" value={user.id} />
							<button type="submit" class="admin-user-create-btn" disabled={user.isDisabled}>
								Deaktivieren
							</button>
						</form>
						<form
							method="POST"
							action="?/deleteAdminUser"
							use:enhance={enhanceAdminUserActionForm(
								"delete",
								`Admin-Benutzer "${user.username}" wirklich löschen?`,
								"Admin-Benutzer wurde gelöscht.",
								"Admin-Benutzer konnte nicht gelöscht werden.",
							)}
						>
							<input type="hidden" name="id" value={user.id} />
							<button type="submit" class="admin-user-create-btn">Löschen</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
