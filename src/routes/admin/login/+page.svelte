<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="login-wrapper">
	<div class="login-card">
		<div class="login-header">
			<div class="logo-mark">K</div>
			<h1>Admin-Bereich</h1>
			<p>Melden Sie sich an, um fortzufahren</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return ({ update }) => {
					loading = false;
					update();
				};
			}}
		>
			{#if form?.error}
				<div class="error-banner">{form.error}</div>
			{/if}

			<div class="field">
				<label for="username">Benutzername</label>
				<input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					required
					autofocus
				/>
			</div>

			<div class="field">
				<label for="password">Passwort</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</div>

			<button type="submit" class="btn-login" disabled={loading}>
				{loading ? 'Wird angemeldet…' : 'Anmelden'}
			</button>
		</form>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #f0ebf7;
		font-family: 'Public Sans', system-ui, sans-serif;
	}

	.login-wrapper {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.login-card {
		background: #fff;
		border-radius: 8px;
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.07),
			0 1px 3px rgba(0, 0, 0, 0.05);
		padding: 48px 40px;
		width: 100%;
		max-width: 380px;
	}

	.login-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.logo-mark {
		width: 52px;
		height: 52px;
		background: #5e2d91;
		color: #fff;
		border-radius: 12px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 16px;
	}

	h1 {
		margin: 0 0 6px;
		font-size: 1.4rem;
		color: #1a1a2e;
		font-weight: 700;
	}

	p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		padding: 10px 14px;
		border-radius: 6px;
		font-size: 0.875rem;
		margin-bottom: 20px;
	}

	.field {
		margin-bottom: 18px;
	}

	label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 6px;
	}

	input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.95rem;
		box-sizing: border-box;
		transition: border-color 0.15s;
		outline: none;
	}

	input:focus {
		border-color: #5e2d91;
		box-shadow: 0 0 0 3px rgba(94, 45, 145, 0.1);
	}

	.btn-login {
		width: 100%;
		padding: 11px;
		background: #5e2d91;
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 8px;
		transition: background 0.15s;
	}

	.btn-login:hover:not(:disabled) {
		background: #4a2272;
	}

	.btn-login:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
