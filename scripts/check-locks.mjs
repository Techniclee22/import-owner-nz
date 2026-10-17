#!/usr/bin/env node
// Lee's locks as data. docs/locks.json lists (a) artifacts whose bytes are locked and (b) lock-doc lines that must never be deleted.
//   node scripts/check-locks.mjs                                         verify
//   node scripts/check-locks.mjs --lock <path> --why "<reason>" --approval "<Lee's words + date>"   add a lock
//   node scripts/check-locks.mjs --relock <path> --approval "<Lee's words + date>"                  after Lee changes a lock
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const LEDGER = 'docs/locks.json';
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i > 0 ? args[i + 1] : ''; };
const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
const save = () => writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n');

if (args[0] === '--lock' || args[0] === '--relock') {
	const path = args[1], approval = opt('--approval');
	if (!approval || approval.length < 20) { console.error('[locks] needs --approval "<Lee\'s words and date>" (>= 20 chars). Agents cannot lock/unlock on their own.'); process.exit(2); }
	if (!existsSync(path)) { console.error(`[locks] ${path} does not exist`); process.exit(2); }
	let a = ledger.artifacts.find((x) => x.path === path);
	if (args[0] === '--lock') {
		if (a) { console.error(`[locks] ${path} already locked; use --relock`); process.exit(2); }
		a = { path, why: opt('--why') || 'locked by Lee', lockedBy: 'Lee' };
		ledger.artifacts.push(a);
	} else if (!a) { console.error(`[locks] ${path} is not in ${LEDGER}`); process.exit(2); }
	a.sha256 = sha(path); a.approval = approval; save();
	console.log(`[locks] ${args[0].slice(2)}ed ${path}`); process.exit(0);
}
let bad = 0;
for (const a of ledger.artifacts) {
	if (!existsSync(a.path)) { console.error(`[locks] LOCKED file missing: ${a.path} (${a.why})`); bad++; continue; }
	if (sha(a.path) !== a.sha256) { console.error(`[locks] ${a.path} changed but Lee locked it: ${a.why}. Revert it, or if Lee asked: --relock ${a.path} --approval "<Lee's words, date>"`); bad++; }
}
for (const { file, lines } of ledger.lockedLines) {
	const have = new Set(readFileSync(file, 'utf8').split('\n').map((l) => l.trim()));
	for (const l of lines) if (!have.has(l)) { console.error(`[locks] locked line deleted from ${file}: "${l.slice(0, 90)}"`); bad++; }
}
console.log(`[locks] ${ledger.artifacts.length} artifacts, ${ledger.lockedLines.reduce((n, x) => n + x.lines.length, 0)} lock lines, ${bad} violations`);
process.exit(bad ? 1 : 0);
