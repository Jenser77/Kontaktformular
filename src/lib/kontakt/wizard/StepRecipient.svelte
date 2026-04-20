<script lang="ts">
	import SelectField from '$lib/kontakt/fields/SelectField.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Building2 from '@lucide/svelte/icons/building-2';
	import type { Mandant } from './types';

	let {
		currentStep,
		wideLayout = false,
		routingLoadFailed,
		recipientData,
		mandantId = $bindable(),
		einrichtungId = $bindable(),
		recipientId = $bindable(),
		einrichtungen,
		abteilungen,
		showErr,
		onMandantChange,
		onEinrichtungChange,
		goToStep
	}: {
		currentStep: number;
		/** Desktop single-page: all sections visible, no wizard chrome */
		wideLayout?: boolean;
		routingLoadFailed: boolean;
		recipientData: Mandant[];
		mandantId: string;
		einrichtungId: string;
		recipientId: string;
		einrichtungen: Mandant['einrichtungen'];
		abteilungen: { id: string; name: string }[];
		showErr: Record<string, boolean>;
		onMandantChange: () => void;
		onEinrichtungChange: () => void;
		goToStep: (step: number, skipValidate?: boolean) => void;
	} = $props();

	let mandantOptions = $derived(
		recipientData.map((m) => ({ value: m.id, label: m.name }))
	);
	let einrichtungOptions = $derived(
		einrichtungen.map((e) => ({ value: e.id, label: e.name }))
	);
	let abteilungOptions = $derived(
		abteilungen.map((a) => ({ value: a.id, label: a.name }))
	);
</script>

<div
	class="form-step"
	class:is-active={wideLayout || currentStep === 1}
	data-step="1"
	id="step-panel-1"
	role="region"
	aria-labelledby="step-title-1"
	hidden={!wideLayout && currentStep !== 1}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><Building2 size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-1">Wohin soll Ihre Nachricht?</h3>
				<p class="section-lead">
					Wählen Sie den rechtlichen Träger, die Einrichtung und die zuständige Abteilung.
				</p>
			</div>
		</div>
		<div class="form-grid">
			<SelectField
				id="mandant"
				name="mandant"
				fieldId="mandant"
				label="Organisationsträger (Mandant)"
				required
				bind:value={mandantId}
				emptyLabel={routingLoadFailed ? 'Fehler beim Laden' : 'Bitte wählen...'}
				options={mandantOptions}
				hint={{
					id: 'hint-mandant',
					text: 'Der übergeordnete Träger Ihrer gewünschten Einrichtung — so wird Ihre Anfrage intern korrekt zugeordnet.'
				}}
				{showErr}
				errorMessage="Bitte wählen Sie einen Mandanten aus."
				onchange={onMandantChange}
			/>
			<div class="form-grid-2">
				<SelectField
					id="einrichtung"
					name="einrichtung"
					fieldId="einrichtung"
					label="Einrichtung"
					required
					bind:value={einrichtungId}
					disabled={!mandantId}
					emptyLabel={mandantId ? 'Bitte wählen...' : 'Bitte zuerst Mandant wählen...'}
					options={einrichtungOptions}
					{showErr}
					errorMessage="Bitte wählen Sie eine Einrichtung aus."
					onchange={onEinrichtungChange}
				/>
				<SelectField
					id="recipientId"
					name="recipientId"
					fieldId="recipientId"
					label="Fachabteilung"
					required
					bind:value={recipientId}
					disabled={!einrichtungId}
					emptyLabel={einrichtungId ? 'Bitte wählen...' : 'Bitte zuerst Einrichtung wählen...'}
					options={abteilungOptions}
					{showErr}
					errorMessage="Bitte wählen Sie eine Fachabteilung aus."
				/>
			</div>
		</div>
	</div>
	{#if !wideLayout}
		<div class="wizard-nav">
			<span class="wizard-nav-spacer" aria-hidden="true"></span>
			<button type="button" class="btn-wizard btn-wizard-primary" onclick={() => goToStep(2)}>
				Weiter zu Kontaktdaten
				<span class="btn-wizard-icon" aria-hidden="true"><ArrowRight size={20} strokeWidth={2} /></span>
			</button>
		</div>
	{/if}
</div>
