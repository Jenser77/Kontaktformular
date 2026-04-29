<script lang="ts">
	import KontaktShell from '$lib/kontakt/chrome/KontaktShell.svelte';
	import KontaktWizard from '$lib/kontakt/KontaktWizard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Kontakt - Diakoniestiftung in Sachsen</title>
	<meta name="description" content="Kontaktieren Sie die Diakoniestiftung in Sachsen — Anfragen an Fachabteilungen und Einrichtungen." />
</svelte:head>

<KontaktShell>
	<KontaktWizard
		recipients={data.recipientStructure}
		recipientsLoadFailed={data.recipientsLoadError}
	/>
</KontaktShell>
