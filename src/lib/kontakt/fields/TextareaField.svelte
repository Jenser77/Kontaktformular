<script lang="ts">
	let {
		id,
		name = id,
		label,
		required = false,
		placeholder,
		rows = 7,
		value = $bindable(),
		showErr,
		fieldId = id,
		errorMessage,
		groupClass = '',
		onBlurRequired,
		toggleError
	}: {
		id: string;
		name?: string;
		label: string;
		required?: boolean;
		placeholder?: string;
		rows?: number;
		value: string;
		showErr: Record<string, boolean>;
		fieldId?: string;
		errorMessage: string;
		groupClass?: string;
		onBlurRequired: (
			fieldId: string,
			el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		) => void;
		toggleError?: (fieldId: string, isValid: boolean) => void;
	} = $props();

	let hasErr = $derived(!!showErr[fieldId]);
	let errId = $derived(`err-${fieldId}`);
</script>

<div class="input-group {groupClass}">
	<label class="input-label" for={id}>
		{label}
		{#if required}<span class="required-star">*</span>{/if}
	</label>
	<textarea
		class="form-textarea"
		class:error={hasErr}
		{id}
		{name}
		{placeholder}
		{rows}
		{required}
		aria-invalid={hasErr ? 'true' : undefined}
		aria-describedby={errId}
		bind:value
		onblur={(e) => onBlurRequired(fieldId, e.currentTarget)}
		oninput={() => toggleError && showErr[fieldId] && toggleError(fieldId, true)}
	></textarea>
	<span class="error-msg" class:visible={hasErr} id={errId} role="alert">
		{errorMessage}
	</span>
</div>
