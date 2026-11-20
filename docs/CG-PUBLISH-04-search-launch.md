# CG-PUBLISH-04 — Search Launch Runbook

Status: **PRELAUNCH — DO NOT SUBMIT SITEMAP OR ENABLE INDEXING YET**
Baseline: 20 November 2026, Cloudflare Pages `citygide`, `main`, development hostname `citygide.pages.dev`.

## Verified release facts
- Capital master registry: 350 records; public de-duplicated catalogue: 348 pages.
- New Alamein: 33 source-scoped research pages; **none** automatically eligible for SEO indexing.
- SEO editorial candidates: 215 pages under current conservative information-quality gate. **Candidate does not mean human-approved for indexing.**
- Building relationships: 12 curated buildings containing 14 source-associated entities. Associations **do not** prove occupancy, opening, public access or routes.
- 22 additional records contain relationship evidence warranting independent matching. Full Notion relational-property sync **not yet closed** (Notion SQL limit).
- Public `sitemap-preview.xml` is a technical dry run only. Never submit it in Search Console.
- Global noindex currently exists in both page metadata and Cloudflare `X-Robots-Tag` headers; `robots.txt` allows crawling so Googlebot can read noindex.

## Launch gates (all mandatory)
1. Approve a **permanent brand-owned hostname** and bind it to the Cloudflare Pages production project; confirm HTTPS and preferred host redirects. The Pages development subdomain is not the desired canonical site.
2. Review the `data/seo-review.json` candidates. Each page requires identity, source-specific evidence, a useful description, no unresolved conflicts, correct organization/branch context, and no misleading visitor-entry or opening claims. Record a *separate* editor indexing approval list.
3. Keep conflicted, duplicate, research-only, archived, seasonal-unknown and future-project records out of the public index until separately reviewed. New Alamein remains on hold for initial indexing.
4. Implement one canonical URL per approved record on the permanent domain. Ensure navigation, internal links, sitemap, and redirects agree. Avoid duplicate query-string and path URL indexing. Check page source and rendered DOM on mobile and desktop.
5. Generate the actual `sitemap.xml` **only from explicitly approved, canonical indexable URLs**, not all 381 pages. Do not ship conflicting `noindex`, `X-Robots-Tag` or `robots.txt` rules. Excluded URLs must remain individually noindexed. No route directions may be enabled by an indexing decision.
6. Verify ownership of the **permanent domain** in Google Search Console. Submit production sitemap there; inspect a sample of approved and excluded URLs. Sitemap submission does not guarantee indexing.
7. Inspect Search Console Page Indexing, query impressions, organic clicks, click-through, page views and index coverage weekly. Maintain evidence freshness, audit/change logs and a rollback mechanism.

## Operational ownership
- Founder/editor approves **indexing** separately from data-source status.
- Data researcher/QA validates source assertions and detects conflicts.
- Engineering maintains canonical URL mapping, redirect rules, build gates, analytics and sitemap generation.
- Visitor access verification remains a separate field/operations decision.

## Build artifacts
- `data/seo-review.json`: candidate and hold list with reasons.
- `data/relationship-audit.json`: curated link counts and unresolved evidence IDs.
- `sitemap-preview.xml`: dry-run draft on Pages hostname, not submitted.
- `data/launch-readiness.json`: synced registry inventory.
- `robots.txt`: allows crawlers to read existing `noindex`; not a public-index release.
- `_headers`: global `X-Robots-Tag: noindex, nofollow` until explicitly revised.

## Completion definition
Launch is completed **only** when the permanent domain, individual editorial index approvals, production sitemap and Search Console verification are all confirmed and live. Deployment success alone is not Google Search launch.
