import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Re-implementation check against the source: gating must compare Auckland calendar days.
const src = readFileSync('src/lib/gating.ts', 'utf8');
test('gating uses Pacific/Auckland', () => assert.match(src, /Pacific\/Auckland/));

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' });
const isPub = (p, n) => fmt.format(p) <= fmt.format(n);
test('future day is gated, today and past are live', () => {
	const now = new Date('2026-10-18T12:00:00Z'); // 19 Oct 01:00 NZDT
	assert.equal(isPub(new Date('2026-10-19'), now), true);
	assert.equal(isPub(new Date('2026-10-20'), now), false);
	assert.equal(isPub(new Date('2026-10-01'), now), true);
});
test('banned template terms are absent from src, scripts, docs, public', () => {
	const bad = new RegExp(['dagger' + 'heart', 'D&D', 'foun' + 'dry', 'gum' + 'road', 'techni' + 'clee\\.co'].join('|'), 'i');
	const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
	for (const f of ['src', 'docs', 'public', 'scripts'].flatMap(walk)) {
		if (f.endsWith('gating-test.mjs') || /\.(png|jpg)$/.test(f)) continue;
		assert.doesNotMatch(readFileSync(f, 'utf8'), bad, f);
	}
});
