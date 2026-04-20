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
	import '../app.css';

	type StoredConsent = {
		necessary: true;
		/** v2: no optional categories; kept for migration */
		acknowledgedAt: string;
	};

	let { children } = $props();
	let showConsentBanner = $state(false);
	let showConsentSettings = $state(false);
	let consentLoaded = $state(false);

	onMount(() => {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as Partial<StoredConsent> & { updatedAt?: string };
				if (parsed.necessary === true || parsed.updatedAt) {
					showConsentBanner = false;
				} else {
					showConsentBanner = true;
				}
			} catch {
				showConsentBanner = true;
			}
		} else {
			showConsentBanner = true;
		}
		consentLoaded = true;
	});

	function persistAcknowledgement() {
		const payload: StoredConsent = {
			necessary: true,
			acknowledgedAt: new Date().toISOString()
		};
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
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

	function revokeConsent() {
		localStorage.removeItem(CONSENT_STORAGE_KEY);
		showConsentBanner = true;
		showConsentSettings = false;
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
</svelte:head>

{@render children()}

{#if consentLoaded && showConsentBanner}
	<section class="cookie-banner" aria-label="Cookie-Hinweis">
		<div class="cookie-banner-copy">
			<p class="cookie-banner-title">Cookies</p>
			<p>
				Wir setzen nur technisch notwendige Cookies ein (z.&nbsp;B. für Sicherheit und das Kontaktformular).
				Es werden keine Statistik- oder Marketing-Cookies verwendet.
			</p>
		</div>
		<div class="cookie-actions cookie-actions--banner">
			<button type="button" class="cookie-btn cookie-btn-primary" onclick={persistAcknowledgement}>
				Nur notwendige Cookies
			</button>
			<button type="button" class="cookie-btn cookie-btn-primary" onclick={persistAcknowledgement}>
				Bestätigen &amp; schließen
			</button>
			<button
				type="button"
				class="cookie-btn cookie-btn-quiet"
				onclick={() => (showConsentSettings = true)}
			>
				Details
			</button>
		</div>
	</section>
{/if}

{#if consentLoaded}
	<button
		type="button"
		class="cookie-settings-fab"
		onclick={() => (showConsentSettings = true)}
		aria-label="Cookie-Hinweis öffnen"
	>
		Cookie-Hinweis
	</button>
{/if}

{#if consentLoaded && showConsentSettings}
	<div
		class="cookie-modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Details schließen"
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
			<h2 id="cookie-settings-title">Technisch notwendige Cookies</h2>
			<p class="cookie-modal-text">
				Diese Anwendung verwendet ausschließlich Cookies, die für den Betrieb erforderlich sind — etwa zum
				Schutz vor Missbrauch (CSRF) und zur sicheren Nutzung des Formulars. Es werden keine optionalen
				Kategorien wie Statistik oder Marketing eingesetzt.
			</p>
			<p class="cookie-modal-text">
				Weitere Informationen finden Sie in der
				<a
					href="https://www.diakoniestiftung-sachsen.de/info/datenschutz"
					target="_blank"
					rel="noopener noreferrer">Datenschutzerklärung</a
				>.
			</p>
			<div class="cookie-actions cookie-actions--modal">
				<button type="button" class="cookie-btn cookie-btn-muted" onclick={closeConsentSettings}>
					Schließen
				</button>
				<button type="button" class="cookie-btn cookie-btn-danger" onclick={revokeConsent}>
					Hinweis erneut anzeigen
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		left: var(--space-4);
		right: var(--space-4);
		bottom: var(--space-4);
		z-index: 1000;
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
		justify-content: space-between;
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: #fff;
		padding: var(--space-4) 1.125rem;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
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
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.cookie-actions--banner {
		justify-content: flex-end;
		align-items: center;
	}

	.cookie-actions--modal {
		margin-top: var(--space-2);
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

	.cookie-btn-quiet {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.45);
		font-weight: 500;
	}

	.cookie-btn-quiet:hover,
	.cookie-btn-quiet:focus-visible {
		background: rgba(255, 255, 255, 0.1);
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

	.cookie-modal .cookie-btn-danger {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.cookie-modal .cookie-btn:focus-visible {
		outline: 2px solid var(--primary);
	}

	.cookie-settings-fab {
		position: fixed;
		right: var(--space-4);
		bottom: var(--space-4);
		z-index: 999;
		border: 0;
		background: var(--primary);
		color: #fff;
		padding: 10px 14px;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: var(--shadow-fab);
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

	.cookie-modal-text a {
		color: var(--primary);
		font-weight: 600;
	}

	@media (max-width: 640px) {
		.cookie-banner {
			flex-direction: column;
			align-items: flex-start;
		}

		.cookie-actions--banner {
			width: 100%;
			flex-direction: column;
			align-items: stretch;
		}

		.cookie-settings-fab {
			bottom: 82px;
		}
	}
</style>
