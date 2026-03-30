<script>
	import { onMount } from 'svelte';

	let { children } = $props();
	let cookieConsent = $state(false);
	let consentLoaded = $state(false);

	onMount(() => {
		cookieConsent = localStorage.getItem('kf_cookie_consent') === 'yes';
		consentLoaded = true;
	});

	function acceptCookies() {
		cookieConsent = true;
		localStorage.setItem('kf_cookie_consent', 'yes');
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
	<link
		href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
		rel="stylesheet"
	/>
	<link rel="stylesheet" href="/design-new.css" />
</svelte:head>

{@render children()}

{#if consentLoaded && !cookieConsent}
	<section class="cookie-banner" aria-label="Cookie-Hinweis">
		<p>
			Diese Website verwendet technisch notwendige Cookies (z. B. für Admin-Login und Sicherheit).
		</p>
		<button type="button" onclick={acceptCookies}>Verstanden</button>
	</section>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		left: 16px;
		right: 16px;
		bottom: 16px;
		z-index: 1000;
		display: flex;
		gap: 10px;
		align-items: center;
		justify-content: space-between;
		background: #1f2937;
		color: #fff;
		padding: 12px 14px;
		border-radius: 8px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
	}

	.cookie-banner p {
		margin: 0;
		font-size: 0.9rem;
	}

	.cookie-banner button {
		border: 0;
		background: #fff;
		color: #111827;
		padding: 8px 12px;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.cookie-banner {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>

