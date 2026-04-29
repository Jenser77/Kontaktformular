import { defineConfig, devices } from '@playwright/test';

const defaultDb = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable';
const e2ePort = process.env.PLAYWRIGHT_PORT ?? '4199';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
	testDir: 'tests/e2e',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [['list']],
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1400, height: 900 }
			}
		}
	],
	webServer: {
		command: `bun run dev -- --host 127.0.0.1 --port ${e2ePort} --strictPort`,
		env: {
			DATABASE_URL: process.env.DATABASE_URL ?? defaultDb,
			ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? baseURL,
			RATE_LIMIT_DISABLED: 'true'
		},
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		stdout: 'pipe',
		stderr: 'pipe'
	}
});
