<script lang="ts">
	import TextField from '$lib/kontakt/fields/TextField.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import User from '@lucide/svelte/icons/user';

	let {
		currentStep,
		wideLayout = false,
		firstName = $bindable(),
		lastName = $bindable(),
		organization = $bindable(),
		email = $bindable(),
		phone = $bindable(),
		showErr,
		toggleError,
		onBlurRequired,
		goToStep
	}: {
		currentStep: number;
		wideLayout?: boolean;
		firstName: string;
		lastName: string;
		organization: string;
		email: string;
		phone: string;
		showErr: Record<string, boolean>;
		toggleError: (fieldId: string, isValid: boolean) => void;
		onBlurRequired: (
			fieldId: string,
			el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		) => void;
		goToStep: (step: number, skipValidate?: boolean) => void;
	} = $props();
</script>

<div
	class="form-step"
	class:is-active={wideLayout || currentStep === 2}
	data-step="2"
	id="step-panel-2"
	role="region"
	aria-labelledby="step-title-2"
	hidden={!wideLayout && currentStep !== 2}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><User size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-2">Wie können wir Sie erreichen?</h3>
				<p class="section-lead">Ihre Daten nutzen wir nur zur Bearbeitung dieser Anfrage.</p>
			</div>
		</div>
		<div class="form-grid-2">
			<TextField
				id="firstName"
				label="Vorname"
				required
				placeholder="Max"
				autocomplete="given-name"
				bind:value={firstName}
				{showErr}
				errorMessage="Bitte geben Sie Ihren Vornamen an."
				{toggleError}
				{onBlurRequired}
			/>
			<TextField
				id="lastName"
				label="Nachname"
				required
				placeholder="Mustermann"
				autocomplete="family-name"
				bind:value={lastName}
				{showErr}
				errorMessage="Bitte geben Sie Ihren Nachnamen an."
				{toggleError}
				{onBlurRequired}
			/>
			<TextField
				id="organization"
				label="Organisation oder Arbeitgeber (optional)"
				placeholder="z. B. Firma oder Verein"
				autocomplete="organization"
				bind:value={organization}
				{showErr}
				fieldId="organization"
				errorMessage=""
				groupClass="col-span-2"
				blurValidate={false}
				{onBlurRequired}
			/>
			<TextField
				id="email"
				label="E-Mail-Adresse"
				required
				type="email"
				placeholder="max.mustermann@beispiel.de"
				autocomplete="email"
				bind:value={email}
				{showErr}
				errorMessage="Bitte geben Sie eine gültige E-Mail-Adresse an."
				{toggleError}
				{onBlurRequired}
			/>
			<TextField
				id="phone"
				label="Telefonnummer (optional)"
				type="tel"
				placeholder="+49 123 456789"
				autocomplete="tel"
				bind:value={phone}
				{showErr}
				fieldId="phone"
				errorMessage=""
				blurValidate={false}
				{onBlurRequired}
			/>
		</div>
	</div>
	{#if !wideLayout}
		<div class="wizard-nav">
			<button type="button" class="btn-wizard btn-wizard-secondary" onclick={() => goToStep(1, true)}>
				<span class="btn-wizard-icon" aria-hidden="true"><ArrowLeft size={20} strokeWidth={2} /></span>
				Zurück
			</button>
			<button type="button" class="btn-wizard btn-wizard-primary" onclick={() => goToStep(3)}>
				Weiter zur Nachricht
				<span class="btn-wizard-icon" aria-hidden="true"><ArrowRight size={20} strokeWidth={2} /></span>
			</button>
		</div>
	{/if}
</div>
