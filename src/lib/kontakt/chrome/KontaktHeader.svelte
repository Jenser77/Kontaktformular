<header class="kontakt-header">
	<nav class="utility-bar" aria-label="Metanavigation">
		<div class="utility-inner">
			<ul class="utility-list">
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/" class="utility-link">Zur Hauptseite</a>
				</li>
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/info/impressum" class="utility-link"
						>Impressum</a
					>
				</li>
				<li>
					<a href="https://www.diakoniestiftung-sachsen.de/info/datenschutz" class="utility-link"
						>Datenschutz</a
					>
				</li>
			</ul>
		</div>
	</nav>

	<div class="brand-bar">
		<div class="brand-inner">
			<a
				class="brand-link"
				href="https://www.diakoniestiftung-sachsen.de/"
				aria-label="Diakoniestiftung in Sachsen Startseite"
			>
				<img
					src="/logo.png"
					alt="Diakoniestiftung in Sachsen"
					class="brand-logo"
					width="1091"
					height="444"
					decoding="async"
				/>
			</a>

			<div class="brand-title-wrap">
				<p class="brand-kicker">Diakoniestiftung in Sachsen</p>
				<h1 class="brand-title">Kontakt</h1>
			</div>

			<a
				href="https://www.diakoniestiftung-sachsen.de/info/kontakt"
				class="brand-cta"
				aria-label="Kontaktbereich der Hauptseite"
				>Kontaktbereich</a
			>
		</div>
	</div>
</header>

<style>
	.kontakt-header {
		position: sticky;
		top: 0;
		z-index: 40;
		border-bottom: 1px solid #e8edf2;
		background: #ffffff;
		box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
	}

	.utility-bar {
		border-bottom: 1px solid #eef2f6;
		background: #f9fbfd;
	}

	.utility-inner,
	.brand-inner {
		width: min(1120px, calc(100% - 2.5rem));
		margin: 0 auto;
	}

	.utility-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.85rem;
		min-height: 2.25rem;
		font-size: 0.82rem;
		color: #4a5a6a;
	}

	.utility-list li {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
	}

	.utility-list li + li::before {
		content: '·';
		font-weight: 700;
		color: #b8c4d0;
		line-height: 1;
	}

	.utility-link {
		color: inherit;
		text-decoration: none;
	}

	.utility-link:hover {
		text-decoration: underline;
	}

	.utility-link:focus-visible,
	.brand-link:focus-visible,
	.brand-cta:focus-visible {
		outline: 2px solid var(--accent, #0099cd);
		outline-offset: 3px;
		border-radius: 0.3rem;
	}

	.brand-bar {
		padding: 1rem 0;
	}

	.brand-inner {
		display: grid;
		grid-template-columns: minmax(0, 220px) minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
	}

	.brand-link {
		display: inline-flex;
	}

	.brand-logo {
		display: block;
		width: 168px;
		height: auto;
	}

	.brand-kicker {
		margin: 0;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #6a7784;
	}

	.brand-title {
		margin: 0.2rem 0 0;
		font-size: clamp(1.45rem, 2.1vw, 1.95rem);
		line-height: 1.2;
		color: #12273d;
	}

	.brand-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.68rem 1rem;
		border-radius: 999px;
		border: 1px solid #d2dde8;
		background: #f6f9fc;
		color: #1d3855;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	.brand-cta:hover {
		background: #edf4fa;
	}

	@media (max-width: 820px) {
		.utility-inner,
		.brand-inner {
			width: min(1120px, calc(100% - 1.25rem));
		}

		.brand-inner {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.brand-cta {
			justify-self: start;
		}
	}
</style>
