# UX-05 — Directory Discovery & Conversion QA

## Goal

Reduce the number of steps between searching for a government body, bank, company or building and making a safe decision about its address and visitor access. **Conversion** means reaching the right verified-context profile, not a lead submission or an unsupported promise to navigate to a building entrance.

## Observed baseline, 2026-11-09

- Search for `وزارة الاتصالات` yielded two legitimate results (the ministry and its building) out of 265 canonical exploratory records.
- Opening the ministry and clicking `رجوع إلى كل الجهات` returned to the full, unfiltered list and lost the query. This was reproduced in the live Chrome browser.
- The directory skip link and header action were labeled as results shortcuts, but targeted the top-level `<main id="places">` rather than the actual results area.
- The search form and facet controls already worked; editorial and visitor-access badges remained separate.

## Changes

1. **Discovery round-trip:** card title, image and contextual CTA all carry an encoded return to the current directory query, district, category, sort order, grid/list preference and page. Detail breadcrumb, header action and return link point to that state; direct profile visits have a safe directory fallback.
2. **Return URL safety:** only same-site `directory.html`, `approved.html` and `index.html` targets as allowed by the actual public/exploratory mode. Discard unknown filter values and unrelated parameters; reject external or script redirects.
3. **Result jump:** skip navigation and top-level action lead directly to `#results`; mobile receives a live result-count shortcut and a way back to the filter panel.
4. **Zero results:** offer count-backed single-filter relaxation choices, full reset and a path to propose a missing entity with an official source. Never substitute speculative records.
5. **Card interaction:** illustrated card area is now an accessible details link; action copy emphasizes address and visit-readiness rather than an unspecified "details" action.

## Data and safety boundaries

- No changes to `data/*.json`, editorial statuses, approval manifest, visitor hours, entrances, or Maps directions.
- Noindex stays in place until a separate launch/SEO approval.
- Source/visitor states are not merged, elevated or treated as proof of public access.
- Search counts remain calculated from the same canonical public exploration catalogue (265 records at baseline), not the 267-row source snapshot.

## Acceptance checklist

- [x] Unit/build tests, including return-state serialization, cross-mode safety and zero-result recovery.
- [x] `git diff --check`.
- [ ] Preview deploy from a separate Sprint 5 branch.
- [ ] Browser QA: query → details → return (query, facets, sort, view, page preserved).
- [ ] Browser QA: zero-match relaxation, full reset, card image click.
- [ ] Browser QA: 340–390px mobile, keyboard focus and result-jump anchors.
- [ ] Founder sign-off before production merge.

## Release plan

Open a Draft PR against `main`, deploy Cloudflare Preview for browser acceptance, then merge and deploy Production only after explicit approval. Rollback is the preceding successful Production commit `1777f51760682600603c0ed8ec7ed055789cae49`.
