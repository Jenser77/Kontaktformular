<script lang="ts">
	import StitchFrontendPreview from '$lib/kontakt/StitchFrontendPreview.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Kontakt | Diakoniestiftung in Sachsen</title>
	<meta
		name="description"
		content="Kontaktseite der Diakoniestiftung in Sachsen mit klarer Uebersicht zu Anliegen und Kontaktwegen."
	/>
</svelte:head>

<StitchFrontendPreview
	recipients={data.recipientStructure}
	recipientsLoadFailed={data.recipientsLoadError}
/>
