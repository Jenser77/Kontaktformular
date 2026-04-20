<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import User from '@lucide/svelte/icons/user';

	let {
		currentStep,
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
	class:is-active={currentStep === 2}
	data-step="2"
	id="step-panel-2"
	role="region"
	aria-labelledby="step-title-2"
	hidden={currentStep !== 2}
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
			<div class="input-group">
				<label class="input-label" for="firstName">Vorname <span class="required-star">*</span></label>
				<input
					class="form-input"
					class:error={showErr.firstName}
					id="firstName"
					name="firstName"
					placeholder="Max"
					type="text"
					required
					autocomplete="given-name"
					aria-invalid={showErr.firstName ? 'true' : undefined}
					aria-describedby="err-firstName"
					bind:value={firstName}
					onblur={(e) => onBlurRequired('firstName', e.currentTarget)}
					oninput={() => showErr.firstName && toggleError('firstName', true)}
				/>
				<span class="error-msg" class:visible={showErr.firstName} id="err-firstName" role="alert">
					Bitte geben Sie Ihren Vornamen an.
				</span>
			</div>
			<div class="input-group">
				<label class="input-label" for="lastName">Nachname <span class="required-star">*</span></label>
				<input
					class="form-input"
					class:error={showErr.lastName}
					id="lastName"
					name="lastName"
					placeholder="Mustermann"
					type="text"
					required
					autocomplete="family-name"
					aria-invalid={showErr.lastName ? 'true' : undefined}
					aria-describedby="err-lastName"
					bind:value={lastName}
					onblur={(e) => onBlurRequired('lastName', e.currentTarget)}
					oninput={() => showErr.lastName && toggleError('lastName', true)}
				/>
				<span class="error-msg" class:visible={showErr.lastName} id="err-lastName" role="alert">
					Bitte geben Sie Ihren Nachnamen an.
				</span>
			</div>
			<div class="input-group col-span-2">
				<label class="input-label" for="organization">Organisation oder Arbeitgeber (optional)</label>
				<input
					class="form-input"
					id="organization"
					name="organization"
					placeholder="z. B. Firma oder Verein"
					type="text"
					autocomplete="organization"
					bind:value={organization}
				/>
			</div>
			<div class="input-group">
				<label class="input-label" for="email">E-Mail-Adresse <span class="required-star">*</span></label>
				<input
					class="form-input"
					class:error={showErr.email}
					id="email"
					name="email"
					placeholder="max.mustermann@beispiel.de"
					type="email"
					required
					autocomplete="email"
					aria-invalid={showErr.email ? 'true' : undefined}
					aria-describedby="err-email"
					bind:value={email}
					onblur={(e) => onBlurRequired('email', e.currentTarget)}
					oninput={() => showErr.email && toggleError('email', true)}
				/>
				<span class="error-msg" class:visible={showErr.email} id="err-email" role="alert">
					Bitte geben Sie eine gültige E-Mail-Adresse an.
				</span>
			</div>
			<div class="input-group">
				<label class="input-label" for="phone">Telefonnummer (optional)</label>
				<input
					class="form-input"
					id="phone"
					name="phone"
					placeholder="+49 123 456789"
					type="tel"
					autocomplete="tel"
					bind:value={phone}
				/>
			</div>
		</div>
	</div>
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
</div>
