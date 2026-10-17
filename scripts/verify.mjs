#!/usr/bin/env node
// THE verify command: npm run verify (full, builds) | npm run verify -- --fast (no build)
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const [maj] = process.versions.node.split('.').map(Number);
if (maj < 22) {
	console.error(`[verify] Node ${process.versions.node} < 22. Re-running under node@22 via npx…`);
	const r = spawnSync('npx', ['-y', '-p', 'node@22', '--', 'node', ...process.argv.slice(1)], { stdio: 'inherit' });
	process.exit(r.status ?? 1);
}
if (!existsSync('node_modules/astro')) { console.error('[verify] run `npm ci` first (Node >= 22, see .nvmrc).'); process.exit(1); }
const fast = process.argv.includes('--fast');
const steps = [
	['locks', 'node scripts/check-locks.mjs'],
	['unit tests', 'npm test --silent'],
	...(fast ? [] : [['build', 'npx astro build'], ['surfaces', 'node scripts/verify-surfaces.mjs']]),
];
const results = [];
for (const [name, cmd] of steps) {
	const t = Date.now();
	const r = spawnSync(cmd, { shell: true, encoding: 'utf8' });
	const ok = r.status === 0;
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(14)} ${((Date.now() - t) / 1000).toFixed(1)}s`);
	if (!ok) for (const l of ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-12)) console.log(`       ${l}`);
	results.push({ name, cmd, ok });
	if (!ok) break;
}
writeFileSync('.verify-last.json', JSON.stringify({ at: new Date().toISOString(), fast, results }, null, 1));
const failed = results.find((r) => !r.ok);
if (failed) { console.log(`\nVERIFY FAILED at "${failed.name}". Rerun: ${failed.cmd}`); process.exit(1); }
console.log(`\nVERIFY OK (${results.length} steps${fast ? ', fast: no build' : ''})`);
