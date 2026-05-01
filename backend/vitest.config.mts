import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			'cloudflare:workers': resolve(__dirname, 'test/__mocks__/cloudflare-workers.ts'),
		},
	},
	test: {
		exclude: ['**/node_modules/**'],
	},
});
