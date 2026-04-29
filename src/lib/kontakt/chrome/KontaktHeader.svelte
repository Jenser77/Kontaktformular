<header class="kontakt-header">
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

			<a
				class="brand-backlink"
				href="https://www.diakoniestiftung-sachsen.de/"
				>Zur Hauptseite</a
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

	.kontakt-header::before {
		content: '';
		display: block;
		height: 2px;
		background: linear-gradient(90deg, var(--primary, #5a2572) 0%, var(--accent, #0099cd) 100%);
	}

	.brand-bar {
		padding: 0.85rem 0;
	}

	.brand-inner {
		width: min(1120px, calc(100% - 2.5rem));
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
	}

	.brand-link {
		display: inline-flex;
	}

	.brand-logo {
		display: block;
		width: 152px;
		height: auto;
	}

	.brand-backlink {
		font-size: 0.88rem;
		font-weight: 600;
		color: #1f4f82;
		text-decoration: none;
		white-space: nowrap;
	}

	.brand-backlink:hover {
		text-decoration: underline;
		color: var(--accent, #0099cd);
	}

	.brand-link:focus-visible,
	.brand-backlink:focus-visible {
		outline: 2px solid var(--accent, #0099cd);
		outline-offset: 3px;
		border-radius: 0.3rem;
	}

	@media (max-width: 820px) {
		.brand-inner {
			width: min(1120px, calc(100% - 1.25rem));
			flex-direction: column;
			align-items: flex-start;
		}

		.brand-backlink {
			white-space: normal;
		}
	}
</style>
