<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import MessageCircle from '@lucide/svelte/icons/message-circle';

	let {
		currentStep,
		subject = $bindable(),
		message = $bindable(),
		showErr,
		toggleError,
		onBlurRequired,
		goToStep
	}: {
		currentStep: number;
		subject: string;
		message: string;
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
	class:is-active={currentStep === 3}
	data-step="3"
	id="step-panel-3"
	role="region"
	aria-labelledby="step-title-3"
	hidden={currentStep !== 3}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><MessageCircle size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-3">Ihr Anliegen</h3>
				<p class="section-lead">Je konkreter Ihre Nachricht, desto schneller können wir helfen.</p>
			</div>
		</div>
		<div class="input-group">
			<label class="input-label" for="subject">Betreff <span class="required-star">*</span></label>
			<input
				class="form-input"
				class:error={showErr.subject}
				id="subject"
				name="subject"
				placeholder="Wie können wir helfen?"
				type="text"
				required
				aria-invalid={showErr.subject ? 'true' : undefined}
				aria-describedby="err-subject"
				bind:value={subject}
				onblur={(e) => onBlurRequired('subject', e.currentTarget)}
				oninput={() => showErr.subject && toggleError('subject', true)}
			/>
			<span class="error-msg" class:visible={showErr.subject} id="err-subject" role="alert">
				Bitte geben Sie einen Betreff an.
			</span>
		</div>
		<div class="input-group">
			<label class="input-label" for="message">Nachricht <span class="required-star">*</span></label>
			<textarea
				class="form-textarea"
				class:error={showErr.message}
				id="message"
				name="message"
				placeholder="Beschreiben Sie Ihr Anliegen..."
				rows="7"
				required
				aria-invalid={showErr.message ? 'true' : undefined}
				aria-describedby="err-message"
				bind:value={message}
				onblur={(e) => onBlurRequired('message', e.currentTarget)}
				oninput={() => showErr.message && toggleError('message', true)}
			></textarea>
			<span class="error-msg" class:visible={showErr.message} id="err-message" role="alert">
				Bitte geben Sie eine Nachricht ein.
			</span>
		</div>
	</div>
	<div class="wizard-nav">
		<button type="button" class="btn-wizard btn-wizard-secondary" onclick={() => goToStep(2, true)}>
			<span class="btn-wizard-icon" aria-hidden="true"><ArrowLeft size={20} strokeWidth={2} /></span>
			Zurück
		</button>
		<button type="button" class="btn-wizard btn-wizard-primary" onclick={() => goToStep(4)}>
			Zur Übersicht
			<span class="btn-wizard-icon" aria-hidden="true"><ClipboardCheck size={20} strokeWidth={2} /></span>
		</button>
	</div>
</div>
