# CG-PUBLISH-05 — Domain, Canonical and Controlled Search Launch

## Release status (20 November 2026)
**PRELAUNCH HOLD.** GitHub main deploys to Cloudflare Pages project `citygide`. Live development hostname: `https://citygide.pages.dev`. Cloudflare account currently has **no custom domain attached to City Guide**, and no City Guide-specific DNS zone. The available zones are used by other brands. **No external Google Search Console submission or ownership verification was performed.**

## Implemented and verified
- `data/search-launch-config.json` holds the explicit release switches, domain, Search Console, redirect verification and named editorial approvals. Defaults are all OFF; no assumptions about the final product brand.
- `scripts/search-launch.mjs` blocks a production launch without a permanent HTTPS origin, verified domain, verified Pages development-host redirect, Google Search Console verification and individually named, dated approvals.
- Each editorial approval must belong to the **current** SEO review candidate list. Research/conflict-hold pages are excluded; even a `Source Confirmed` record is **not automatically authorized to index**.
- In HOLD mode, every HTML page retains `noindex` and global `X-Robots-Tag: noindex`; `robots.txt` allows crawling so crawlers can read that instruction. There is **no production `sitemap.xml`**. The earlier `sitemap-preview.xml` is a non-submittable review artifact.
- In the tested CONTROLLED_RELEASE mode, only the explicitly approved paths receive canonical links and `index,follow`; excluded HTML retains `noindex`. Only those approved paths enter production `sitemap.xml`. This was tested with an example hostname and test approval; no actual release was authorized.
- Analytics uses Cloudflare Web Analytics; it does **not** establish Search Console property ownership or indexing.

## Next operator actions
1. **Founder decides final City Guide brand and the exact registrable domain.** The earlier CitySide idea was a candidate, not an approved registered hostname. Do not take over an existing ORVEAX client domain.
2. Verify registration/ownership and place the hostname in Cloudflare DNS, bind it to the existing Pages project, verify TLS, check root/www preference and ensure the project stays on `main`.
3. Configure and verify a permanent host redirect for legacy `citygide.pages.dev` and any other duplicate host; make sure Cloudflare's preview deployments are not redirected into Production unexpectedly.
4. Create/verify the exact **Domain property** (DNS TXT) in Google Search Console for the permanent domain. Read back confirmation rather than assuming ownership.
5. Review `/data/seo-review.json` candidates. Insert approved entries in `data/search-launch-config.json` with the record ID, editorial reviewer, ISO date, `decision: "index"`. Keep review evidence and conflicts in Notion. Visitor-operation/door approval remains separate.
6. With verified domain, redirect and Search Console, set `primary_origin` (exact `https://host`, no trailing slash), `domain_verified`, `pages_dev_redirect_verified`, `search_console_verified` and `indexing_enabled`. Run complete build and production browser QA before merging/deploying.
7. Inspect `https://host/sitemap.xml`, ensure it contains only approved canonical URLs and is consistent with page-level robot directives. Submit it through verified Search Console and inspect sample indexable and excluded URLs.
8. Monitor indexing errors, impressions, clicks, CTR and analytics weekly; keep reversible indexed-page approvals under change control.

## Decision gates
- Permanent hostname or final brand **not approved** → remain HOLD.
- Search Console property **not verified** → remain HOLD.
- No named editorial approvals → remain HOLD.
- Research-only, conflicted, duplicate/quarantined, questionable visitors' services → never promote based on SEO scoring alone.
- Development Pages hostname remains usable for normal browsing but must not become an accidental permanent canonical.

## Current build evidence
Deployment `ff224315-f2d0-4e1e-8658-3bc04b4aaa4a` passed 52 test cases and reported:
`CG-PUBLISH-05 canonical/indexing gate: HOLD_NO_DOMAIN_OR_APPROVAL approved: 0`.

## Source and supporting documentation
Google Search Central: [Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
