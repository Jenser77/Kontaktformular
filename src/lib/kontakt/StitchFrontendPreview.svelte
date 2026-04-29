<script lang="ts">
	let {
		recipients = [],
		recipientsLoadFailed = false
	}: {
		recipients?: unknown[];
		recipientsLoadFailed?: boolean;
	} = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap"
	/>
</svelte:head>

<div class="page">
	<header class="site-header">
		<div class="shell">
			<a href="https://www.diakoniestiftung-sachsen.de/" aria-label="Diakoniestiftung in Sachsen Startseite">
				<img
					src="/logo.png"
					alt="Diakoniestiftung in Sachsen"
					class="logo"
					width="160"
					height="60"
					decoding="async"
				/>
			</a>
			<a class="main-link" href="https://www.diakoniestiftung-sachsen.de/">Zur Hauptseite</a>
		</div>
	</header>

	<main class="shell content">
		<section class="hero">
			<h1>Kontakt</h1>
			<p class="lead">Lassen Sie uns ins Gespräch kommen</p>
			<p>Haben Sie Fragen zu unseren Einrichtungen oder Karrieremöglichkeiten?</p>
			<p>Unser Team ist gerne für Sie da und berät Sie persönlich.</p>
		</section>

		<section class="card">
			<div class="card-grid">
				<form class="form" action="#" method="post">
					<div class="form-section">
						<h2>Wohin soll Ihre Nachricht?</h2>
						<p class="helper">
							Der übergeordnete Träger Ihrer gewünschten Einrichtung - so wird Ihre Anfrage intern korrekt zugeordnet.
						</p>
						<div class="field">
							<label for="organisationstraeger">Organisationsträger (Mandant) *</label>
							<select id="organisationstraeger" name="organisationstraeger" required>
								<option value="">Bitte wählen...</option>
								<option>Diakoniestiftung in Sachsen</option>
								<option>SEG mbH</option>
							</select>
						</div>
						<div class="two-cols">
							<div class="field">
								<label for="einrichtung">Einrichtung *</label>
								<select id="einrichtung" name="einrichtung" disabled required>
									<option>Bitte zuerst Mandant...</option>
								</select>
							</div>
							<div class="field">
								<label for="fachabteilung">Fachabteilung *</label>
								<select id="fachabteilung" name="fachabteilung" disabled required>
									<option>Bitte zuerst Einrichtung...</option>
								</select>
							</div>
						</div>
					</div>

					<div class="form-section">
						<h2>Wie können wir Sie erreichen?</h2>
						<div class="two-cols">
							<div class="field">
								<label for="vorname">Vorname *</label>
								<input id="vorname" name="vorname" type="text" placeholder="Max" required />
							</div>
							<div class="field">
								<label for="nachname">Nachname *</label>
								<input id="nachname" name="nachname" type="text" placeholder="Mustermann" required />
							</div>
						</div>
						<div class="field">
							<label for="organisation">Organisation oder Arbeitgeber (optional)</label>
							<input
								id="organisation"
								name="organisation"
								type="text"
								placeholder="z. B. Firma oder Verein"
							/>
						</div>
						<div class="two-cols">
							<div class="field">
								<label for="email">E-Mail-Adresse *</label>
								<input
									id="email"
									name="email"
									type="email"
									placeholder="max.mustermann@beispiel.de"
									required
								/>
							</div>
							<div class="field">
								<label for="telefon">Telefonnummer (optional)</label>
								<input id="telefon" name="telefon" type="tel" placeholder="+49 123 456789" />
							</div>
						</div>
					</div>

					<div class="form-section">
						<h2>Ihr Anliegen</h2>
						<div class="field">
							<label for="betreff">Betreff *</label>
							<input id="betreff" name="betreff" type="text" placeholder="Wie können wir helfen?" required />
						</div>
						<div class="field">
							<label for="nachricht">Nachricht *</label>
							<textarea
								id="nachricht"
								name="nachricht"
								rows="5"
								placeholder="Beschreiben Sie Ihr Anliegen..."
								required
							></textarea>
						</div>
					</div>

					<div class="submit-area">
						<div class="checkbox-row">
							<input id="datenschutz-zustimmung" type="checkbox" required />
							<label for="datenschutz-zustimmung">
								Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen dauerhaft gespeichert
								werden. Weitere Informationen finden Sie in unserer
								<a href="https://www.diakoniestiftung-sachsen.de/info/datenschutz">Datenschutzerklärung</a>.
							</label>
						</div>
						<button type="submit">Nachricht absenden</button>
					</div>
				</form>

				<aside class="context-panel" aria-label="Kontext">
					<h3>Kontext</h3>
					<div class="context-box">
						<p class="context-title">Ihre Nachricht geht an - -</p>
						<p>
							Wir antworten werktags in der Regel innerhalb von 24 Stunden. Details zur Datenverarbeitung finden
							Sie in unserer
							<a href="https://www.diakoniestiftung-sachsen.de/info/datenschutz">Datenschutzerklärung</a>.
						</p>
					</div>
				</aside>
			</div>
		</section>
	</main>

	<footer class="site-footer">
		<div class="shell footer-grid">
			<div>
				<h4>Hauptsitz</h4>
				<p class="strong">Diakoniestiftung in Sachsen</p>
				<p>Obere Bergstraße 1</p>
				<p>01445 Radebeul</p>
			</div>
			<div>
				<h4>Verwaltungsanschrift</h4>
				<p class="strong">SEG stiftungsentwicklungsgesellschaft mbH</p>
				<p>Wildparkstraße 3</p>
				<p>09247 Chemnitz</p>
				<p class="spacer">Telefon: <a href="tel:+493722469370">03722 46937 0</a></p>
				<p>Telefax: 03722 49937 99</p>
			</div>
			<div class="footer-links">
				<a href="https://www.diakoniestiftung-sachsen.de/info/impressum">Impressum</a>
				<a href="https://www.diakoniestiftung-sachsen.de/info/datenschutz">Datenschutz</a>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #f8f9fb;
		color: #1f1a1f;
		font-family: 'Public Sans', sans-serif;
	}

	.page {
		min-height: 100vh;
	}

	.shell {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.site-header {
		border-bottom: 1px solid #ececf2;
		background: #fff;
	}

	.site-header .shell {
		height: 5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: block;
		width: clamp(120px, 20vw, 160px);
		height: auto;
		object-fit: contain;
	}

	.main-link {
		color: #4f4a51;
		font-size: 0.8rem;
		font-weight: 600;
		text-decoration: none;
	}

	.main-link:hover {
		color: #5a2572;
	}

	.content {
		padding-top: 3.25rem;
		padding-bottom: 3rem;
	}

	.hero h1 {
		margin: 0;
		color: #5a2572;
		font-size: clamp(2rem, 4vw, 2.65rem);
	}

	.hero .lead {
		margin: 0.9rem 0 1rem;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.hero p {
		margin: 0.2rem 0;
		color: #4d444f;
	}

	.card {
		margin-top: 2.25rem;
		background: #fff;
		border-radius: 0.85rem;
		padding: clamp(1.25rem, 3vw, 2.75rem);
		box-shadow: 0 10px 30px rgba(90, 37, 114, 0.08);
	}

	.card-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2rem;
	}

	@media (min-width: 980px) {
		.card-grid {
			grid-template-columns: minmax(0, 1fr) 17.5rem;
			gap: 2.5rem;
		}
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
	}

	.form-section h2 {
		margin: 0 0 1rem;
		color: #5a2572;
		font-size: 1.05rem;
	}

	.helper {
		margin: -0.5rem 0 1rem;
		font-size: 0.78rem;
		line-height: 1.45;
		color: #7e7480;
	}

	.field {
		margin-bottom: 0.95rem;
	}

	label {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.74rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #4d444f;
	}

	input,
	select,
	textarea {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid #d0c2d0;
		border-radius: 0.3rem;
		padding: 0.65rem 0.75rem;
		background: #fff;
		font: inherit;
	}

	input:disabled,
	select:disabled {
		background: #f5f6f8;
		color: #8f8790;
		cursor: not-allowed;
	}

	.two-cols {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.9rem;
	}

	@media (min-width: 720px) {
		.two-cols {
			grid-template-columns: 1fr 1fr;
		}
	}

	.submit-area {
		padding-top: 0.25rem;
	}

	.checkbox-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem;
		align-items: flex-start;
	}

	.checkbox-row input {
		width: 1rem;
		height: 1rem;
		margin-top: 0.15rem;
	}

	.checkbox-row label {
		margin: 0;
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.72rem;
		font-weight: 500;
		line-height: 1.45;
		color: #4d444f;
	}

	.checkbox-row a,
	.context-box a {
		color: #5a2572;
	}

	button {
		width: 100%;
		margin-top: 1rem;
		border: 0;
		border-radius: 0.35rem;
		padding: 0.8rem 1rem;
		background: #5a2572;
		color: #fff;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
	}

	button:hover {
		background: #44195b;
	}

	.context-panel h3 {
		margin: 0 0 0.8rem;
		font-size: 0.8rem;
		color: #5a2572;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.context-box {
		border: 1px solid #dfe1e8;
		border-radius: 0.5rem;
		background: #f8f9fb;
		padding: 1rem;
	}

	.context-title {
		margin: 0 0 0.45rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: #1f1a1f;
	}

	.context-box p {
		margin: 0;
		font-size: 0.72rem;
		line-height: 1.5;
		color: #4d444f;
	}

	.site-footer {
		margin-top: 2.5rem;
		padding: 2.3rem 0;
		border-top: 1px solid #ececf2;
		background: #fff;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 900px) {
		.footer-grid {
			grid-template-columns: 1fr 1fr auto;
		}
	}

	.site-footer h4 {
		margin: 0 0 0.7rem;
		font-size: 0.7rem;
		font-weight: 800;
		color: #5a2572;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.site-footer p {
		margin: 0.15rem 0;
		font-size: 0.73rem;
		color: #4d444f;
	}

	.strong {
		font-weight: 700;
		color: #1f1a1f;
	}

	.spacer {
		margin-top: 0.6rem;
	}

	.footer-links {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.footer-links a,
	.site-footer a {
		font-size: 0.74rem;
		color: #4d444f;
		text-decoration: none;
	}

	.footer-links a:hover,
	.site-footer a:hover {
		color: #5a2572;
	}
</style>
