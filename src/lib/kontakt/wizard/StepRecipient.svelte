<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Building2 from '@lucide/svelte/icons/building-2';
	import type { Mandant } from './types';

	let {
		currentStep,
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
</script>

<div
	class="form-step"
	class:is-active={currentStep === 1}
	data-step="1"
	id="step-panel-1"
	role="region"
	aria-labelledby="step-title-1"
	hidden={currentStep !== 1}
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
			<div class="input-group">
				<label class="input-label" for="mandant">
					Organisationsträger (Mandant) <span class="required-star">*</span>
				</label>
				<p class="field-hint" id="hint-mandant">
					Der übergeordnete Träger Ihrer gewünschten Einrichtung — so wird Ihre Anfrage intern korrekt
					zugeordnet.
				</p>
				<select
					class="form-select"
					class:error={showErr.mandant}
					id="mandant"
					name="mandant"
					required
					aria-describedby="hint-mandant err-mandant"
					aria-invalid={showErr.mandant ? 'true' : undefined}
					bind:value={mandantId}
					onchange={onMandantChange}
				>
					<option value="" disabled>
						{routingLoadFailed ? 'Fehler beim Laden' : 'Bitte wählen...'}
					</option>
					{#each recipientData as m (m.id)}
						<option value={m.id}>{m.name}</option>
					{/each}
				</select>
				<span class="error-msg" class:visible={showErr.mandant} id="err-mandant" role="alert">
					Bitte wählen Sie einen Mandanten aus.
				</span>
			</div>
			<div class="form-grid-2">
				<div class="input-group">
					<label class="input-label" for="einrichtung">
						Einrichtung <span class="required-star">*</span>
					</label>
					<select
						class="form-select"
						class:error={showErr.einrichtung}
						id="einrichtung"
						name="einrichtung"
						required
						disabled={!mandantId}
						aria-invalid={showErr.einrichtung ? 'true' : undefined}
						aria-describedby="err-einrichtung"
						bind:value={einrichtungId}
						onchange={onEinrichtungChange}
					>
						<option value="" disabled>
							{mandantId ? 'Bitte wählen...' : 'Bitte zuerst Mandant wählen...'}
						</option>
						{#each einrichtungen as ein (ein.id)}
							<option value={ein.id}>{ein.name}</option>
						{/each}
					</select>
					<span class="error-msg" class:visible={showErr.einrichtung} id="err-einrichtung" role="alert">
						Bitte wählen Sie eine Einrichtung aus.
					</span>
				</div>
				<div class="input-group">
					<label class="input-label" for="recipientId">
						Fachabteilung <span class="required-star">*</span>
					</label>
					<select
						class="form-select"
						class:error={showErr.recipientId}
						id="recipientId"
						name="recipientId"
						required
						disabled={!einrichtungId}
						aria-invalid={showErr.recipientId ? 'true' : undefined}
						aria-describedby="err-recipientId"
						bind:value={recipientId}
					>
						<option value="" disabled>
							{einrichtungId ? 'Bitte wählen...' : 'Bitte zuerst Einrichtung wählen...'}
						</option>
						{#each abteilungen as abt (abt.id)}
							<option value={abt.id}>{abt.name}</option>
						{/each}
					</select>
					<span class="error-msg" class:visible={showErr.recipientId} id="err-recipientId" role="alert">
						Bitte wählen Sie eine Fachabteilung aus.
					</span>
				</div>
			</div>
		</div>
	</div>
	<div class="wizard-nav">
		<span class="wizard-nav-spacer" aria-hidden="true"></span>
		<button type="button" class="btn-wizard btn-wizard-primary" onclick={() => goToStep(2)}>
			Weiter zu Kontaktdaten
			<span class="btn-wizard-icon" aria-hidden="true"><ArrowRight size={20} strokeWidth={2} /></span>
		</button>
	</div>
</div>
