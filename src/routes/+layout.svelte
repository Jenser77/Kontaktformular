<script lang="ts">
	import { onMount } from 'svelte';
	import { CONSENT_STORAGE_KEY } from '$lib/constants';

	let { children } = $props();
	let showConsentBanner = $state(false);
	let showConsentSettings = $state(false);
	let consentLoaded = $state(false);
	let consentPrefs = $state({
		necessary: true,
		analytics: false,
		marketing: false,
		updatedAt: ''
	});

	onMount(() => {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				consentPrefs = {
					necessary: true,
					analytics: !!parsed.analytics,
					marketing: !!parsed.marketing,
					updatedAt: parsed.updatedAt || ''
				};
				showConsentBanner = false;
			} catch {
				showConsentBanner = true;
			}
		} else {
			showConsentBanner = true;
		}
		consentLoaded = true;
	});

	function saveConsent(analytics: boolean, marketing: boolean) {
		consentPrefs = {
			necessary: true,
			analytics,
			marketing,
			updatedAt: new Date().toISOString()
		};
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentPrefs));
		showConsentBanner = false;
		showConsentSettings = false;
	}

	function closeConsentSettings() {
		showConsentSettings = false;
	}

	function onBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Enter') {
			closeConsentSettings();
		}
	}

	function onBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeConsentSettings();
		}
	}

	function acceptOnlyNecessary() {
		saveConsent(false, false);
	}

	function acceptAllCookies() {
		saveConsent(true, true);
	}

	function revokeConsent() {
		localStorage.removeItem(CONSENT_STORAGE_KEY);
		showConsentBanner = true;
		showConsentSettings = false;
		consentPrefs = {
			necessary: true,
			analytics: false,
			marketing: false,
			updatedAt: ''
		};
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

{#if consentLoaded && showConsentBanner}
	<section class="cookie-banner" aria-label="Cookie-Hinweis">
		<p>
			Diese Website verwendet technisch notwendige Cookies sowie optionale Kategorien (Statistik/Marketing).
		</p>
		<div class="cookie-actions">
			<button type="button" class="btn-muted" onclick={acceptOnlyNecessary}>Nur notwendige</button>
			<button type="button" class="btn-muted" onclick={() => (showConsentSettings = true)}>
				Einstellungen
			</button>
			<button type="button" onclick={acceptAllCookies}>Alle akzeptieren</button>
		</div>
	</section>
{/if}

{#if consentLoaded}
	<button
		type="button"
		class="cookie-settings-fab"
		onclick={() => (showConsentSettings = true)}
		aria-label="Cookie-Einstellungen öffnen"
	>
		Cookie-Einstellungen
	</button>
{/if}

{#if consentLoaded && showConsentSettings}
	<div
		class="cookie-modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Cookie-Einstellungen schließen"
		onclick={onBackdropClick}
		onkeydown={onBackdropKeydown}
	>
		<div
			class="cookie-modal"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="cookie-settings-title"
		>
			<h2 id="cookie-settings-title">Cookie-Einstellungen</h2>
			<label class="cookie-option disabled">
				<input type="checkbox" checked disabled />
				<span>Notwendige Cookies (immer aktiv)</span>
			</label>
			<label class="cookie-option">
				<input
					type="checkbox"
					checked={consentPrefs.analytics}
					onchange={(e) =>
						(consentPrefs = {
							...consentPrefs,
							analytics: (e.currentTarget as HTMLInputElement).checked
						})}
				/>
				<span>Statistik / Analyse</span>
			</label>
			<label class="cookie-option">
				<input
					type="checkbox"
					checked={consentPrefs.marketing}
					onchange={(e) =>
						(consentPrefs = {
							...consentPrefs,
							marketing: (e.currentTarget as HTMLInputElement).checked
						})}
				/>
				<span>Marketing</span>
			</label>
			<div class="cookie-actions">
				<button type="button" class="btn-muted" onclick={closeConsentSettings}>
					Abbrechen
				</button>
				<button type="button" class="btn-muted" onclick={revokeConsent}>Einwilligung widerrufen</button>
				<button
					type="button"
					onclick={() => saveConsent(consentPrefs.analytics, consentPrefs.marketing)}
				>
					Speichern
				</button>
			</div>
		</div>
	</div>
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

	.cookie-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
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

	.cookie-banner .btn-muted {
		background: #374151;
		color: #fff;
		border: 1px solid #4b5563;
	}

	.cookie-settings-fab {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 999;
		border: 0;
		background: #111827;
		color: #fff;
		padding: 10px 12px;
		border-radius: 999px;
		font-size: 0.85rem;
		cursor: pointer;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
	}

	.cookie-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: rgba(0, 0, 0, 0.45);
		display: grid;
		place-items: center;
		padding: 12px;
	}

	.cookie-modal {
		width: min(520px, 95vw);
		background: #fff;
		border-radius: 10px;
		padding: 18px;
		display: grid;
		gap: 12px;
	}

	.cookie-modal h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.cookie-option {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.cookie-option.disabled {
		opacity: 0.7;
	}

	@media (max-width: 640px) {
		.cookie-banner {
			flex-direction: column;
			align-items: flex-start;
		}

		.cookie-settings-fab {
			bottom: 82px;
		}
	}
</style>

