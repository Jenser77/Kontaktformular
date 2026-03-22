/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync } = require('fs');

const ENV_FILE = process.env.ENV_FILE || '/etc/kontaktformular.env';

function loadEnvFile(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');
		const env = {};
		for (const line of content.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const idx = trimmed.indexOf('=');
			if (idx <= 0) continue;
			const key = trimmed.slice(0, idx).trim();
			let val = trimmed.slice(idx + 1).trim();
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
			env[key] = val;
		}
		return env;
	} catch {
		return {};
	}
}

module.exports = {
	apps: [
		{
			name: 'kontaktformular',
			script: 'build/index.js',
			cwd: __dirname,
			env: loadEnvFile(ENV_FILE)
		}
	]
};
