<script lang="ts">
	import { enhance } from "$app/forms";
	import type { MandantView } from "./types";

	interface Props {
		mandanten: MandantView[];
	}

	let { mandanten }: Props = $props();

	let editingId = $state<string | null>(null);
	let editingName = $state("");
	let editingEmail = $state("");

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
</script>

<h2>Empfänger-Struktur verwalten</h2>
<p class="hint">Verwalten Sie hier die Mandanten, Einrichtungen und Fachabteilungen für das Kontaktformular.</p>

<div class="mandant-list">
	<div class="add-box">
		<form method="POST" action="?/createMandant" use:enhance>
			<input type="text" name="name" placeholder="Neuer Mandant Name" required />
			<button type="submit" class="btn btn-add">+ Mandant hinzufügen</button>
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
								void update();
								cancelEdit();
							};
						}}
						class="flex-form"
					>
						<input type="hidden" name="id" value={mandant.id} />
						<input type="text" name="name" bind:value={editingName} required />
						<button type="submit" class="btn btn-secondary btn-sm">Speichern</button>
						<button type="button" class="btn btn-close btn-sm" onclick={cancelEdit}>Abbrechen</button>
					</form>
				{:else}
					<h3>
						{mandant.name}
						<button type="button" class="icon-btn" onclick={() => startEdit(mandant.id, mandant.name)} title="Bearbeiten">✏️</button>
					</h3>
					<form
						method="POST"
						action="?/deleteMandant"
						use:enhance={({ cancel }) => {
							if (!confirm(`Mandant "${mandant.name}" und alle zugehörigen Daten endgültig löschen?`)) {
								cancel();
							}
						}}
					>
						<input type="hidden" name="id" value={mandant.id} />
						<button type="submit" class="btn btn-delete btn-sm">Mandant Löschen</button>
					</form>
				{/if}
			</div>

			<div class="einrichtung-list">
				<div class="add-inline">
					<form method="POST" action="?/createEinrichtung" use:enhance>
						<input type="hidden" name="mandantId" value={mandant.id} />
						<input type="text" name="name" placeholder="Neue Einrichtung..." required />
						<button type="submit" class="btn btn-secondary btn-sm">+ Einrichtung</button>
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
											void update();
											cancelEdit();
										};
									}}
									class="flex-form"
								>
									<input type="hidden" name="id" value={e.id} />
									<input type="text" name="name" bind:value={editingName} required />
									<button type="submit" class="btn btn-secondary btn-sm">Speichern</button>
									<button type="button" class="btn btn-close btn-sm" onclick={cancelEdit}>Abbrechen</button>
								</form>
							{:else}
								<h4>
									{e.name}
									<button type="button" class="icon-btn" onclick={() => startEdit(e.id, e.name)} title="Bearbeiten">✏️</button>
								</h4>
								<form
									method="POST"
									action="?/deleteEinrichtung"
									use:enhance={({ cancel }) => {
										if (!confirm(`Einrichtung "${e.name}" und alle zugehörigen Fachabteilungen endgültig löschen?`)) {
											cancel();
										}
									}}
								>
									<input type="hidden" name="id" value={e.id} />
									<button type="submit" class="btn btn-delete btn-sm">X</button>
								</form>
							{/if}
						</div>

						<div class="abteilungen-table-wrapper">
							<table class="abteilungen-table">
								<thead>
									<tr>
										<th>Fachabteilung</th>
										<th>Empfänger E-Mail</th>
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
															return ({ update }) => {
																void update();
																cancelEdit();
															};
														}}
														class="flex-form"
														style="width: 100%;"
													>
														<input type="hidden" name="id" value={a.id} />
														<input type="text" name="name" bind:value={editingName} required />
														<input type="email" name="email" bind:value={editingEmail} required />
														<button type="submit" class="btn btn-secondary btn-sm">Speichern</button>
														<button type="button" class="btn btn-close btn-sm" onclick={cancelEdit}>Abbrechen</button>
													</form>
												</td>
											{:else}
												<td>
													{a.name}
													<button type="button" class="icon-btn" onclick={() => startEdit(a.id, a.name, a.email)} title="Bearbeiten">✏️</button>
												</td>
												<td>{a.email}</td>
												<td class="actions-col">
													<form
														method="POST"
														action="?/deleteFachabteilung"
														use:enhance={({ cancel }) => {
															if (!confirm(`Abteilung "${a.name}" löschen?`)) {
																cancel();
															}
														}}
													>
														<input type="hidden" name="id" value={a.id} />
														<button type="submit" class="btn btn-delete btn-sm">X</button>
													</form>
												</td>
											{/if}
										</tr>
									{/each}
									<tr class="add-row">
										<td colspan="3">
											<form method="POST" action="?/createFachabteilung" use:enhance class="flex-form">
												<input type="hidden" name="einrichtungId" value={e.id} />
												<input type="text" name="name" placeholder="Neue Abteilung..." required />
												<input type="email" name="email" placeholder="E-Mail Adresse..." required />
												<button type="submit" class="btn btn-secondary btn-sm">Hinzufügen</button>
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
