import { expect, test } from '@playwright/test';

const CONSENT_KEY = 'kf_cookie_prefs_v1';

test.describe('Admin-Login', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(
				key,
				JSON.stringify({ necessary: true, acknowledgedAt: new Date().toISOString() }),
			);
		}, CONSENT_KEY);
	});

	test('Login-Seite lädt mit Benutzername und Passwort', async ({ page }) => {
		await page.goto('/admin/login');
		await expect(page.getByRole('heading', { name: 'Admin-Bereich' })).toBeVisible();
		await expect(page.locator('#username')).toBeVisible();
		await expect(page.locator('#password')).toBeVisible();
		await expect(page.getByRole('button', { name: /Anmelden/ })).toBeVisible();
	});

	test('Anmeldung mit gültigen Zugangsdaten', async ({ page }) => {
		const user = process.env.E2E_ADMIN_USERNAME;
		const pass = process.env.E2E_ADMIN_PASSWORD;
		test.skip(!user || !pass, 'Setze E2E_ADMIN_USERNAME und E2E_ADMIN_PASSWORD (siehe README).');

		await page.goto('/admin/login');
		await page.locator('#username').fill(user!);
		await page.locator('#password').fill(pass!);
		await page.getByRole('button', { name: /Anmelden/ }).click();

		await page.waitForURL(/\/admin\/?$/, { timeout: 20_000 });
		await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
	});
});
