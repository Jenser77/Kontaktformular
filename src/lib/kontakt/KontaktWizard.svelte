<script lang="ts">
	import { onMount } from 'svelte';
	import StepContact from '$lib/kontakt/wizard/StepContact.svelte';
	import StepMessage from '$lib/kontakt/wizard/StepMessage.svelte';
	import StepRecipient from '$lib/kontakt/wizard/StepRecipient.svelte';
	import StepReview from '$lib/kontakt/wizard/StepReview.svelte';
	import WizardProgress from '$lib/kontakt/wizard/WizardProgress.svelte';
	import type { Mandant } from '$lib/kontakt/wizard/types';
	import {
		firstInvalidInStep,
		STEP_LABELS,
		stepFields,
		TOTAL_STEPS,
		validateField
	} from '$lib/kontakt/wizard/validation';

	let recipientData = $state<Mandant[]>([]);
	let routingLoadFailed = $state(false);

	let mandantId = $state('');
	let einrichtungId = $state('');
	let recipientId = $state('');

	let firstName = $state('');
	let lastName = $state('');
	let organization = $state('');
	let email = $state('');
	let phone = $state('');
	let subject = $state('');
	let message = $state('');
	let privacyAccepted = $state(false);
	let honeypotAlt = $state('');

	let currentStep = $state(1);
	let maxStepVisited = $state(1);
	let submitting = $state(false);
	let feedback = $state<{ kind: 'success' | 'error'; text: string } | null>(null);

	let showErr = $state<Record<string, boolean>>({});

	let einrichtungen = $derived(
		recipientData.find((m) => m.id === mandantId)?.einrichtungen ?? []
	);
	let abteilungen = $derived(einrichtungen.find((e) => e.id === einrichtungId)?.abteilungen ?? []);

	let progressPct = $derived(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);

	const fieldValues = $derived({
		mandantId,
		einrichtungId,
		recipientId,
		firstName,
		lastName,
		email,
		subject,
		message
	});

	let reviewMandant = $derived(recipientData.find((m) => m.id === mandantId)?.name ?? '—');
	let reviewEinrichtung = $derived(einrichtungen.find((e) => e.id === einrichtungId)?.name ?? '—');
	let reviewAbteilung = $derived(abteilungen.find((a) => a.id === recipientId)?.name ?? '—');
	let reviewName = $derived(`${firstName} ${lastName}`.trim() || '—');
	let reviewEmail = $derived(email.trim() || '—');
	let reviewPhone = $derived(phone.trim() || '—');
	let reviewOrg = $derived(organization.trim() || '—');
	let reviewSubject = $derived(subject.trim() || '—');
	let reviewMessage = $derived(message.trim() || '—');

	function prefersReducedMotion() {
		return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function scrollWizardIntoView() {
		document.getElementById('kontakt-main')?.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'start'
		});
	}

	onMount(() => {
		(async () => {
			try {
				const response = await fetch('/api/recipients');
				const data = await response.json();
				if (data.success) {
					recipientData = data.data;
				} else {
					routingLoadFailed = true;
				}
			} catch {
				routingLoadFailed = true;
			}
		})();
	});

	function toggleError(fieldId: string, isValid: boolean) {
		if (isValid) {
			const next = { ...showErr };
			delete next[fieldId];
			showErr = next;
		} else {
			showErr = { ...showErr, [fieldId]: true };
		}
	}

	function validateStep(step: number): boolean {
		const ids = stepFields[step];
		if (!ids) return true;
		let ok = true;
		for (const id of ids) {
			const v = validateField(id, fieldValues);
			toggleError(id, v);
			if (!v) ok = false;
		}
		return ok;
	}

	function focusField(fieldId: string) {
		const el = document.getElementById(fieldId) as HTMLElement | null;
		el?.focus({ preventScroll: true });
		el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
	}

	function setStepVisibility() {
		scrollWizardIntoView();
		const panel = document.querySelector(`.form-step[data-step="${currentStep}"]`);
		const focusable = panel?.querySelector(
			'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
		) as HTMLElement | null;
		if (focusable && currentStep !== 4) {
			focusable.focus({ preventScroll: true });
		}
	}

	function goToStep(step: number, skipValidate = false) {
		if (step < 1 || step > TOTAL_STEPS) return;
		if (step > currentStep && !skipValidate) {
			if (!validateStep(currentStep)) {
				const bad = firstInvalidInStep(currentStep, fieldValues);
				if (bad) focusField(bad);
				return;
			}
		}
		currentStep = step;
		maxStepVisited = Math.max(maxStepVisited, step);
		setStepVisibility();
	}

	function handleGoStep(target: number) {
		if (Number.isNaN(target) || target > maxStepVisited) return;
		if (target < currentStep) {
			goToStep(target, true);
			return;
		}
		if (target === currentStep) return;
		for (let s = currentStep; s < target; s += 1) {
			if (!validateStep(s)) {
				const bad = firstInvalidInStep(s, fieldValues);
				if (bad) focusField(bad);
				goToStep(s, true);
				return;
			}
		}
		goToStep(target, true);
	}

	function validateAllForSubmit(): boolean {
		let ok = true;
		const required = [
			'mandant',
			'einrichtung',
			'recipientId',
			'firstName',
			'lastName',
			'email',
			'subject',
			'message'
		];
		for (const id of required) {
			const v = validateField(id, fieldValues);
			toggleError(id, v);
			if (!v) ok = false;
		}
		if (!privacyAccepted) {
			showErr = { ...showErr, privacyAccepted: true };
			ok = false;
		} else {
			const next = { ...showErr };
			delete next.privacyAccepted;
			showErr = next;
		}
		return ok;
	}

	function resetAfterSuccess() {
		mandantId = '';
		einrichtungId = '';
		recipientId = '';
		firstName = '';
		lastName = '';
		organization = '';
		email = '';
		phone = '';
		subject = '';
		message = '';
		privacyAccepted = false;
		showErr = {};
		currentStep = 1;
		maxStepVisited = 1;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		feedback = null;

		if (currentStep !== 4) {
			goToStep(4);
			return;
		}

		if (!validateAllForSubmit()) {
			const fields = [
				'mandant',
				'einrichtung',
				'recipientId',
				'firstName',
				'lastName',
				'email',
				'subject',
				'message',
				'privacyAccepted'
			];
			for (const id of fields) {
				if (id === 'privacyAccepted') {
					if (!privacyAccepted) {
						document.getElementById('privacyAccepted')?.focus();
						break;
					}
				} else if (!validateField(id, fieldValues)) {
					const stepEntry = Object.entries(stepFields).find(([, arr]) => arr.includes(id));
					if (stepEntry) goToStep(Number(stepEntry[0]), true);
					focusField(id);
					break;
				}
			}
			return;
		}

		submitting = true;
		const payload: Record<string, unknown> = {
			firstName,
			lastName,
			organization: organization || undefined,
			email,
			phone: phone || undefined,
			subject,
			message,
			privacyAccepted,
			recipientId
		};
		if (honeypotAlt.trim()) payload.phone_alt = honeypotAlt;

		try {
			const csrfToken = readCookie('kf_csrf');
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrfToken
				},
				body: JSON.stringify(payload)
			});
			const result = await response.json();

			if (response.ok) {
				resetAfterSuccess();
				feedback = {
					kind: 'success',
					text: result.message || 'Ihre Nachricht wurde erfolgreich gesendet.'
				};
			} else {
				feedback = {
					kind: 'error',
					text: result.error || 'Es ist ein Fehler aufgetreten. Bitte probieren Sie es später erneut.'
				};
			}
		} catch {
			feedback = {
				kind: 'error',
				text: 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder versuchen Sie es später erneut.'
			};
		} finally {
			submitting = false;
		}
	}

	function onMandantChange() {
		einrichtungId = '';
		recipientId = '';
	}

	function onEinrichtungChange() {
		recipientId = '';
	}

	function readCookie(name: string): string {
		if (typeof document === 'undefined') return '';
		const entries = document.cookie.split(';').map((part) => part.trim());
		const hit = entries.find((entry) => entry.startsWith(`${name}=`));
		if (!hit) return '';
		return decodeURIComponent(hit.slice(name.length + 1));
	}

	function onBlurRequired(fieldId: string, el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
		const panel = el.closest('.form-step');
		if (!panel?.classList.contains('is-active')) return;

		if (fieldId === 'privacyAccepted') return;

		let isValid: boolean;
		if (el.type === 'checkbox') {
			isValid = (el as HTMLInputElement).checked;
		} else if (el.type === 'email') {
			isValid = el.value.trim() !== '' && validateField('email', { ...fieldValues, email: el.value });
		} else {
			isValid = el.value.trim() !== '';
		}
		toggleError(fieldId, isValid);
	}
