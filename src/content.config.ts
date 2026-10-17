import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
	schema: z.object({
		title: z.string(),
		seoTitle: z.string().max(60).optional(),
		description: z.string().max(155),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		/** "Last checked" date for YMYL facts, shown on every post. */
		lastChecked: z.coerce.date(),
		author: z.literal('Import Owner NZ').default('Import Owner NZ'),
		cluster: z.enum(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'meta']),
		/** Slug of the pillar post this cluster post links up to (omit on pillars). */
		pillar: z.string().optional(),
		/** Primary sources: NZTA etc. */
		sources: z.array(z.object({ title: z.string(), url: z.string().url(), checked: z.coerce.date().optional() })).default([]),
		image: z.union([z.string(), z.object({ src: z.string(), alt: z.string() })]).optional(),
	}),
});

export const collections = { posts };
