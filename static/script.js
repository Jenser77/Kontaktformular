document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const feedbackBox = document.getElementById('form-feedback');
    const wizardLive = document.getElementById('wizardLive');
    const wizardStepCounter = document.getElementById('wizardStepCounter');
    const progressFill = document.getElementById('wizardProgressFill');
    const mainEl = document.getElementById('kontakt-main');

    const TOTAL_STEPS = 4;
    const STEP_LABELS = [
        '',
        'Schritt 1: Empfänger',
        'Schritt 2: Kontaktdaten',
        'Schritt 3: Nachricht',
        'Schritt 4: Prüfen und absenden'
    ];

    const stepFields = {
        1: ['mandant', 'einrichtung', 'recipientId'],
        2: ['firstName', 'lastName', 'email'],
        3: ['subject', 'message']
    };

    const requiredFields = [
        'mandant',
        'einrichtung',
        'recipientId',
        'firstName',
        'lastName',
        'email',
        'subject',
        'message'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const selMandant = document.getElementById('mandant');
    const selEinrichtung = document.getElementById('einrichtung');
    const selRecipient = document.getElementById('recipientId');
    let recipientData = [];
    let currentStep = 1;
    let maxStepVisited = 1;

    const prefersReducedMotion = () =>
        typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollWizardIntoView = () => {
        if (!mainEl) return;
        mainEl.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    };

    const setSelectLoading = (selectEl, isLoading) => {
        if (isLoading) {
            selectEl.classList.add('is-loading');
            selectEl.disabled = true;
        } else {
            selectEl.classList.remove('is-loading');
        }
    };

    const fetchRoutingData = async () => {
        // Show loading state
        setSelectLoading(selMandant, true);
        selMandant.innerHTML = '<option value="" disabled selected>Wird geladen...</option>';
        
        try {
            const response = await fetch('/api/recipients');
            const data = await response.json();
            if (data.success) {
                recipientData = data.data;
                populateMandanten();
            } else {
                selMandant.innerHTML = '<option value="" disabled selected>Fehler beim Laden</option>';
            }
        } catch {
            selMandant.innerHTML = '<option value="" disabled selected>Fehler beim Laden</option>';
        } finally {
            setSelectLoading(selMandant, false);
            selMandant.disabled = false;
        }
    };

    const populateMandanten = () => {
        selMandant.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        recipientData.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            selMandant.appendChild(opt);
        });
    };

    const resetChildRouting = () => {
        selEinrichtung.innerHTML =
            '<option value="" disabled selected>Bitte zuerst Mandant wählen...</option>';
        selRecipient.innerHTML =
            '<option value="" disabled selected>Bitte zuerst Einrichtung wählen...</option>';
        selEinrichtung.disabled = true;
        selRecipient.disabled = true;
    };

    selMandant.addEventListener('change', (e) => {
        const mandantId = e.target.value;
        selEinrichtung.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        selRecipient.innerHTML =
            '<option value="" disabled selected>Bitte zuerst Einrichtung wählen...</option>';
        selEinrichtung.disabled = false;
        selRecipient.disabled = true;

        const mandant = recipientData.find((m) => m.id === mandantId);
        if (mandant?.einrichtungen) {
            mandant.einrichtungen.forEach((ein) => {
                const opt = document.createElement('option');
                opt.value = ein.id;
                opt.textContent = ein.name;
                selEinrichtung.appendChild(opt);
            });
        }
    });

    selEinrichtung.addEventListener('change', (e) => {
        const mandantId = selMandant.value;
        const einrichtungId = e.target.value;
        selRecipient.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        selRecipient.disabled = false;

        const mandant = recipientData.find((m) => m.id === mandantId);
        if (mandant) {
            const einrichtung = mandant.einrichtungen.find((ein) => ein.id === einrichtungId);
            if (einrichtung?.abteilungen) {
                einrichtung.abteilungen.forEach((abt) => {
                    const opt = document.createElement('option');
                    opt.value = abt.id;
                    opt.textContent = abt.name;
                    selRecipient.appendChild(opt);
                });
            }
        }
    });

    fetchRoutingData();

    // Character counter for textarea
    const messageTextarea = document.getElementById('message');
    const charCounter = document.getElementById('messageCharCounter');
    const MAX_CHARS = 2000;
    const WARNING_THRESHOLD = 1800;

    const updateCharCounter = () => {
        if (!messageTextarea || !charCounter) return;
        const count = messageTextarea.value.length;
        charCounter.textContent = `${count} / ${MAX_CHARS}`;
        
        charCounter.classList.remove('warning', 'limit');
        if (count >= MAX_CHARS) {
            charCounter.classList.add('limit');
        } else if (count >= WARNING_THRESHOLD) {
            charCounter.classList.add('warning');
        }
    };

    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateCharCounter);
        updateCharCounter();
    }

    const toggleError = (fieldId, isValid) => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        const errMsg = document.getElementById(`err-${fieldId}`);

        if (isValid) {
            field.classList.remove('error');
            errMsg?.classList.remove('visible');
        } else {
            field.classList.add('error');
            errMsg?.classList.add('visible');
        }
    };

    const validateField = (fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field) return true;
        const value = field.type === 'checkbox' ? field.checked : String(field.value).trim();
        let ok = value !== '' && value !== false;
        if (fieldId === 'email' && ok) ok = emailRegex.test(String(field.value).trim());
        return ok;
    };

    const validateStep = (step) => {
        const ids = stepFields[step];
        if (!ids) return true;
        let ok = true;
        ids.forEach((id) => {
            const v = validateField(id);
            toggleError(id, v);
            if (!v) ok = false;
        });
        return ok;
    };

    const firstInvalidInStep = (step) => {
        const ids = stepFields[step] || [];
        for (const id of ids) {
            if (!validateField(id)) return id;
        }
        return null;
    };

    const focusField = (fieldId) => {
        const el = document.getElementById(fieldId);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    };

    const setProgressUI = () => {
        if (progressFill) {
            const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
            progressFill.style.width = `${pct}%`;
        }

        document.querySelectorAll('[data-step-indicator]').forEach((li) => {
            const n = parseInt(li.dataset.stepIndicator, 10);
            li.classList.remove('is-active', 'is-complete');
            if (n === currentStep) li.classList.add('is-active');
            else if (n < currentStep) li.classList.add('is-complete');
        });

        document.querySelectorAll('.wizard-progress-btn[data-go-step]').forEach((btn) => {
            const target = parseInt(btn.dataset.goStep, 10);
            const allowed = target <= maxStepVisited;
            btn.disabled = !allowed;
            if (target === currentStep) btn.setAttribute('aria-current', 'step');
            else btn.removeAttribute('aria-current');
        });

        if (wizardLive) wizardLive.textContent = STEP_LABELS[currentStep] || '';
        if (wizardStepCounter) {
            wizardStepCounter.textContent = `Schritt ${currentStep} von ${TOTAL_STEPS}`;
        }
    };

    const setStepVisibility = () => {
        document.querySelectorAll('.form-step[data-step]').forEach((panel) => {
            const n = parseInt(panel.dataset.step, 10);
            const active = n === currentStep;
            panel.classList.toggle('is-active', active);
            panel.hidden = !active;
            panel.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        setProgressUI();
    };

    const goToStep = (step, { skipValidate } = {}) => {
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
        if (step === 4) fillReview();
        setStepVisibility();
        scrollWizardIntoView();
        
        // Improved focus management: focus first interactive element after step change
        const panel = document.querySelector(`.form-step[data-step="${step}"]`);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            const focusable = panel?.querySelector(
                'select:not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), button:not([disabled]), [href]'
            );
            if (focusable) {
                focusable.focus({ preventScroll: true });
                // Announce step change to screen readers
                if (wizardLive) {
                    wizardLive.textContent = `${STEP_LABELS[step] || ''} - Fokus auf erstes Eingabefeld gesetzt.`;
                }
            }
        });
    };

    const selectedOptionText = (selectEl) => {
        const opt = selectEl?.selectedOptions?.[0];
        return opt ? opt.textContent.trim() : '—';
    };

    const fillReview = () => {
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text || '—';
        };

        setText('review-mandant', selectedOptionText(selMandant));
        setText('review-einrichtung', selectedOptionText(selEinrichtung));
        setText('review-abteilung', selectedOptionText(selRecipient));

        const fn = document.getElementById('firstName')?.value?.trim() || '';
        const ln = document.getElementById('lastName')?.value?.trim() || '';
        setText('review-name', `${fn} ${ln}`.trim() || '—');

        setText('review-email', document.getElementById('email')?.value?.trim() || '—');
        const phone = document.getElementById('phone')?.value?.trim();
        setText('review-phone', phone || '—');
        const org = document.getElementById('organization')?.value?.trim();
        setText('review-org', org || '—');

        setText('review-subject', document.getElementById('subject')?.value?.trim() || '—');
        const msgEl = document.getElementById('review-message');
        const msg = document.getElementById('message')?.value?.trim() || '—';
        if (msgEl) {
            msgEl.textContent = msg;
        }
    };

    document.querySelectorAll('[data-wizard-next]').forEach((btn) => {
        btn.addEventListener('click', () => goToStep(currentStep + 1));
    });

    document.querySelectorAll('[data-wizard-prev]').forEach((btn) => {
        btn.addEventListener('click', () => goToStep(currentStep - 1, { skipValidate: true }));
    });

    document.querySelectorAll('.wizard-progress-btn[data-go-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.dataset.goStep, 10);
            if (Number.isNaN(target) || btn.disabled) return;
            if (target < currentStep) {
                goToStep(target, { skipValidate: true });
                return;
            }
            if (target === currentStep) return;
            for (let s = currentStep; s < target; s += 1) {
                if (!validateStep(s)) {
                    const bad = firstInvalidInStep(s);
                    if (bad) focusField(bad);
                    goToStep(s, { skipValidate: true });
                    return;
                }
            }
            goToStep(target, { skipValidate: true });
        });
    });

    // Review edit buttons - allow quick navigation to specific steps
    document.querySelectorAll('[data-edit-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.dataset.editStep, 10);
            if (!Number.isNaN(target)) {
                goToStep(target, { skipValidate: true });
            }
        });
    });

    setStepVisibility();

    form.querySelectorAll('input, select, textarea').forEach((element) => {
        element.addEventListener('blur', () => {
            if (!element.required) return;
            const panel = element.closest('.form-step');
            if (!panel || !panel.classList.contains('is-active')) return;

            const value = element.type === 'checkbox' ? element.checked : element.value.trim();
            let isValid = !!value;
            if (element.type === 'email' && isValid) isValid = emailRegex.test(element.value.trim());

            if (element.id === 'privacyAccepted') {
                const err = document.getElementById('err-privacyAccepted');
                if (err) err.classList.toggle('visible', !isValid);
            } else {
                toggleError(element.id, isValid);
            }
        });

        element.addEventListener('input', () => {
            if (element.classList.contains('error')) {
                toggleError(element.id, true);
            }
            
            // Real-time valid state indicator (only for required text inputs)
            if (element.required && element.type !== 'checkbox') {
                const value = element.value.trim();
                let isValid = !!value;
                if (element.type === 'email' && isValid) {
                    isValid = emailRegex.test(value);
                }
                
                // Only show valid state if field has content and is valid
                if (isValid && value.length > 0) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            }
        });
    });

    const validateAllForSubmit = () => {
        let ok = true;
        requiredFields.forEach((id) => {
            const v = validateField(id);
            toggleError(id, v);
            if (!v) ok = false;
        });
        const privacyCheckbox = document.getElementById('privacyAccepted');
        const isPrivacyValid = privacyCheckbox?.checked;
        const errPrivacy = document.getElementById('err-privacyAccepted');
        if (isPrivacyValid) errPrivacy?.classList.remove('visible');
        else {
            errPrivacy?.classList.add('visible');
            ok = false;
        }
        return ok;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentStep !== 4) {
            goToStep(4);
            return;
        }

        if (!validateAllForSubmit()) {
            const order = [...requiredFields, 'privacyAccepted'];
            for (const id of order) {
                if (id === 'privacyAccepted') {
                    if (!document.getElementById('privacyAccepted')?.checked) {
                        document.getElementById('privacyAccepted')?.focus();
                        break;
                    }
                } else if (!validateField(id)) {
                    const step = Object.entries(stepFields).find(([, arr]) => arr.includes(id))?.[0];
                    if (step) goToStep(parseInt(step, 10), { skipValidate: true });
                    focusField(id);
                    break;
                }
            }
            return;
        }

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.classList.remove('hidden');
        feedbackBox.classList.add('hidden');
        feedbackBox.className = 'form-feedback hidden';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.privacyAccepted = document.getElementById('privacyAccepted').checked;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                form.reset();
                resetChildRouting();
                populateMandanten();
                currentStep = 1;
                maxStepVisited = 1;
                setStepVisibility();
                feedbackBox.textContent = result.message || 'Ihre Nachricht wurde erfolgreich gesendet.';
                feedbackBox.classList.add('success');
                feedbackBox.classList.remove('hidden');
            } else {
                feedbackBox.textContent =
                    result.error ||
                    'Es ist ein Fehler aufgetreten. Bitte probieren Sie es später erneut.';
                feedbackBox.classList.add('error');
                feedbackBox.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            feedbackBox.textContent =
                'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder versuchen Sie es später erneut.';
            feedbackBox.classList.add('error');
            feedbackBox.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.classList.add('hidden');
        }
    });

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
    }
});
