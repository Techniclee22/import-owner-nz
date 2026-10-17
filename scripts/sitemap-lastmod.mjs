// lastmod for sitemap entries: posts use updatedDate else pubDate; other pages use the latest commit date.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const postsDir = join(process.cwd(), 'src', 'content', 'posts');
const fm = (text, key) => text.match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];

let siteWide;
function siteLastmod() {
	if (!siteWide) {
		try { siteWide = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { siteWide = ''; }
		if (!siteWide) siteWide = new Date().toISOString();
	}
	return siteWide;
}
let dates;
export function lastmodFor(pathname) {
	const m = pathname.match(/^\/posts\/([^/]+)\/?$/);
	if (m) {
		if (!dates) {
			dates = new Map();
			for (const f of readdirSync(postsDir)) {
				if (!f.endsWith('.md')) continue;
				const head = readFileSync(join(postsDir, f), 'utf8').split(/^---\s*$/m)[1] ?? '';
				const d = fm(head, 'updatedDate') ?? fm(head, 'pubDate');
				if (d) dates.set(f.slice(0, -3), d);
			}
		}
		const d = dates.get(m[1]);
		if (d) return new Date(`${d}T00:00:00Z`).toISOString();
	}
	return new Date(siteLastmod()).toISOString();
}
