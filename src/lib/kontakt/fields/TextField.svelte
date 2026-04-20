<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		id,
		name = id,
		label,
		required = false,
		placeholder,
		type = 'text',
		autocomplete,
		value = $bindable(),
		showErr,
		fieldId = id,
		errorMessage,
		groupClass = '',
		blurValidate = true,
		onBlurRequired,
		toggleError
	}: {
		id: string;
		name?: string;
		label: string;
		required?: boolean;
		placeholder?: string;
		type?: string;
		autocomplete?: string;
		value: string;
		showErr: Record<string, boolean>;
		fieldId?: string;
		errorMessage: string;
		groupClass?: string;
		/** If false, skip blur validation (optional fields). */
		blurValidate?: boolean;
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
	<input
		class="form-input"
		class:error={hasErr}
		{id}
		{name}
		{placeholder}
		{type}
		{required}
		autocomplete={autocomplete as HTMLInputAttributes['autocomplete']}
		aria-invalid={hasErr ? 'true' : undefined}
		aria-describedby={errId}
		bind:value
		onblur={blurValidate ? (e) => onBlurRequired(fieldId, e.currentTarget) : undefined}
		oninput={() => toggleError && showErr[fieldId] && toggleError(fieldId, true)}
	/>
	<span class="error-msg" class:visible={hasErr} id={errId} role="alert">
		{errorMessage}
	</span>
</div>
