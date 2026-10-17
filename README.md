# Import Owner NZ

Running a Japanese import in New Zealand. Astro static blog.

- `npm ci && npm run verify` (Node >= 22, see `.nvmrc`): locks, unit tests, build, surface checks (sitemap, robots, JSON-LD, gating, placeholder text).
- Posts: `src/content/posts/<slug>.md`. A future `pubDate` (Pacific/Auckland day) keeps a post out of pages and the sitemap until that day.
- `docs/workflows/*.yml`: staged GitHub Actions (daily unlock, verify). Move to `.github/workflows/` when the token has `workflow` scope.
- `docs/locks.json` + `scripts/check-locks.mjs`: locks ledger. `docs/rules.md` holds locked rule lines.
- Branding: own simple palette in `src/styles/global.css`; author `Import Owner NZ`. Home and About copy are marked `MIMIC` in source for the copywriter.
- Plan lives in the Second Brain (Blogging/jp-import-blog-plan.md).
