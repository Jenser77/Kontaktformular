<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Pencil from '@lucide/svelte/icons/pencil';

	let {
		currentStep,
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
	class:is-active={currentStep === 4}
	data-step="4"
	id="step-panel-4"
	role="region"
	aria-labelledby="step-title-4"
	hidden={currentStep !== 4}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><CircleCheck size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-4">Bitte prüfen Sie Ihre Angaben</h3>
				<p class="section-lead">Stimmt alles? Dann senden Sie die Nachricht mit einem Klick ab.</p>
			</div>
		</div>
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
	</div>

	<div class="submit-section submit-section--wizard">
		<label class="privacy-label">
			<input
				class="privacy-checkbox"
				id="privacyAccepted"
				name="privacyAccepted"
				type="checkbox"
				required
				bind:checked={privacyAccepted}
				onchange={() => {
					if (privacyAccepted) toggleError('privacyAccepted', true);
				}}
			/>
			<span class="privacy-text"
				>Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen dauerhaft gespeichert
				werden. Weitere Informationen finden Sie in unserer
				<a
					href="https://www.diakoniestiftung-sachsen.de/info/datenschutz"
					target="_blank"
					rel="noopener noreferrer">Datenschutzerklärung</a
				>. <span class="required-star">*</span></span
			>
		</label>
		<span class="error-msg" class:visible={showErr.privacyAccepted} id="err-privacyAccepted" role="alert">
			Bitte stimmen Sie der Datenschutzerklärung zu.
		</span>

		<div class="wizard-nav wizard-nav--final">
			<button type="button" class="btn-wizard btn-wizard-secondary" onclick={() => goToStep(3, true)}>
				<span class="btn-wizard-icon" aria-hidden="true"><Pencil size={20} strokeWidth={2} /></span>
				Noch anpassen
			</button>
			<button class="btn-submit" type="submit" disabled={submitting}>
				<span class="btn-text" class:hidden={submitting}>Nachricht absenden</span>
				<div class="spinner" class:hidden={!submitting} aria-hidden="true">
					<svg
						class="animate-spin"
						style="height: 1.5rem; width: 1.5rem; color: #fff;"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							style="opacity: 0.75;"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
			</button>
		</div>
		{#if feedback}
			<div
				id="form-feedback"
				class="form-feedback"
				class:success={feedback.kind === 'success'}
				class:error={feedback.kind === 'error'}
				role="status"
			>
				{feedback.text}
			</div>
		{/if}
	</div>
</div>
