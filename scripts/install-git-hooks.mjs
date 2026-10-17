// `npm install` (prepare) points git at .githooks/ so the image pre-commit hook runs.
// No-op on Vercel/CI, outside a git checkout, or when core.hooksPath is already set to something else.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (process.env.VERCEL || process.env.CI || !existsSync('.git')) process.exit(0);
try {
	let current = '';
	try {
		current = execFileSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' }).trim();
	} catch {}
	if (current && current !== '.githooks') {
		console.log(`[install-git-hooks] core.hooksPath is ${current}; leaving it. Run .githooks/pre-commit yourself.`);
	} else if (!current) {
		execFileSync('git', ['config', 'core.hooksPath', '.githooks']);
		console.log('[install-git-hooks] core.hooksPath -> .githooks (image pre-commit hook)');
	}
} catch {
	// never fail an install over hooks
}
