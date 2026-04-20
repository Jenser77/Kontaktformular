<script lang="ts">
	import PasswordChangeForm from "./PasswordChangeForm.svelte";

	interface Props {
		activeTab: "contacts" | "recipients";
		onTab: (tab: "contacts" | "recipients") => void;
		totalContacts: number;
		adminDisplayName: string | null;
		exportBusy: boolean;
		onExportCsv: () => void;
	}

	let { activeTab, onTab, totalContacts, adminDisplayName, exportBusy, onExportCsv }: Props = $props();
</script>

<aside class="admin-sidebar">
	<nav>
		<button
			type="button"
			class="sidebar-link {activeTab === 'contacts' ? 'active' : ''}"
			onclick={() => onTab("contacts")}
		>
			Kontaktanfragen ({totalContacts})
		</button>
		<button
			type="button"
			class="sidebar-link {activeTab === 'recipients' ? 'active' : ''}"
			onclick={() => onTab("recipients")}
		>
			Empfänger-Struktur
		</button>
		<button
			type="button"
			class="sidebar-link sidebar-export"
			disabled={exportBusy}
			aria-busy={exportBusy ? "true" : "false"}
			onclick={onExportCsv}
		>
			{exportBusy ? "Export …" : "Kontakte als CSV"}
		</button>
	</nav>
	<div class="sidebar-footer">
		{#if adminDisplayName}
			<p class="sidebar-user">{adminDisplayName}</p>
		{/if}
		<PasswordChangeForm />
		<form method="POST" action="?/logout">
			<button type="submit" class="btn-logout">Abmelden</button>
		</form>
	</div>
</aside>
