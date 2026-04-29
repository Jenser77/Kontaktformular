<script lang="ts">
	let {
		badge = '',
		title = 'Kontakt',
		lead = 'Lassen Sie uns ins Gespräch kommen',
		text = 'Haben Sie Fragen zu unseren Einrichtungen oder Karrieremöglichkeiten? Unser Team ist gerne für Sie da und berät Sie persönlich.'
	}: {
		badge?: string;
		title?: string;
		lead?: string;
		text?: string;
	} = $props();
</script>

<section class="kontakt-hero" aria-labelledby="kontakt-hero-title">
	<div class="hero-inner">
		{#if badge}
			<p class="hero-badge">{badge}</p>
		{/if}
		<h1 class="hero-title" id="kontakt-hero-title">{title}</h1>
		{#if lead}
			<p class="hero-lead">{lead}</p>
		{/if}
		<p class="hero-text">{text}</p>
	</div>
</section>

<style>
	.kontakt-hero {
		padding: clamp(1.75rem, 3.5vw, 2.6rem) 0;
		background:
			radial-gradient(circle at 88% 18%, rgba(14, 76, 140, 0.1), transparent 45%),
			linear-gradient(180deg, #f7fafd 0%, #ffffff 100%);
		border-bottom: 1px solid #ecf1f6;
	}

	.hero-inner {
		width: min(1120px, calc(100% - 2.5rem));
		margin: 0 auto;
	}

	.hero-badge {
		display: inline-flex;
		margin: 0;
		padding: 0.24rem 0.62rem;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #0d4a73;
		background: rgba(0, 153, 205, 0.12);
		border: 1px solid rgba(0, 153, 205, 0.22);
	}

	.hero-title {
		margin: 0.5rem 0 0;
		max-width: min(42rem, 100%);
		font-size: clamp(1.75rem, 3.6vw, 2.75rem);
		line-height: 1.16;
		color: #12273d;
		letter-spacing: -0.02em;
	}

	.hero-badge + .hero-title {
		margin-top: 0.75rem;
	}

	.hero-lead {
		margin: 0.55rem 0 0;
		max-width: min(42rem, 100%);
		font-size: clamp(1.05rem, 2vw, 1.25rem);
		font-weight: 600;
		line-height: 1.35;
		color: #334155;
	}

	.hero-text {
		margin: 0.85rem 0 0;
		max-width: 58ch;
		font-size: clamp(1rem, 1.5vw, 1.08rem);
		line-height: 1.62;
		color: #425567;
	}

	@media (max-width: 820px) {
		.hero-inner {
			width: min(1120px, calc(100% - 1.25rem));
		}

		.hero-text {
			max-width: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.kontakt-hero {
			background: #ffffff;
		}
	}
</style>
