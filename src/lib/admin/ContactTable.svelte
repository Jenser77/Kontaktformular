<script lang="ts">
	import { enhance } from "$app/forms";
	import ConfirmDialog from "$lib/ui/ConfirmDialog.svelte";
	import type { ContactView } from "./types";
	import ContactDetailPanel from "./ContactDetailPanel.svelte";

	interface Props {
		contacts: ContactView[];
		totalContacts: number;
		currentPage: number;
		totalPages: number;
		contactQuery: string;
		contactSort: "newest" | "oldest" | "name";
	}

	let { contacts, totalContacts, currentPage, totalPages, contactQuery, contactSort }: Props = $props();

	let selectedContact = $state<ContactView | null>(null);

	let confirmOpen = $state(false);
	let confirmMessage = $state("");
	let confirmResolver = $state<((value: boolean) => void) | null>(null);

	function confirmAsync(message: string): Promise<boolean> {
		return new Promise((resolve) => {
			confirmMessage = message;
			confirmResolver = resolve;
			confirmOpen = true;
		});
	}

	function resolveConfirm(value: boolean) {
		confirmResolver?.(value);
		confirmResolver = null;
	}

	function queryForPage(page: number): string {
		const parts: string[] = [];
		if (contactQuery) parts.push(`q=${encodeURIComponent(contactQuery)}`);
		parts.push(`sort=${encodeURIComponent(contactSort)}`);
		parts.push(`page=${encodeURIComponent(String(page))}`);
		return `?${parts.join("&")}`;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function closeDetails() {
		selectedContact = null;
	}

	function handleDeleteContact(id: string) {
		return async ({
			result,
			update,
		}: {
			result: { type: string };
			update: (opts?: { reset?: boolean }) => Promise<void>;
		}) => {
			if (result.type === "success") {
				await update();
				if (selectedContact?.id === id) selectedContact = null;
			}
		};
	}
</script>

<h2>Kontaktanfragen</h2>
<p class="hint">Gesamt: {totalContacts} Kontakte, angezeigt: {contacts.length}</p>

<form method="GET" action="/admin" class="table-controls">
	<input type="hidden" name="page" value="1" />
	<input type="search" class="form-filter" name="q" placeholder="Suche nach Name, E-Mail, Betreff …" value={contactQuery} />
	<select class="form-filter" name="sort" value={contactSort}>
		<option value="newest">Sortierung: Neueste zuerst</option>
		<option value="oldest">Sortierung: Älteste zuerst</option>
		<option value="name">Sortierung: Name A-Z</option>
	</select>
	<button type="submit" class="btn btn-secondary btn-sm">Anwenden</button>
</form>

<ConfirmDialog
	bind:open={confirmOpen}
	message={confirmMessage}
	title="Kontakt löschen"
	confirmText="Löschen"
	cancelText="Abbrechen"
	onConfirm={() => resolveConfirm(true)}
	onCancel={() => resolveConfirm(false)}
/>

<table class="admin-table">
	<thead>
		<tr>
			<th>Datum</th>
			<th>Name</th>
			<th>Empfänger</th>
			<th>Betreff</th>
			<th class="actions-col">Aktionen</th>
		</tr>
	</thead>
	<tbody>
		{#if contacts.length === 0}
			<tr>
				<td colspan="5" class="empty-state">Keine passenden Anfragen gefunden.</td>
			</tr>
		{:else}
			{#each contacts as contact (contact.id)}
				<tr>
					<td>{formatDate(contact.createdAt)}</td>
					<td>{contact.firstName} {contact.lastName}</td>
					<td class="cell-recipient">{contact.recipientLabel ?? "—"}</td>
					<td>{contact.subject}</td>
					<td class="actions-col">
						<button type="button" class="btn btn-view" onclick={() => (selectedContact = contact)}>Ansehen</button>
						<form
							method="POST"
							action="?/deleteContact"
							use:enhance={async ({ cancel }) => {
								const ok = await confirmAsync("Soll dieser Kontakt wirklich gelöscht werden?");
								if (!ok) {
									cancel();
									return;
								}
								return handleDeleteContact(contact.id);
							}}
						>
							<input type="hidden" name="id" value={contact.id} />
							<button type="submit" class="btn btn-delete">Löschen</button>
						</form>
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>

{#if selectedContact}
	<ContactDetailPanel contact={selectedContact} onClose={closeDetails} />
{/if}

{#if totalPages > 1}
	<nav class="pagination" aria-label="Kontaktseiten">
		<a
			class="btn btn-secondary btn-sm"
			href={currentPage > 1 ? queryForPage(currentPage - 1) : "#"}
			aria-disabled={currentPage <= 1}
		>
			Zurück
		</a>
		<span>Seite {currentPage} von {totalPages}</span>
		<a
			class="btn btn-secondary btn-sm"
			href={currentPage < totalPages ? queryForPage(currentPage + 1) : "#"}
			aria-disabled={currentPage >= totalPages}
		>
			Weiter
		</a>
	</nav>
{/if}
