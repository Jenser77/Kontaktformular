<script lang="ts">
	import TextField from '$lib/kontakt/fields/TextField.svelte';
	import TextareaField from '$lib/kontakt/fields/TextareaField.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import MessageCircle from '@lucide/svelte/icons/message-circle';

	let {
		currentStep,
		wideLayout = false,
		subject = $bindable(),
		message = $bindable(),
		recipientReminderLine = '',
		recipientReminderMeta = '',
		showErr,
		toggleError,
		onBlurRequired,
		goToStep
	}: {
		currentStep: number;
		wideLayout?: boolean;
		subject: string;
		message: string;
		/** Desktop: sticky context above subject/message while the aside scrolls away */
		recipientReminderLine?: string;
		recipientReminderMeta?: string;
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
	class:is-active={wideLayout || currentStep === 3}
	data-step="3"
	id="step-panel-3"
	role="region"
	aria-labelledby="step-title-3"
	hidden={!wideLayout && currentStep !== 3}
>
	<div class="form-section">
		<div class="section-header">
			<span class="section-icon" aria-hidden="true"><MessageCircle size={24} strokeWidth={2} /></span>
			<div>
				<h3 class="section-title" id="step-title-3">Ihr Anliegen</h3>
				<p class="section-lead">Je konkreter Ihre Nachricht, desto schneller können wir helfen.</p>
			</div>
		</div>
		{#if wideLayout && recipientReminderLine}
			<div class="kontakt-recipient-reminder" role="status" aria-live="polite">
				<span class="kontakt-recipient-reminder-label">Ihre Nachricht geht an</span>
				<span class="kontakt-recipient-reminder-target">{recipientReminderLine}</span>
				{#if recipientReminderMeta}
					<span class="kontakt-recipient-reminder-meta">({recipientReminderMeta})</span>
				{/if}
			</div>
		{/if}
		<TextField
			id="subject"
			label="Betreff"
			required
			placeholder="Wie können wir helfen?"
			bind:value={subject}
			{showErr}
			errorMessage="Bitte geben Sie einen Betreff an."
			{toggleError}
			{onBlurRequired}
		/>
		<TextareaField
			id="message"
			label="Nachricht"
			required
			placeholder="Beschreiben Sie Ihr Anliegen..."
			rows={wideLayout ? 5 : 7}
			bind:value={message}
			{showErr}
			errorMessage="Bitte geben Sie eine Nachricht ein."
			{toggleError}
			{onBlurRequired}
		/>
	</div>
	{#if !wideLayout}
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
	{/if}
</div>
