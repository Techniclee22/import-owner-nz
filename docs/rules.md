# Import Owner NZ: rules (locked lines are checked by `npm run check:locks`)

- Every post carries a lastChecked date and its primary sources (NZTA first).
- No legal, financial or safety advice beyond sourced facts.
- No invented numbers, listings or personal experience. Anything Lee must supply is marked [LEE: ...].
- Future-dated posts (pubDate after today, Pacific/Auckland) must never appear in pages or the sitemap.
- Nothing is bought or published live without Lee's approval.

## Publishing
Posts live in `src/content/posts/<slug>.md`. Set `pubDate` in the future to queue; the Daily Publish Unlock Action rebuilds the site each day at 00:05 NZ so the post goes live on its date. Frontmatter: title, description (<=155 chars), pubDate, lastChecked, cluster, pillar, sources.
