// Post-build checks on dist/: sitemap, robots, JSON-LD, gating, placeholder copy.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const fail = [];
const need = (c, m) => { if (!c) fail.push(m); };
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);

need(existsSync('dist/sitemap-index.xml'), 'dist/sitemap-index.xml missing');
need(existsSync('dist/sitemap-0.xml'), 'dist/sitemap-0.xml missing');
const robots = readFileSync('dist/robots.txt', 'utf8');
need(/Sitemap: https?:\/\/\S+\/sitemap-index\.xml/.test(robots), 'robots.txt has no sitemap line');
const sm = readFileSync('dist/sitemap-0.xml', 'utf8');

// Gating: every post in src with a future Auckland date must be absent from dist and sitemap.
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' });
const today = fmt.format(new Date());
const dir = 'src/content/posts';
let live = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
	const slug = f.slice(0, -3);
	const pub = readFileSync(join(dir, f), 'utf8').match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
	const built = existsSync(`dist/posts/${slug}/index.html`) || existsSync(`dist/posts/${slug}.html`);
	if (pub && pub > today) { need(!built, `gated post ${slug} (pubDate ${pub}) was built`); need(!sm.includes(`/posts/${slug}`), `gated post ${slug} is in sitemap`); }
	else {
		live++;
		need(built, `live post ${slug} not built`);
		need(sm.includes(`/posts/${slug}`), `live post ${slug} missing from sitemap`);
		const html = readFileSync(existsSync(`dist/posts/${slug}/index.html`) ? `dist/posts/${slug}/index.html` : `dist/posts/${slug}.html`, 'utf8');
		const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
		need(ld, `post ${slug} has no JSON-LD`);
		if (ld) { try { const j = JSON.parse(ld[1].replace(/&#34;/g, '"')); need(j['@type'] === 'BlogPosting', `post ${slug} JSON-LD is ${j['@type']}, want BlogPosting`); } catch { fail.push(`post ${slug} JSON-LD invalid`); } }
		need(/Last checked/.test(html), `post ${slug} missing "Last checked"`);
	}
}
// Placeholder / leftover-template copy in built HTML.
for (const f of walk('dist').filter((x) => x.endsWith('.html'))) {
	const t = readFileSync(f, 'utf8');
	if (/lorem ipsum|TODO|TBD|\[LEE:|undefined|NaN/.test(t.replace(/<script[\s\S]*?<\/script>/g, ''))) fail.push(`placeholder or bad text in ${f}`);
	if (!/<link rel="canonical"/.test(t)) fail.push(`no canonical in ${f}`);
}
need(existsSync('dist/index.html') && /Import Owner NZ/.test(readFileSync('dist/index.html', 'utf8')), 'home page missing brand');
if (fail.length) { console.error('surfaces FAILED:\n - ' + fail.join('\n - ')); process.exit(1); }
console.log(`surfaces ok (${live} live posts, gating + sitemap + JSON-LD checked)`);
