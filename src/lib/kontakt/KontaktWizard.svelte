<script lang="ts">
	import { onMount } from 'svelte';
	import { EMAIL_REGEX } from '$lib/constants';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Building2 from '@lucide/svelte/icons/building-2';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import User from '@lucide/svelte/icons/user';

	type Abteilung = { id: string; name: string };
	type Einrichtung = { id: string; name: string; abteilungen: Abteilung[] };
	type Mandant = { id: string; name: string; einrichtungen: Einrichtung[] };

	const TOTAL_STEPS = 4;
	const STEP_LABELS = [
		'',
		'Schritt 1: Empfänger',
		'Schritt 2: Kontaktdaten',
		'Schritt 3: Nachricht',
		'Schritt 4: Prüfen und absenden'
	];

	const stepFields: Record<number, string[]> = {
		1: ['mandant', 'einrichtung', 'recipientId'],
		2: ['firstName', 'lastName', 'email'],
		3: ['subject', 'message']
	};


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

	function validateField(fieldId: string): boolean {
		switch (fieldId) {
			case 'mandant':
				return mandantId.trim() !== '';
			case 'einrichtung':
				return einrichtungId.trim() !== '';
			case 'recipientId':
				return recipientId.trim() !== '';
			case 'firstName':
				return firstName.trim() !== '';
			case 'lastName':
				return lastName.trim() !== '';
			case 'email':
				return email.trim() !== '' && EMAIL_REGEX.test(email.trim());
			case 'subject':
				return subject.trim() !== '';
			case 'message':
				return message.trim() !== '';
			default:
				return true;
		}
	}

	function validateStep(step: number): boolean {
		const ids = stepFields[step];
		if (!ids) return true;
		let ok = true;
		for (const id of ids) {
			const v = validateField(id);
			toggleError(id, v);
			if (!v) ok = false;
		}
		return ok;
	}

	function firstInvalidInStep(step: number): string | null {
		for (const id of stepFields[step] ?? []) {
			if (!validateField(id)) return id;
		}
		return null;
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
				const bad = firstInvalidInStep(currentStep);
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
				const bad = firstInvalidInStep(s);
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
			const v = validateField(id);
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
				} else if (!validateField(id)) {
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
			isValid = el.value.trim() !== '' && EMAIL_REGEX.test(el.value.trim());
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

			<nav class="wizard-progress" aria-label="Formularschritte">
				<ol class="wizard-progress-track">
					{#each [1, 2, 3, 4] as n (n)}
						<li
							class="wizard-progress-item"
							class:is-active={currentStep === n}
							class:is-complete={n < currentStep}
							data-step-indicator={n}
						>
							<button
								type="button"
								class="wizard-progress-btn"
								disabled={n > maxStepVisited}
								aria-current={currentStep === n ? 'step' : undefined}
								onclick={() => handleGoStep(n)}
							>
								<span class="wizard-progress-num">{n}</span>
								<span class="wizard-progress-label"
									>{n === 1
										? 'Empfänger'
										: n === 2
											? 'Kontakt'
											: n === 3
												? 'Nachricht'
												: 'Prüfen'}</span
								>
							</button>
						</li>
					{/each}
				</ol>
				<div class="wizard-progress-bar-wrap">
					<p class="wizard-step-counter" aria-live="polite">
						Schritt {currentStep} von {TOTAL_STEPS}
					</p>
					<div class="wizard-progress-bar" aria-hidden="true">
						<div class="wizard-progress-fill" style="width: {progressPct}%"></div>
					</div>
				</div>
			</nav>

			<p class="wizard-step-hint sr-only" aria-live="polite">{STEP_LABELS[currentStep] ?? ''}</p>

			<!-- Schritt 1 -->
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
								Der übergeordnete Träger Ihrer gewünschten Einrichtung — so wird Ihre Anfrage intern
								korrekt zugeordnet.
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

			<!-- Schritt 2 -->
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

			<!-- Schritt 3 -->
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

			<!-- Schritt 4 -->
			<div
				class="form-step"
				class:is-active={currentStep === 4}
				data-step="4"
				id="step-panel-4"
				role="region"
				aria-labelledby="step-title-4"
				hidden={currentStep !== 4}
			>
				<div class="form-section">
					<div class="section-header">
						<span class="section-icon" aria-hidden="true"><CircleCheck size={24} strokeWidth={2} /></span>
						<div>
							<h3 class="section-title" id="step-title-4">Bitte prüfen Sie Ihre Angaben</h3>
							<p class="section-lead">Stimmt alles? Dann senden Sie die Nachricht mit einem Klick ab.</p>
						</div>
					</div>
					<div class="review-card">
						<div class="review-block">
							<h4 class="review-block-title">Empfänger</h4>
							<dl class="review-dl">
								<dt>Organisationsträger</dt>
								<dd>{reviewMandant}</dd>
								<dt>Einrichtung</dt>
								<dd>{reviewEinrichtung}</dd>
								<dt>Fachabteilung</dt>
								<dd>{reviewAbteilung}</dd>
							</dl>
						</div>
						<div class="review-block">
							<h4 class="review-block-title">Kontakt</h4>
							<dl class="review-dl">
								<dt>Name</dt>
								<dd>{reviewName}</dd>
								<dt>E-Mail</dt>
								<dd>{reviewEmail}</dd>
								<dt>Telefon</dt>
								<dd>{reviewPhone}</dd>
								<dt>Organisation</dt>
								<dd>{reviewOrg}</dd>
							</dl>
						</div>
						<div class="review-block review-block--full">
							<h4 class="review-block-title">Nachricht</h4>
							<p class="review-subject">{reviewSubject}</p>
							<div class="review-message">{reviewMessage}</div>
						</div>
					</div>
				</div>

				<div class="submit-section submit-section--wizard">
					<label class="privacy-label">
						<input
							class="privacy-checkbox"
							id="privacyAccepted"
							name="privacyAccepted"
							type="checkbox"
							required
							bind:checked={privacyAccepted}
							onchange={() => {
								if (privacyAccepted) {
									const next = { ...showErr };
									delete next.privacyAccepted;
									showErr = next;
								}
							}}
						/>
						<span class="privacy-text"
							>Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen dauerhaft gespeichert
							werden. Weitere Informationen finden Sie in unserer
							<a
								href="https://www.diakoniestiftung-sachsen.de/info/datenschutz"
								target="_blank"
								rel="noopener noreferrer">Datenschutzerklärung</a
							>. <span class="required-star">*</span></span
						>
					</label>
					<span class="error-msg" class:visible={showErr.privacyAccepted} id="err-privacyAccepted" role="alert">
						Bitte stimmen Sie der Datenschutzerklärung zu.
					</span>

					<div class="wizard-nav wizard-nav--final">
						<button type="button" class="btn-wizard btn-wizard-secondary" onclick={() => goToStep(3, true)}>
							<span class="btn-wizard-icon" aria-hidden="true"><Pencil size={20} strokeWidth={2} /></span>
							Noch anpassen
						</button>
						<button class="btn-submit" type="submit" disabled={submitting}>
							<span class="btn-text" class:hidden={submitting}>Nachricht absenden</span>
							<div class="spinner" class:hidden={!submitting} aria-hidden="true">
								<svg
									class="animate-spin"
									style="height: 1.5rem; width: 1.5rem; color: #fff;"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
									></circle>
									<path
										style="opacity: 0.75;"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</div>
						</button>
					</div>
					{#if feedback}
						<div
							id="form-feedback"
							class="form-feedback"
							class:success={feedback.kind === 'success'}
							class:error={feedback.kind === 'error'}
							role="status"
						>
							{feedback.text}
						</div>
					{/if}
				</div>
			</div>
		</form>
	</div>
</main>
