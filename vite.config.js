import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({
			// exclude: ['fs'],
			globals: {
				Buffer: true,
				global: true,
				process: true
			},
			protocolImports: true
		}),
		// SvelteKitPWA({
		// 	strategies: 'injectManifest',
		// 	srcDir: 'src'})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
