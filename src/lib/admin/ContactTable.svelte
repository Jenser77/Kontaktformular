<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { ContactView } from "./types";
	import ContactDetailPanel from "./ContactDetailPanel.svelte";

	interface Props {
		contacts: ContactView[];
		totalContacts: number;
		currentPage: number;
		totalPages: number;
	}

	let { contacts, totalContacts, currentPage, totalPages }: Props = $props();

	let contactQuery = $state("");
	let contactSort = $state<"newest" | "oldest" | "name">("newest");
	let selectedContact = $state<ContactView | null>(null);

	onMount(() => {
		const savedSort = localStorage.getItem("admin_contact_sort");
		if (savedSort === "newest" || savedSort === "oldest" || savedSort === "name") {
			contactSort = savedSort;
		}
		const savedQuery = localStorage.getItem("admin_contact_query");
		if (savedQuery) contactQuery = savedQuery;
	});

	function setContactSort(sort: "newest" | "oldest" | "name") {
		contactSort = sort;
		localStorage.setItem("admin_contact_sort", sort);
	}

	function setContactQuery(value: string) {
		contactQuery = value;
		localStorage.setItem("admin_contact_query", value);
	}

	let visibleContacts = $derived(
		(() => {
			const query = contactQuery.trim().toLowerCase();
			let list = [...contacts];

			if (query) {
				list = list.filter((contact) => {
					const haystack = [
						contact.firstName,
						contact.lastName,
						contact.email,
						contact.subject,
						contact.recipientLabel ?? "",
					]
						.join(" ")
						.toLowerCase();
					return haystack.includes(query);
				});
			}

			if (contactSort === "oldest") {
				list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
			} else if (contactSort === "name") {
				list.sort((a, b) =>
					`${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "de"),
				);
			} else {
				list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
			}

			return list;
		})(),
	);

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
<p class="hint">Gesamt: {totalContacts} Kontakte, angezeigt: {visibleContacts.length}</p>

<div class="table-controls">
	<input
		type="search"
		class="form-filter"
		placeholder="Suche nach Name, E-Mail, Betreff …"
		value={contactQuery}
		oninput={(e) => setContactQuery((e.currentTarget as HTMLInputElement).value)}
	/>
	<select
		class="form-filter"
		value={contactSort}
		onchange={(e) => setContactSort((e.currentTarget as HTMLSelectElement).value as "newest" | "oldest" | "name")}
	>
		<option value="newest">Sortierung: Neueste zuerst</option>
		<option value="oldest">Sortierung: Älteste zuerst</option>
		<option value="name">Sortierung: Name A-Z</option>
	</select>
</div>

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
		{#if visibleContacts.length === 0}
			<tr>
				<td colspan="5" class="empty-state">Keine passenden Anfragen gefunden.</td>
			</tr>
		{:else}
			{#each visibleContacts as contact (contact.id)}
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
							use:enhance={({ cancel }) => {
								if (!confirm("Soll dieser Kontakt wirklich gelöscht werden?")) {
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
			href={currentPage > 1 ? `/admin?page=${currentPage - 1}` : "#"}
			aria-disabled={currentPage <= 1}
		>
			Zurück
		</a>
		<span>Seite {currentPage} von {totalPages}</span>
		<a
			class="btn btn-secondary btn-sm"
			href={currentPage < totalPages ? `/admin?page=${currentPage + 1}` : "#"}
			aria-disabled={currentPage >= totalPages}
		>
			Weiter
		</a>
	</nav>
{/if}
