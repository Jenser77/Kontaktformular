import { expect, test, type Page } from '@playwright/test';

const CONSENT_KEY = 'kf_cookie_prefs_v1';

async function loginAsAdmin(page: Page) {
	const user = process.env.E2E_ADMIN_USERNAME;
	const pass = process.env.E2E_ADMIN_PASSWORD;
	test.skip(!user || !pass, 'Setze E2E_ADMIN_USERNAME und E2E_ADMIN_PASSWORD (siehe README).');

	await page.goto('/admin/login');
	await page.locator('#username').fill(user!);
	await page.locator('#password').fill(pass!);
	await page.getByRole('button', { name: /Anmelden/ }).click();
	await page.waitForURL(/\/admin\/?$/, { timeout: 20_000 });
}

test.describe('Admin user management', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(
				key,
				JSON.stringify({ necessary: true, acknowledgedAt: new Date().toISOString() })
			);
		}, CONSENT_KEY);
	});

	test('create, disable and delete admin user', async ({ page }) => {
		await loginAsAdmin(page);

		const username = `e2e-admin-${Date.now()}`;
		const password = `E2E-Admin-${Date.now()}!`;
		const createForm = page.locator('.admin-user-create-form');

		await createForm.locator('input[name="username"]').fill(username);
		await createForm.locator('input[name="password"]').fill(password);
		await createForm.locator('input[name="confirmPassword"]').fill(password);
		await createForm.getByRole('button', { name: 'Admin anlegen' }).click();

		await expect(page.getByRole('status')).toContainText('wurde angelegt', { timeout: 15_000 });

		const row = page.locator('.admin-user-list-item', { hasText: username });
		await expect(row).toBeVisible({ timeout: 15_000 });
		await expect(row).toContainText('Aktiv');

		page.once('dialog', (dialog) => dialog.accept());
		await row.getByRole('button', { name: 'Deaktivieren' }).click();

		await expect(page.getByRole('status')).toContainText('wurde deaktiviert', { timeout: 15_000 });
		await expect(row).toContainText('Deaktiviert');
		await expect(row.getByRole('button', { name: 'Deaktivieren' })).toBeDisabled();

		page.once('dialog', (dialog) => dialog.accept());
		await row.getByRole('button', { name: 'Löschen' }).click();

		await expect(page.getByRole('status')).toContainText('wurde gelöscht', { timeout: 15_000 });
		await expect(page.locator('.admin-user-list-item', { hasText: username })).toHaveCount(0);
	});
});
