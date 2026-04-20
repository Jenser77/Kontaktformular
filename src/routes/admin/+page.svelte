<script lang="ts">
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import AdminSidebar from "$lib/admin/AdminSidebar.svelte";
	import ContactTable from "$lib/admin/ContactTable.svelte";
	import RecipientManager from "$lib/admin/RecipientManager.svelte";
	import type { ContactView, MandantView } from "$lib/admin/types";
	import "$lib/admin/admin.css";

	let { data }: { data: PageData } = $props();

	let contacts = $derived(data.contacts as ContactView[]);
	let mandanten = $derived(data.mandanten as MandantView[]);
	let currentPage = $derived(data.currentPage ?? 1);
	let totalPages = $derived(data.totalPages ?? 1);
	let totalContacts = $derived(data.totalContacts ?? contacts.length);
	let contactQuery = $derived(data.contactQuery ?? "");
	let contactSort = $derived((data.contactSort ?? "newest") as "newest" | "oldest" | "name");

	let activeTab = $state<"contacts" | "recipients">("contacts");
	let exportBusy = $state(false);

	onMount(() => {
		const tab = localStorage.getItem("admin_active_tab");
		if (tab === "contacts" || tab === "recipients") activeTab = tab;
	});

	function setActiveTab(tab: "contacts" | "recipients") {
		activeTab = tab;
		localStorage.setItem("admin_active_tab", tab);
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
			const name = m?.[1] ?? `kontaktanfragen-${new Date().toISOString().slice(0, 10)}.csv`;
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
</script>

<div class="admin-root">
	<div class="admin-wrapper">
		<h1>Admin Dashboard</h1>

		<div class="admin-layout">
			<AdminSidebar
				{activeTab}
				onTab={setActiveTab}
				{totalContacts}
				adminDisplayName={data.adminDisplayName ?? null}
				{exportBusy}
				onExportCsv={exportCsv}
			/>

			<main class="admin-main">
				{#if activeTab === "contacts"}
					<ContactTable
						{contacts}
						{totalContacts}
						{currentPage}
						{totalPages}
						{contactQuery}
						{contactSort}
					/>
				{:else}
					<RecipientManager {mandanten} />
				{/if}
			</main>
		</div>
	</div>
</div>
