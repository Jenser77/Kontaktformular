<script lang="ts">
	let {
		id,
		name = id,
		label,
		required = false,
		value = $bindable(),
		disabled = false,
		emptyLabel,
		options,
		hint,
		showErr,
		fieldId = id,
		errorMessage,
		groupClass = '',
		onchange
	}: {
		id: string;
		name?: string;
		label: string;
		required?: boolean;
		value: string;
		disabled?: boolean;
		emptyLabel: string;
		options: { value: string; label: string }[];
		hint?: { id: string; text: string };
		showErr: Record<string, boolean>;
		fieldId?: string;
		errorMessage: string;
		groupClass?: string;
		onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
	} = $props();

	let hasErr = $derived(!!showErr[fieldId]);
	let errId = $derived(`err-${fieldId}`);
	let describedBy = $derived(
		[hint?.id, errId].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="input-group {groupClass}">
	<label class="input-label" for={id}>
		{label}
		{#if required}<span class="required-star">*</span>{/if}
	</label>
	{#if hint}
		<p class="field-hint" id={hint.id}>{hint.text}</p>
	{/if}
	<select
		class="form-select"
		class:error={hasErr}
		{id}
		{name}
		{required}
		{disabled}
		aria-describedby={describedBy}
		aria-invalid={hasErr ? 'true' : undefined}
		bind:value
		{onchange}
	>
		<option value="" disabled>{emptyLabel}</option>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<span class="error-msg" class:visible={hasErr} id={errId} role="alert">
		{errorMessage}
	</span>
</div>
