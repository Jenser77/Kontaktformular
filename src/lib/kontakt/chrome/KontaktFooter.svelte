<footer class="kontakt-footer" aria-label="Seitenfuß">
	<div class="footer-inner">
		<div>
			<p class="footer-brand">Diakoniestiftung in Sachsen</p>
			<address class="footer-address">
				Obere Bergstraße 1<br />
				01445 Radebeul
			</address>
		</div>

		<nav aria-label="Rechtliche und Service-Links">
			<ul class="footer-links">
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/info/impressum">Impressum</a>
				</li>
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/info/datenschutz">Datenschutz</a>
				</li>
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/info/kontakt">Kontakt</a>
				</li>
			</ul>
		</nav>

		<p class="footer-meta">Telefon: <a href="tel:+493722469370">03722 46937 0</a></p>
	</div>
</footer>

<style>
	.kontakt-footer {
		margin-top: 3rem;
		border-top: 1px solid #e8edf2;
		background: #fbfcfe;
	}

	.footer-inner {
		width: min(1120px, calc(100% - 2.5rem));
		margin: 0 auto;
		padding: 1.45rem 0 1.7rem;
		display: grid;
		grid-template-columns: 1.3fr auto auto;
		align-items: end;
		gap: 1rem;
	}

	.footer-brand {
		margin: 0 0 0.28rem;
		font-size: 0.96rem;
		font-weight: 650;
		color: #1e3650;
	}

	.footer-address {
		margin: 0;
		font-style: normal;
		font-size: 0.88rem;
		line-height: 1.45;
		color: #4a5a6a;
	}

	.footer-links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.85rem;
		flex-wrap: wrap;
	}

	.footer-links a,
	.footer-meta a {
		color: #1f4f82;
		text-decoration: none;
	}

	.footer-links a:hover,
	.footer-meta a:hover {
		text-decoration: underline;
	}

	.footer-links a:focus-visible,
	.footer-meta a:focus-visible {
		outline: 2px solid #104f90;
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	.footer-meta {
		margin: 0;
		font-size: 0.88rem;
		color: #4a5a6a;
	}

	@media (max-width: 820px) {
		.footer-inner {
			width: min(1120px, calc(100% - 1.25rem));
			grid-template-columns: 1fr;
			align-items: start;
			padding: 1.2rem 0 1.5rem;
		}
	}
</style>
