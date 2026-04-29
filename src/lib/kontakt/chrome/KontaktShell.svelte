<script lang="ts">
	import type { Snippet } from 'svelte';
	import KontaktHeader from './KontaktHeader.svelte';
	import KontaktHero from './KontaktHero.svelte';
	import KontaktFooter from './KontaktFooter.svelte';

	let {
		children,
		heroBadge,
		heroTitle,
		heroLead,
		heroText
	}: {
		children: Snippet;
		heroBadge?: string;
		heroTitle?: string;
		heroLead?: string;
		heroText?: string;
	} = $props();
</script>

<div class="kontakt-shell" data-kontakt-chrome="editorial-clean">
	<a href="#kontakt-main" class="skip-to-main">Zum Hauptinhalt springen</a>

	<KontaktHeader />
	<KontaktHero badge={heroBadge} title={heroTitle} lead={heroLead} text={heroText} />

	<div class="kontakt-shell-content">
		{@render children()}
	</div>

	<KontaktFooter />
</div>

<style>
	.kontakt-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.skip-to-main {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 1000;
		padding: 0.75rem 1rem;
		background: #12385d;
		color: #ffffff;
		text-decoration: none;
		border-radius: 0.35rem;
	}

	.skip-to-main:focus-visible {
		left: 0.75rem;
		top: 0.75rem;
		outline: 2px solid #ffffff;
		outline-offset: 2px;
	}

	.kontakt-shell-content {
		display: block;
		flex: 1;
	}
</style>
