<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import WizardSubmitSection from '$lib/kontakt/wizard/WizardSubmitSection.svelte';

	let {
		currentStep,
		wideLayout = false,
		reviewMandant,
		reviewEinrichtung,
		reviewAbteilung,
		reviewName,
		reviewEmail,
		reviewPhone,
		reviewOrg,
		reviewSubject,
		reviewMessage,
		privacyAccepted = $bindable(),
		showErr,
		toggleError,
		submitting,
		feedback,
		goToStep
	}: {
		currentStep: number;
		wideLayout?: boolean;
		reviewMandant: string;
		reviewEinrichtung: string;
		reviewAbteilung: string;
		reviewName: string;
		reviewEmail: string;
		reviewPhone: string;
		reviewOrg: string;
		reviewSubject: string;
		reviewMessage: string;
		privacyAccepted: boolean;
		showErr: Record<string, boolean>;
		toggleError: (fieldId: string, isValid: boolean) => void;
		submitting: boolean;
		feedback: { kind: 'success' | 'error'; text: string } | null;
		goToStep: (step: number, skipValidate?: boolean) => void;
	} = $props();
</script>

<div
	class="form-step"
	class:is-active={wideLayout || currentStep === 4}
	data-step="4"
	id="step-panel-4"
	role="region"
	aria-labelledby="step-title-4"
	hidden={!wideLayout && currentStep !== 4}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><CircleCheck size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-4">
					{#if wideLayout}
						Kontext
					{:else}
						Bitte prüfen Sie Ihre Angaben
					{/if}
				</h3>
				{#if !wideLayout}
					<p class="section-lead">Stimmt alles? Dann senden Sie die Nachricht mit einem Klick ab.</p>
				{/if}
			</div>
		</div>

		{#if wideLayout}
			<div class="review-card review-card--assistant">
				<p class="review-assistant-lead">
					Ihre Nachricht geht an <strong>{reviewEinrichtung} · {reviewAbteilung}</strong>
					{#if reviewMandant !== '—'}
						<span class="review-assistant-meta">({reviewMandant})</span>
					{/if}
				</p>
				<p class="review-assistant-hint">
					Wir antworten werktags in der Regel innerhalb von 24&nbsp;Stunden. Details zur
					Datenverarbeitung finden Sie in unserer
					<a
						href="https://www.diakoniestiftung-sachsen.de/info/datenschutz"
						target="_blank"
						rel="noopener noreferrer">Datenschutzerklärung</a
					>.
				</p>
			</div>
		{:else}
			<div class="review-card">
				<div class="review-block">
					<h4 class="review-block-title">Empfänger</h4>
					<dl class="review-dl">
						<dt>Organisationsträger</dt>
						<dd>{reviewMandant}</dd>
						<dt>Einrichtung</dt>
						<dd>{reviewEinrichtung}</dd>
						<dt>Fachabteilung</dt>
						<dd>{reviewAbteilung}</dd>
					</dl>
				</div>
				<div class="review-block">
					<h4 class="review-block-title">Kontakt</h4>
					<dl class="review-dl">
						<dt>Name</dt>
						<dd>{reviewName}</dd>
						<dt>E-Mail</dt>
						<dd>{reviewEmail}</dd>
						<dt>Telefon</dt>
						<dd>{reviewPhone}</dd>
						<dt>Organisation</dt>
						<dd>{reviewOrg}</dd>
					</dl>
				</div>
				<div class="review-block review-block--full">
					<h4 class="review-block-title">Nachricht</h4>
					<p class="review-subject">{reviewSubject}</p>
					<div class="review-message">{reviewMessage}</div>
				</div>
			</div>
		{/if}
	</div>

	{#if !wideLayout}
		<WizardSubmitSection
			bind:privacyAccepted
			{showErr}
			{toggleError}
			{submitting}
			{feedback}
			showBackButton={true}
			{goToStep}
		/>
	{/if}
</div>
