// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { lastmodFor } from './scripts/sitemap-lastmod.mjs';

// Update `site` when the custom domain is bought and attached.
export default defineConfig({
	site: process.env.SITE_URL || 'https://import-owner-nz.vercel.app',
	output: 'static',
	trailingSlash: 'never',
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/404'),
			serialize(item) {
				item.lastmod = lastmodFor(new URL(item.url).pathname);
				return item;
			},
		}),
	],
});
