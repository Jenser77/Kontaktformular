<script lang="ts">
	import { onMount } from 'svelte';
	import { CONSENT_STORAGE_KEY } from '$lib/constants';
	import '@fontsource/public-sans/300.css';
	import '@fontsource/public-sans/400.css';
	import '@fontsource/public-sans/500.css';
	import '@fontsource/public-sans/600.css';
	import '@fontsource/public-sans/700.css';
	import '@fontsource/public-sans/800.css';
	import '@fontsource/public-sans/900.css';

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
	<link rel="stylesheet" href="/design-new.css" />
</svelte:head>

{@render children()}

{#if consentLoaded && showConsentBanner}
	<section class="cookie-banner" aria-label="Cookie-Hinweis">
		<div class="cookie-banner-copy">
			<p class="cookie-banner-title">Cookie-Einstellungen</p>
			<p>
				Diese Website verwendet technisch notwendige Cookies sowie optionale Kategorien (Statistik/Marketing).
			</p>
		</div>
		<div class="cookie-actions">
			<button type="button" class="cookie-btn cookie-btn-muted" onclick={acceptOnlyNecessary}>
				Nur notwendige
			</button>
			<button
				type="button"
				class="cookie-btn cookie-btn-muted"
				onclick={() => (showConsentSettings = true)}
			>
				Einstellungen
			</button>
			<button type="button" class="cookie-btn cookie-btn-primary" onclick={acceptAllCookies}>
				Alle akzeptieren
			</button>
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
			<p class="cookie-modal-text">
				Wählen Sie, welche optionalen Cookies aktiviert werden dürfen. Notwendige Cookies sind immer aktiv.
			</p>
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
				<button type="button" class="cookie-btn cookie-btn-muted" onclick={closeConsentSettings}>
					Abbrechen
				</button>
				<button type="button" class="cookie-btn cookie-btn-danger" onclick={revokeConsent}>
					Einwilligung widerrufen
				</button>
				<button
					type="button"
					class="cookie-btn cookie-btn-primary"
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
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: #fff;
		padding: 16px 18px;
		border-radius: 14px;
		box-shadow: 0 18px 40px rgba(16, 24, 40, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.22);
	}

	.cookie-banner-copy {
		display: grid;
		gap: 0.35rem;
		max-width: 60ch;
	}

	.cookie-banner-title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.cookie-banner p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.cookie-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.cookie-btn {
		border: 0;
		padding: 9px 14px;
		border-radius: 999px;
		font-weight: 600;
		font-family: 'Public Sans', sans-serif;
		font-size: 0.875rem;
		line-height: 1.2;
		cursor: pointer;
		transition: transform 0.15s ease, filter 0.2s ease, background-color 0.2s ease, color 0.2s ease;
	}

	.cookie-btn:hover,
	.cookie-btn:focus-visible {
		filter: brightness(1.04);
		transform: translateY(-1px);
	}

	.cookie-btn:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	.cookie-btn-primary {
		background: var(--accent);
		color: #07283a;
	}

	.cookie-btn-muted {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.28);
	}

	.cookie-btn-danger {
		background: #fee2e2;
		color: #7f1d1d;
	}

	.cookie-modal .cookie-btn-muted {
		background: #f1f5f9;
		color: #1e293b;
		border: 1px solid #cbd5e1;
	}

	.cookie-modal .cookie-btn-primary {
		color: #fff;
	}

	.cookie-modal .cookie-btn:focus-visible {
		outline: 2px solid var(--primary);
	}

	.cookie-settings-fab {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 999;
		border: 0;
		background: var(--primary);
		color: #fff;
		padding: 10px 14px;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 10px 24px rgba(90, 37, 114, 0.35);
		transition: background-color 0.2s ease, transform 0.15s ease;
	}

	.cookie-settings-fab:hover,
	.cookie-settings-fab:focus-visible {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.cookie-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: rgba(15, 23, 42, 0.58);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		display: grid;
		place-items: center;
		padding: 12px;
	}

	.cookie-modal {
		width: min(520px, 95vw);
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		display: grid;
		gap: 14px;
		box-shadow: 0 22px 50px rgba(15, 23, 42, 0.28);
		border: 1px solid #e2e8f0;
	}

	.cookie-modal h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--primary);
	}

	.cookie-modal-text {
		margin: 0;
		color: #475569;
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.cookie-option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: #f8fafc;
	}

	.cookie-option input[type='checkbox'] {
		accent-color: var(--primary);
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

