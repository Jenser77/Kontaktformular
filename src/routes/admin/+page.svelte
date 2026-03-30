<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	interface ContactView {
		id: string;
		firstName: string;
		lastName: string;
		organization: string | null;
		email: string;
		phone: string | null;
		subject: string;
		message: string;
		privacyAccepted: boolean;
		targetRecipient: string | null;
		recipientLabel: string | null;
		createdAt: string;
	}

	interface FachabteilungView {
		id: string;
		name: string;
		email: string;
		einrichtungId: string;
		createdAt: string;
	}

	interface EinrichtungView {
		id: string;
		name: string;
		mandantId: string;
		abteilungen: FachabteilungView[];
		createdAt: string;
	}

	interface MandantView {
		id: string;
		name: string;
		einrichtungen: EinrichtungView[];
		createdAt: string;
	}

	let { data }: { data: PageData } = $props();

	let contacts = $derived(data.contacts as ContactView[]);
	let mandanten = $derived(data.mandanten as MandantView[]);
	let currentPage = $derived(data.currentPage ?? 1);
	let totalPages = $derived(data.totalPages ?? 1);
	let totalContacts = $derived(data.totalContacts ?? contacts.length);

	let selectedContact = $state<ContactView | null>(null);
	let activeTab = $state<"contacts" | "recipients">("contacts");
	let contactQuery = $state("");
	let contactSort = $state<"newest" | "oldest" | "name">("newest");

	let editingId = $state<string | null>(null);
	let editingName = $state<string>("");
	let editingEmail = $state<string>("");
	let exportBusy = $state(false);
	let passwordBusy = $state(false);
	let passwordFeedback = $state<{ type: "success" | "error"; text: string } | null>(null);

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
					].join(" ").toLowerCase();
					return haystack.includes(query);
				});
			}

			if (contactSort === "oldest") {
				list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
			} else if (contactSort === "name") {
				list.sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "de"));
			} else {
				list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
			}

			return list;
		})(),
	);

	onMount(() => {
		const tab = localStorage.getItem("admin_active_tab");
		const savedSort = localStorage.getItem("admin_contact_sort");
		const savedQuery = localStorage.getItem("admin_contact_query");

		if (tab === "contacts" || tab === "recipients") activeTab = tab;
		if (savedSort === "newest" || savedSort === "oldest" || savedSort === "name") {
			contactSort = savedSort;
		}
		if (savedQuery) contactQuery = savedQuery;
	});

	function setActiveTab(tab: "contacts" | "recipients") {
		activeTab = tab;
		localStorage.setItem("admin_active_tab", tab);
	}

	function setContactSort(sort: "newest" | "oldest" | "name") {
		contactSort = sort;
		localStorage.setItem("admin_contact_sort", sort);
	}

	function setContactQuery(value: string) {
		contactQuery = value;
		localStorage.setItem("admin_contact_query", value);
	}

	async function exportCsv() {
		if (exportBusy) return;
		exportBusy = true;
		try {
			const res = await fetch("/admin/export", {
				method: "POST",
				credentials: "include",
			});
			if (!res.ok) {
				alert(`Export fehlgeschlagen (HTTP ${res.status}).`);
				return;
			}
			const blob = await res.blob();
			const cd = res.headers.get("Content-Disposition");
			const m = cd?.match(/filename="([^"]+)"/);
			const name =
				m?.[1] ?? `kontaktanfragen-${new Date().toISOString().slice(0, 10)}.csv`;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = name;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			exportBusy = false;
		}
	}

	function startEdit(id: string, name: string, email: string = "") {
		editingId = id;
		editingName = name;
		editingEmail = email;
	}

	function cancelEdit() {
		editingId = null;
		editingName = "";
		editingEmail = "";
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

	function handleDetailKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") closeDetails();
	}

	function enhancePasswordForm() {
		passwordBusy = true;
		passwordFeedback = null;
		return async ({ result, update }: { result: { type: string; data?: unknown }; update: (opts?: { reset?: boolean }) => Promise<void> }) => {
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
					text: maybeData.error ?? "Passwort konnte nicht geändert werden."
				};
				return;
			}

			passwordFeedback = { type: "error", text: "Unbekannter Fehler beim Ändern des Passworts." };
		};
	}
</script>

