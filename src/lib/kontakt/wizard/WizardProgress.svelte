<script lang="ts">
	import { TOTAL_STEPS } from './validation';

	let {
		currentStep,
		maxStepVisited,
		progressPct,
		onGoStep
	}: {
		currentStep: number;
		maxStepVisited: number;
		progressPct: number;
		onGoStep: (n: number) => void;
	} = $props();
</script>

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
					onclick={() => onGoStep(n)}
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
