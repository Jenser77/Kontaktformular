import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Kontaktseite: statische `index.html` ausliefern.
 * Pfade müssen in Dev (vite), lokal `preview` und adapter-node (build/server/chunks → build/client)
 * sowie verschiedene PM2-`cwd` funktionieren.
 */
function readContactHtml(): string | null {
	const cwd = process.cwd();
	const candidates = [
		join(cwd, 'static', 'index.html'),
		join(__dirname, '..', '..', 'client', 'index.html'),
		join(cwd, 'build', 'client', 'index.html'),
		join(cwd, 'client', 'index.html'),
		join(__dirname, '..', '..', 'static', 'index.html')
	];

	for (const filePath of candidates) {
		if (existsSync(filePath)) {
			return readFileSync(filePath, 'utf-8');
		}
	}

	return null;
}

export async function GET() {
	const content = readContactHtml();
	if (!content) {
		return new Response('Home Page (index.html not found)', { status: 404 });
	}

	return new Response(content, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
}