<div class="admin-wrapper">
	<h1>Admin Dashboard</h1>

	<div class="admin-layout">
		<!-- Sidebar -->
		<aside class="admin-sidebar">
			<nav>
				<button
					class="sidebar-link {activeTab === 'contacts'
						? 'active'
						: ''}"
					onclick={() => setActiveTab("contacts")}
				>
					Kontaktanfragen ({totalContacts})
				</button>
				<button
					class="sidebar-link {activeTab === 'recipients'
						? 'active'
						: ''}"
					onclick={() => setActiveTab("recipients")}
				>
					Empfänger-Struktur
				</button>
				<button
					type="button"
					class="sidebar-link sidebar-export"
					disabled={exportBusy}
					aria-busy={exportBusy ? 'true' : 'false'}
					onclick={exportCsv}
				>
					{exportBusy ? "Export …" : "Kontakte als CSV"}
				</button>
			</nav>
			<div class="sidebar-footer">
				{#if data.adminDisplayName}
					<p class="sidebar-user">{data.adminDisplayName}</p>
				{/if}
				<form method="POST" action="?/changePassword" use:enhance={enhancePasswordForm} class="password-form">
					<p class="password-title">Passwort ändern</p>
					<input type="password" name="currentPassword" placeholder="Aktuelles Passwort" autocomplete="current-password" required minlength="10" />
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
				<form method="POST" action="?/logout">
					<button type="submit" class="btn-logout">Abmelden</button>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="admin-main">
			{#if activeTab === "contacts"}
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
						onchange={(e) =>
							setContactSort((e.currentTarget as HTMLSelectElement).value as "newest" | "oldest" | "name")}
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
							<tr
								><td colspan="5" class="empty-state"
									>Keine passenden Anfragen gefunden.</td
								></tr
							>
						{:else}
							{#each visibleContacts as contact (contact.id)}
								<tr>
									<td>{formatDate(contact.createdAt)}</td>
									<td
										>{contact.firstName}
										{contact.lastName}</td
									>
									<td class="cell-recipient"
										>{contact.recipientLabel ?? "—"}</td
									>
									<td>{contact.subject}</td>
									<td class="actions-col">
										<button
											class="btn btn-view"
											onclick={() =>
												(selectedContact = contact)}
											>Ansehen</button
										>
										<form
											method="POST"
											action="?/deleteContact"
											use:enhance={({ cancel }) => {
												if (
													!confirm(
														"Soll dieser Kontakt wirklich gelöscht werden?",
													)
												) {
													cancel();
													return;
												}
												return handleDeleteContact(
													contact.id,
												);
											}}
										>
											<input
												type="hidden"
												name="id"
												value={contact.id}
											/>
											<button
												type="submit"
												class="btn btn-delete"
												>Löschen</button
											>
										</form>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>

				{#if selectedContact}
					<div
						class="detail-panel"
						role="dialog"
						aria-modal="true"
						aria-labelledby="detail-title"
						tabindex="-1"
						onkeydown={handleDetailKeydown}
					>
						<div class="detail-header">
							<h3 id="detail-title">Details zur Anfrage</h3>
							<button
								class="btn btn-close"
								onclick={closeDetails}
								aria-label="Details schließen"
								>Schließen</button
							>
						</div>
						<div class="detail-grid">
							<strong>Name:</strong>
							<span
								>{selectedContact.firstName}
								{selectedContact.lastName}</span
							>
							<strong>Organisation:</strong>
							<span>{selectedContact.organization || "-"}</span>
							<strong>E-Mail:</strong>
							<span
								><a href="mailto:{selectedContact.email}"
									>{selectedContact.email}</a
								></span
							>
							<strong>Telefon:</strong>
							<span>{selectedContact.phone || "-"}</span>
							<strong>Betreff:</strong>
							<span>{selectedContact.subject}</span>
							<strong>Empfänger:</strong>
							<span
								>{selectedContact.recipientLabel ??
									selectedContact.targetRecipient ??
									"—"}</span
							>
							<strong>Nachricht:</strong>
							<p class="message-text">
								{selectedContact.message}
							</p>
						</div>
					</div>
				{/if}

				{#if totalPages > 1}
					<nav class="pagination" aria-label="Kontaktseiten">
						<a
							class="btn btn-secondary btn-sm"
							href={currentPage > 1 ? `/admin?page=${currentPage - 1}` : '#'}
							aria-disabled={currentPage <= 1}
						>
							Zurück
						</a>
						<span>Seite {currentPage} von {totalPages}</span>
						<a
							class="btn btn-secondary btn-sm"
							href={currentPage < totalPages ? `/admin?page=${currentPage + 1}` : '#'}
							aria-disabled={currentPage >= totalPages}
						>
							Weiter
						</a>
					</nav>
				{/if}
			{:else if activeTab === "recipients"}
				<h2>Empfänger-Struktur verwalten</h2>
				<p class="hint">
					Verwalten Sie hier die Mandanten, Einrichtungen und
					Fachabteilungen für das Kontaktformular.
				</p>

				<div class="mandant-list">
					<!-- Add New Mandant -->
					<div class="add-box">
						<form
							method="POST"
							action="?/createMandant"
							use:enhance
						>
							<input
								type="text"
								name="name"
								placeholder="Neuer Mandant Name"
								required
							/>
							<button type="submit" class="btn btn-add"
								>+ Mandant hinzufügen</button
							>
						</form>
					</div>

					{#each mandanten as mandant (mandant.id)}
						<div class="mandant-card">
							<div class="mandant-header">
								{#if editingId === mandant.id}
									<form
										method="POST"
										action="?/updateMandant"
										use:enhance={() => {
											return ({ update }) => {
												update();
												cancelEdit();
											};
										}}
										class="flex-form"
									>
										<input
											type="hidden"
											name="id"
											value={mandant.id}
										/>
										<input
											type="text"
											name="name"
											bind:value={editingName}
											required
										/>
										<button
											type="submit"
											class="btn btn-secondary btn-sm"
											>Speichern</button
										>
										<button
											type="button"
											class="btn btn-close btn-sm"
											onclick={cancelEdit}
											>Abbrechen</button
										>
									</form>
								{:else}
									<h3>
										{mandant.name}
										<button
											class="icon-btn"
											onclick={() =>
												startEdit(
													mandant.id,
													mandant.name,
												)}
											title="Bearbeiten">✏️</button
										>
									</h3>
									<form
										method="POST"
										action="?/deleteMandant"
										use:enhance={() => {
											if (
												!confirm(
													`Mandant "${mandant.name}" und alle zugehörigen Daten endgültig löschen?`,
												)
											)
												return;
										}}
									>
										<input
											type="hidden"
											name="id"
											value={mandant.id}
										/>
										<button
											type="submit"
											class="btn btn-delete btn-sm"
											>Mandant Löschen</button
										>
									</form>
								{/if}
							</div>

							<div class="einrichtung-list">
								<!-- Add New Einrichtung -->
								<div class="add-inline">
									<form
										method="POST"
										action="?/createEinrichtung"
										use:enhance
									>
										<input
											type="hidden"
											name="mandantId"
											value={mandant.id}
										/>
										<input
											type="text"
											name="name"
											placeholder="Neue Einrichtung..."
											required
										/>
										<button
											type="submit"
											class="btn btn-secondary btn-sm"
											>+ Einrichtung</button
										>
									</form>
								</div>

								{#each mandant.einrichtungen as e (e.id)}
									<div class="einrichtung-card">
										<div class="einrichtung-header">
											{#if editingId === e.id}
												<form
													method="POST"
													action="?/updateEinrichtung"
													use:enhance={() => {
														return ({ update }) => {
															update();
															cancelEdit();
														};
													}}
													class="flex-form"
												>
													<input
														type="hidden"
														name="id"
														value={e.id}
													/>
													<input
														type="text"
														name="name"
														bind:value={editingName}
														required
													/>
													<button
														type="submit"
														class="btn btn-secondary btn-sm"
														>Speichern</button
													>
													<button
														type="button"
														class="btn btn-close btn-sm"
														onclick={cancelEdit}
														>Abbrechen</button
													>
												</form>
											{:else}
												<h4>
													{e.name}
													<button
														class="icon-btn"
														onclick={() =>
															startEdit(
																e.id,
																e.name,
															)}
														title="Bearbeiten"
														>✏️</button
													>
												</h4>
												<form
													method="POST"
													action="?/deleteEinrichtung"
													use:enhance={() => {
														if (
															!confirm(
																`Einrichtung "${e.name}" und alle zugehörigen Fachabteilungen endgültig löschen?`,
															)
														)
															return;
													}}
												>
													<input
														type="hidden"
														name="id"
														value={e.id}
													/>
													<button
														type="submit"
														class="btn btn-delete btn-sm"
														>X</button
													>
												</form>
											{/if}
										</div>

										<div class="abteilungen-table-wrapper">
											<table class="abteilungen-table">
												<thead>
													<tr>
														<th>Fachabteilung</th>
														<th>Empfänger E-Mail</th
														>
														<th></th>
													</tr>
												</thead>
												<tbody>
													{#each e.abteilungen as a (a.id)}
														<tr>
															{#if editingId === a.id}
																<td colspan="3">
																	<form
																		method="POST"
																		action="?/updateFachabteilung"
																		use:enhance={() => {
																			return ({
																				update,
																			}) => {
																				update();
																				cancelEdit();
																			};
																		}}
																		class="flex-form"
																		style="width: 100%;"
																	>
																		<input
																			type="hidden"
																			name="id"
																			value={a.id}
																		/>
																		<input
																			type="text"
																			name="name"
																			bind:value={
																				editingName
																			}
																			required
																		/>
																		<input
																			type="email"
																			name="email"
																			bind:value={
																				editingEmail
																			}
																			required
																		/>
																		<button
																			type="submit"
																			class="btn btn-secondary btn-sm"
																			>Speichern</button
																		>
																		<button
																			type="button"
																			class="btn btn-close btn-sm"
																			onclick={cancelEdit}
																			>Abbrechen</button
																		>
																	</form>
																</td>
															{:else}
																<td>
																	{a.name}
																	<button
																		class="icon-btn"
																		onclick={() =>
																			startEdit(
																				a.id,
																				a.name,
																				a.email,
																			)}
																		title="Bearbeiten"
																		>✏️</button
																	>
																</td>
																<td
																	>{a.email}</td
																>
																<td
																	class="actions-col"
																>
																	<form
																		method="POST"
																		action="?/deleteFachabteilung"
																		use:enhance={() => {
																			if (
																				!confirm(
																					`Abteilung "${a.name}" löschen?`,
																				)
																			)
																				return;
																		}}
																	>
																		<input
																			type="hidden"
																			name="id"
																			value={a.id}
																		/>
																		<button
																			type="submit"
																			class="btn btn-delete btn-sm"
																			>X</button
																		>
																	</form>
																</td>
															{/if}
														</tr>
													{/each}
													<!-- Add New Fachabteilung Row -->
													<tr class="add-row">
														<td colspan="3">
															<form
																method="POST"
																action="?/createFachabteilung"
																use:enhance
																class="flex-form"
															>
																<input
																	type="hidden"
																	name="einrichtungId"
																	value={e.id}
																/>
																<input
																	type="text"
																	name="name"
																	placeholder="Neue Abteilung..."
																	required
																/>
																<input
																	type="email"
																	name="email"
																	placeholder="E-Mail Adresse..."
																	required
																/>
																<button
																	type="submit"
																	class="btn btn-secondary btn-sm"
																	>Hinzufügen</button
																>
															</form>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.admin-wrapper {
		padding: 40px;
		max-width: 1200px;
		margin: 0 auto;
		font-family: "Public Sans", system-ui, sans-serif;
	}

	h1 {
		color: #3c1361;
		border-bottom: 2px solid #5e2d91;
		padding-bottom: 10px;
	}

	.admin-layout {
		display: flex;
		gap: 20px;
		margin-top: 20px;
	}

	.admin-sidebar {
		width: 240px;
		background: #f5f5f5;
		padding: 20px;
		border: 1px solid #ddd;
		border-radius: 4px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
	}

	.admin-sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
	}

	.sidebar-footer {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid #ddd;
	}

	.sidebar-user {
		margin: 0 0 10px;
		font-size: 0.875rem;
		color: #555;
		line-height: 1.35;
	}

	.password-form {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 12px;
	}

	.password-title {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 700;
		color: #444;
	}

	.password-form input {
		width: 100%;
		box-sizing: border-box;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	.btn-password {
		width: 100%;
		background: #3c1361;
		color: #fff;
		padding: 8px 12px;
		border: 0;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-password:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.password-feedback {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.25;
	}

	.password-feedback.success {
		color: #166534;
	}

	.password-feedback.error {
		color: #b91c1c;
	}

	.btn-logout {
		width: 100%;
		background: none;
		border: 1px solid #ccc;
		color: #666;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		text-align: center;
	}

	.btn-logout:hover {
		background: #f5f5f5;
		color: #333;
	}

	.sidebar-link {
		display: block;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		color: #5e2d91;
		text-decoration: none;
		font-weight: 600;
		padding: 10px 12px;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
	}

	.sidebar-link:hover {
		background: #ececec;
	}

	.sidebar-link.active {
		background: #5e2d91;
		color: #fff;
	}

	.admin-main {
		flex: 1;
		background: #fff;
		padding: 24px;
		border: 1px solid #ddd;
		border-radius: 4px;
		min-height: 500px;
	}

	h2 {
		color: #3c1361;
		margin-top: 0;
	}
	h3 {
		color: #3c1361;
		margin-top: 0;
	}
	h4 {
		color: #444;
		margin-top: 0;
		margin-bottom: 10px;
	}

	.hint {
		color: #555;
		margin-bottom: 20px;
		font-size: 0.95rem;
	}

	/* Buttons Base */
	.btn {
		border: none;
		padding: 6px 14px;
		cursor: pointer;
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.btn-add {
		background: #5e2d91;
		color: #fff;
	}
	.btn-secondary {
		background: #888;
		color: #fff;
	}
	.btn-view {
		background: #5e2d91;
		color: #fff;
		margin-right: 5px;
	}
	.btn-delete {
		background: #c0392b;
		color: #fff;
	}
	.btn-close {
		background: #888;
		color: #fff;
	}
	.btn-sm {
		padding: 4px 8px;
		font-size: 0.8rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
	}

	.pagination a[aria-disabled="true"] {
		pointer-events: none;
		opacity: 0.5;
	}

	form {
		display: inline;
	}

	/* Tables */
	.admin-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
	}
	.admin-table th,
	.admin-table td {
		padding: 12px;
		text-align: left;
	}
	.admin-table thead tr {
		background: #3c1361;
		color: #fff;
	}
	.admin-table tbody tr {
		border-bottom: 1px solid #eee;
	}
	.admin-table tbody tr:hover {
		background: #faf7fd;
	}
	.cell-recipient {
		max-width: 18rem;
		font-size: 0.9em;
		line-height: 1.35;
		vertical-align: top;
	}
	.actions-col {
		text-align: right !important;
		white-space: nowrap;
	}
	.empty-state {
		padding: 20px;
		text-align: center;
		color: #999;
	}

	.table-controls {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.form-filter {
		border: 1px solid #d0d0d0;
		border-radius: 4px;
		padding: 8px 10px;
		font-size: 0.9rem;
		min-width: 240px;
	}

	/* Details View */
	.detail-panel {
		margin-top: 30px;
		padding: 20px;
		border: 2px solid #5e2d91;
		background: #faf7fd;
		border-radius: 4px;
	}
	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.detail-grid {
		margin-top: 15px;
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 10px;
	}
	.detail-grid a {
		color: #5e2d91;
	}
	.message-text {
		margin: 0;
		white-space: pre-wrap;
		background: #fff;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	/* Recipients UI */
	.mandant-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.add-box {
		background: #faf7fd;
		padding: 15px;
		border-radius: 4px;
		border: 1px dashed #5e2d91;
	}
	.add-box input[type="text"] {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 300px;
		margin-right: 10px;
	}

	.mandant-card {
		border: 1px solid #ddd;
		border-top: 4px solid #5e2d91;
		border-radius: 4px;
		padding: 20px;
		background: #fff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
	}
	.mandant-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #eee;
		padding-bottom: 10px;
	}

	.einrichtung-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
		padding-left: 15px;
	}

	.add-inline input[type="text"] {
		padding: 6px;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 200px;
		margin-right: 5px;
	}

	.einrichtung-card {
		background: #f9f9f9;
		border: 1px solid #eee;
		border-left: 3px solid #888;
		padding: 15px;
		border-radius: 4px;
	}

	.einrichtung-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.abteilungen-table-wrapper {
		margin-top: 10px;
		background: #fff;
		border: 1px solid #eee;
	}

	.abteilungen-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}
	.abteilungen-table th {
		background: #eee;
		padding: 6px 10px;
		text-align: left;
	}
	.abteilungen-table td {
		padding: 6px 10px;
		border-top: 1px solid #eee;
	}

	.add-row {
		background: #fafafa;
	}
	.flex-form {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.flex-form input {
		padding: 4px 6px;
		border: 1px solid #ccc;
		border-radius: 3px;
		font-size: 0.85rem;
	}
	.flex-form input[type="text"] {
		width: 140px;
	}
	.flex-form input[type="email"] {
		width: 200px;
	}

	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.9em;
		padding: 0 5px;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	.icon-btn:hover {
		opacity: 1;
	}
</style>
