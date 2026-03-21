<script lang="ts">
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

	let selectedContact = $state<ContactView | null>(null);
	let activeTab = $state<"contacts" | "recipients">("contacts");

	let editingId = $state<string | null>(null);
	let editingName = $state<string>("");
	let editingEmail = $state<string>("");

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
					onclick={() => (activeTab = "contacts")}
				>
					Kontaktanfragen ({contacts.length})
				</button>
				<button
					class="sidebar-link {activeTab === 'recipients'
						? 'active'
						: ''}"
					onclick={() => (activeTab = "recipients")}
				>
					Empfänger-Struktur
				</button>
				<a class="sidebar-link sidebar-export" href="/admin/export">
					Kontakte als CSV
				</a>
			</nav>
			<div class="sidebar-footer">
				<form method="POST" action="?/logout">
					<button type="submit" class="btn-logout">Abmelden</button>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="admin-main">
			{#if activeTab === "contacts"}
				<h2>Kontaktanfragen</h2>

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
							<tr
								><td colspan="5" class="empty-state"
									>Keine Anfragen vorhanden.</td
								></tr
							>
						{:else}
							{#each contacts as contact (contact.id)}
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
					<div class="detail-panel">
						<div class="detail-header">
							<h3>Details zur Anfrage</h3>
							<button
								class="btn btn-close"
								onclick={() => (selectedContact = null)}
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
