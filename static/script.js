document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const feedbackBox = document.getElementById('form-feedback');

    // Definition der zu validierenden Felder
    const requiredFields = ['mandant', 'einrichtung', 'recipientId', 'firstName', 'lastName', 'email', 'subject', 'message'];

    // Einfacher E-Mail-Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // --- Dynamisches Routing initialisieren ---
    const selMandant = document.getElementById('mandant');
    const selEinrichtung = document.getElementById('einrichtung');
    const selRecipient = document.getElementById('recipientId');
    let recipientData = [];

    const fetchRoutingData = async () => {
        try {
            const response = await fetch('/api/recipients');
            const data = await response.json();
            if (data.success) {
                recipientData = data.data;
                populateMandanten();
            } else {
                selMandant.innerHTML = '<option value="" disabled selected>Fehler beim Laden</option>';
            }
        } catch (err) {
            selMandant.innerHTML = '<option value="" disabled selected>Fehler beim Laden</option>';
        }
    };

    const populateMandanten = () => {
        selMandant.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        recipientData.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            selMandant.appendChild(opt);
        });
    };

    selMandant.addEventListener('change', (e) => {
        const mandantId = e.target.value;
        selEinrichtung.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        selRecipient.innerHTML = '<option value="" disabled selected>Bitte zuerst Einrichtung wählen...</option>';
        selEinrichtung.disabled = false;
        selRecipient.disabled = true;

        const mandant = recipientData.find(m => m.id === mandantId);
        if (mandant && mandant.einrichtungen) {
            mandant.einrichtungen.forEach(ein => {
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

        const mandant = recipientData.find(m => m.id === mandantId);
        if (mandant) {
            const einrichtung = mandant.einrichtungen.find(ein => ein.id === einrichtungId);
            if (einrichtung && einrichtung.abteilungen) {
                einrichtung.abteilungen.forEach(abt => {
                    const opt = document.createElement('option');
                    opt.value = abt.id;
                    opt.textContent = abt.name;
                    selRecipient.appendChild(opt);
                });
            }
        }
    });

    // Initialen Ladevorgang starten
    fetchRoutingData();
    // ------------------------------------------

    // Funktion um Fehlermeldungen für ein Feld anzuzeigen / zu verstecken
    const toggleError = (fieldId, isValid) => {
        const field = document.getElementById(fieldId);
        const errMsg = document.getElementById(`err-${fieldId}`);

        if (isValid) {
            field.classList.remove('error');
            if (errMsg) {
                errMsg.classList.remove('visible');
            }
        } else {
            field.classList.add('error');
            if (errMsg) {
                errMsg.classList.add('visible');
            }
        }
    };

    // Validiert das komplette Formular
    const validateForm = () => {
        let isFormValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();

            let isValid = value !== '';

            if (fieldId === 'email' && isValid) {
                isValid = emailRegex.test(value);
            }

            toggleError(fieldId, isValid);
            if (!isValid) isFormValid = false;
        });

        // Datenschutz-Checkbox speziell validieren
        const privacyCheckbox = document.getElementById('privacyAccepted');
        const isPrivacyValid = privacyCheckbox.checked;
        const errPrivacy = document.getElementById('err-privacyAccepted');

        if (isPrivacyValid) {
            if (errPrivacy) errPrivacy.classList.remove('visible');
        } else {
            if (errPrivacy) errPrivacy.classList.add('visible');
            isFormValid = false;
        }

        return isFormValid;
    };

    // Real-Time Validation bei Eingabe/Blur
    form.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('blur', () => {
            if (element.required) {
                const value = element.type === 'checkbox' ? element.checked : element.value.trim();
                let isValid = !!value;
                if (element.type === 'email' && isValid) {
                    isValid = emailRegex.test(element.value.trim());
                }

                if (element.id === 'privacyAccepted') {
                    const err = document.getElementById('err-privacyAccepted');
                    if (err) isValid ? err.classList.remove('visible') : err.classList.add('visible');
                } else {
                    toggleError(element.id, isValid);
                }
            }
        });

        // Entferne Fehlerstatus bei erneuter Eingabe
        element.addEventListener('input', () => {
            if (element.classList.contains('error')) {
                toggleError(element.id, true);
            }
        });
    });

    // Formular Absenden
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validierung
        if (!validateForm()) {
            // Zeige eine allgemeine Fehlermeldung nur, falls bestimmte Felder fehlerhaft sind
            return false;
        }

        // 2. Button in Ladezustand versetzen
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.classList.remove('hidden');
        feedbackBox.classList.add('hidden');
        feedbackBox.className = 'form-feedback hidden';

        // 3. Daten sammeln
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Checkbox als boolean an den Server schicken für einfache Validierung
        data.privacyAccepted = document.getElementById('privacyAccepted').checked;

        try {
            // Relativer Pfad zum Express-Backend (da selbe Domain)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Erfolgsfall
                form.reset();
                feedbackBox.textContent = result.message || 'Ihre Nachricht wurde erfolgreich gesendet.';
                feedbackBox.classList.add('success');
                feedbackBox.classList.remove('hidden');
            } else {
                // Server-Fehler (inkl. 429 Rate Limit oder 400 Validation)
                feedbackBox.textContent = result.error || 'Es ist ein Fehler aufgetreten. Bitte probieren Sie es später erneut.';
                feedbackBox.classList.add('error');
                feedbackBox.classList.remove('hidden');
            }

        } catch (error) {
            // Netzwerkfehler / Fehlender Server
            console.error('Fetch Error:', error);
            feedbackBox.textContent = 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder versuchen Sie es später erneut.';
            feedbackBox.classList.add('error');
            feedbackBox.classList.remove('hidden');
        } finally {
            // 4. Ladezustand beenden
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.classList.add('hidden');
        }
    });

    // Scroll to Top Button functionality
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
