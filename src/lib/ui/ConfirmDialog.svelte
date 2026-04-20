<script lang="ts">
	import { tick } from "svelte";

	interface Props {
		open: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		title = "Bestätigen",
		message,
		confirmText = "OK",
		cancelText = "Abbrechen",
		onConfirm,
		onCancel,
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let confirmButtonEl = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (open) {
			void tick().then(() => {
				if (dialogEl === el && open && !el.open) {
					el.showModal();
					void tick().then(() => confirmButtonEl?.focus());
				}
			});
		} else if (el.open) {
			el.close();
		}
	});

	function finalizeConfirm() {
		onConfirm();
		open = false;
		dialogEl?.close();
	}

	function finalizeCancel() {
		onCancel();
		open = false;
		dialogEl?.close();
	}

	function onDialogKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			finalizeCancel();
			return;
		}
		if (e.key === "Enter") {
			const t = e.target as HTMLElement;
			if (t.closest("button")) return;
			e.preventDefault();
			finalizeConfirm();
		}
	}

	function onBackdropMouseDown(e: MouseEvent) {
		if (e.target === e.currentTarget) finalizeCancel();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="confirm-dialog"
	aria-labelledby="confirm-dialog-title"
	aria-describedby="confirm-dialog-desc"
	aria-modal="true"
	onkeydown={onDialogKeydown}
	onmousedown={onBackdropMouseDown}
>
	<div class="confirm-dialog-panel">
		<h2 id="confirm-dialog-title" class="confirm-dialog-title">{title}</h2>
		<p id="confirm-dialog-desc" class="confirm-dialog-message">{message}</p>
		<div class="confirm-dialog-actions">
			<button type="button" class="confirm-btn confirm-btn-cancel" onclick={finalizeCancel}>{cancelText}</button>
			<button type="button" class="confirm-btn confirm-btn-ok" bind:this={confirmButtonEl} onclick={finalizeConfirm}>{confirmText}</button>
		</div>
	</div>
</dialog>

<style>
	dialog.confirm-dialog {
		padding: 0;
		border: none;
		background: transparent;
		max-width: calc(100vw - 2rem);
	}

	dialog.confirm-dialog::backdrop {
		background: rgba(0, 0, 0, 0.45);
	}

	.confirm-dialog-panel {
		background: #fff;
		border-radius: var(--radius-sm, 6px);
		padding: 1.25rem 1.5rem;
		min-width: min(100%, 320px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
	}

	.confirm-dialog-title {
		margin: 0 0 0.75rem;
		font-size: 1.1rem;
		color: #3c1361;
	}

	.confirm-dialog-message {
		margin: 0 0 1.25rem;
		line-height: 1.45;
		color: #333;
	}

	.confirm-dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.confirm-btn {
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm, 6px);
		font-weight: 600;
		cursor: pointer;
		border: none;
		font-size: 0.9rem;
	}

	.confirm-btn-cancel {
		background: #e8e8e8;
		color: #333;
	}

	.confirm-btn-ok {
		background: #5e2d91;
		color: #fff;
	}
</style>
