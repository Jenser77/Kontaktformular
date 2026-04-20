<script lang="ts">
	import type { ContactView } from "./types";

	interface Props {
		contact: ContactView;
		onClose: () => void;
	}

	let { contact, onClose }: Props = $props();

	function handleDetailKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") onClose();
	}
</script>

<div
	class="detail-panel"
	role="dialog"
	aria-modal="true"
	aria-labelledby="detail-title"
	tabindex="-1"
	onkeydown={handleDetailKeydown}
>
	<div class="detail-header">
		<h3 id="detail-title">Details zur Anfrage</h3>
		<button type="button" class="btn btn-close" onclick={onClose} aria-label="Details schließen">Schließen</button>
	</div>
	<div class="detail-grid">
		<strong>Name:</strong>
		<span>{contact.firstName} {contact.lastName}</span>
		<strong>Organisation:</strong>
		<span>{contact.organization || "-"}</span>
		<strong>E-Mail:</strong>
		<span><a href="mailto:{contact.email}">{contact.email}</a></span>
		<strong>Telefon:</strong>
		<span>{contact.phone || "-"}</span>
		<strong>Betreff:</strong>
		<span>{contact.subject}</span>
		<strong>Empfänger:</strong>
		<span>{contact.recipientLabel ?? contact.targetRecipient ?? "—"}</span>
		<strong>Nachricht:</strong>
		<p class="message-text">{contact.message}</p>
	</div>
</div>