</script>

<main class="main-content-new" id="kontakt-main">
	<div class="form-wrapper form-wrapper--premium">
		<form
			id="contactForm"
			class="contact-form-new contact-form-wizard"
			novalidate
			onsubmit={handleSubmit}
		>
			<div class="wizard-intro">
				<p class="wizard-intro-text">
					In vier kurzen Schritten — Ihre Anfrage erreicht genau die richtige Fachabteilung.
				</p>
			</div>

			<div class="honeypot-trap" aria-hidden="true">
				<label for="contact_hp_website">Website</label>
				<input
					type="text"
					name="phone_alt"
					id="contact_hp_website"
					tabindex="-1"
					autocomplete="off"
					bind:value={honeypotAlt}
				/>
			</div>

			<WizardProgress
				{currentStep}
				{maxStepVisited}
				{progressPct}
				onGoStep={handleGoStep}
			/>

			<p class="wizard-step-hint sr-only" aria-live="polite">{STEP_LABELS[currentStep] ?? ''}</p>

			<StepRecipient
				{currentStep}
				{routingLoadFailed}
				{recipientData}
				bind:mandantId
				bind:einrichtungId
				bind:recipientId
				{einrichtungen}
				{abteilungen}
				{showErr}
				onMandantChange={onMandantChange}
				onEinrichtungChange={onEinrichtungChange}
				goToStep={goToStep}
			/>

			<StepContact
				{currentStep}
				bind:firstName
				bind:lastName
				bind:organization
				bind:email
				bind:phone
				{showErr}
				{toggleError}
				onBlurRequired={onBlurRequired}
				goToStep={goToStep}
			/>

			<StepMessage
				{currentStep}
				bind:subject
				bind:message
				{showErr}
				{toggleError}
				onBlurRequired={onBlurRequired}
				goToStep={goToStep}
			/>

			<StepReview
				{currentStep}
				{reviewMandant}
				{reviewEinrichtung}
				{reviewAbteilung}
				{reviewName}
				{reviewEmail}
				{reviewPhone}
				{reviewOrg}
				{reviewSubject}
				{reviewMessage}
				bind:privacyAccepted
				{showErr}
				{toggleError}
				{submitting}
				{feedback}
				goToStep={goToStep}
			/>
		</form>
	</div>
</main>
