import { expect, test, type Locator } from '@playwright/test';

const CONSENT_KEY = 'kf_cookie_prefs_v1';

async function selectFirstRealOption(select: Locator): Promise<void> {
	const value = await select.evaluate((el: HTMLSelectElement) => {
		const opt = [...el.options].find((o) => o.value.trim() !== '');
		return opt?.value ?? '';
	});
	if (!value) {
		throw new Error('Select has no option with a value');
	}
	await select.selectOption(value);
}

test.describe('Kontaktformular', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(
				key,
				JSON.stringify({ necessary: true, acknowledgedAt: new Date().toISOString() }),
			);
		}, CONSENT_KEY);
	});

	test('Wizard (schmal): Absenden mit gemockter API', async ({ page }) => {
		test.setTimeout(60_000);
		await page.route('**/api/contact', async (route) => {
			if (route.request().method() !== 'POST') {
				await route.continue();
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					message: 'E2E: Nachricht wurde akzeptiert.'
				})
			});
		});

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('#contactForm')).toBeVisible();

		const mandant = page.locator('#mandant');
		await mandant.waitFor({ state: 'visible', timeout: 30_000 });
		test.skip((await mandant.locator('option').count()) < 2, 'Keine Mandanten in der DB (bun run db:seed).');

		await selectFirstRealOption(mandant);

		const einrichtung = page.locator('#einrichtung');
		await expect(einrichtung).toBeEnabled({ timeout: 15_000 });
		await selectFirstRealOption(einrichtung);

		const recipient = page.locator('#recipientId');
		await expect(recipient).toBeEnabled({ timeout: 15_000 });
		await selectFirstRealOption(recipient);

		await page.getByRole('button', { name: /Weiter zu Kontaktdaten/ }).click();

		await expect(page.locator('#firstName')).toBeVisible();
		await page.locator('#firstName').fill('E2E');
		await page.locator('#lastName').fill('Test');
		await page.locator('#email').fill('e2e@example.com');

		await page.getByRole('button', { name: /Weiter zur Nachricht/ }).click();

		await expect(page.locator('#subject')).toBeVisible();
		await page.locator('#subject').fill('Playwright Test');
		await page.locator('#message').fill('Kurze Testnachricht für End-to-End.');

		await page.getByRole('button', { name: /Zur Übersicht/ }).click();

		await expect(page.locator('#privacyAccepted')).toBeVisible();
		await page.locator('#privacyAccepted').check();

		await page.getByRole('button', { name: 'Nachricht absenden' }).click();

		await expect(page.locator('body')).toContainText('E2E: Nachricht wurde akzeptiert.', { timeout: 15_000 });
	});
});
