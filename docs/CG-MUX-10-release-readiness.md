# CG-MUX-10 — Accessibility, Measurement and Release Gate

**Date:** 2026-11-19  
**Delivery:** direct commits to `main`, Cloudflare Pages project `citygide`.

## Automated build requirements

- Every production build runs pure Node regression suites for catalogue search, Google Maps policy, service and building relationships, anonymous measurement events, and UX static-audit rules.
- Every produced HTML page (12 routes) must pass: Arabic RTL document, responsive viewport, one H1, a valid keyboard skip link, unique DOM IDs, pre-launch `noindex,nofollow`, and alt text on image elements.
- The full `scripts/build.test.mjs` suite is **not** included in the nested build (it calls `build.mjs` recursively). Run that independently in a CI job or local shell: `node --test --test-concurrency=1 scripts/build.test.mjs`.
- Build tests and static checks do **not** prove visual layout, WCAG conformance or real-world visitor arrival.

## Measurement contract — deliberately not analytics collection

`scripts/measurement.mjs` emits `cityguide:measurement` as a DOM-only `CustomEvent` when a visitor explicitly submits a search, changes a facet, opens a listing, uses a Maps action, or follows a service/district/building link. **No storage, network request, cookies, IP/session tracking, query text, place identifiers or URLs.**

Allowed enum-like payload keys: `schema`, `event`, `context`, `result_bucket`, `filter_bucket`, `action`. Buckets are `0`, `1`, `2-5`, `6-20`, `21+`. Maps action distinguishes `search` from `directions`. Unknown keys are dropped. No analytics SDK, beacon, or server-side receiver is enabled. **Metrics such as search success rate cannot be reported until a privacy-approved, governed, anonymous aggregation pipeline is intentionally connected.**

## Required manual acceptance matrix — NOT automatically passed

| Viewport | Pages | Checks |
| --- | --- | --- |
| 320px | Home, directory, services, buildings, districts, place | No horizontal overflow; readable text; accessible menus; no blocked primary action |
| 390px | Same | Search form, filters, result cards, CTA tap targets ≥44px |
| 768px | Same | Sidebar/layout transitions; no clipped status labels |
| 1440px | Same | Consistent grid, hierarchy, focus rings and navigation |
| 200% zoom | All | Reflow and legible text, no hidden controls |
| Keyboard only | All | Skip link; logical focus order; native select, search suggestions, pagination and cards |
| Reduced motion | All | Animations/transitions suppressed; no reliance on motion |
| Screen reader | Detail, directory, services | Landmark semantics, H1, status text, error/empty state and Maps labels |

## Required user-journey checks

1. Homepage → service → named place → source/visitor restrictions → return.
2. Homepage → city/district → filtered directory → place → return with same URL filters.
3. Directory zero results → remove one filter, reset all, keyboard submit.
4. Building → related office → detail → building relationship.
5. District-only / building / verified-entrance / research-only place → Maps actions, no false Directions.
6. Mobile network offline/catalogue fetch fails → explicit error; no stale or invented listings.

## Release status definition

- **Code and deployment gate:** pass only after matching GitHub `main` SHA and Cloudflare successful build/deploy.
- **Structural and pure-rule automated gate:** pass only after build logs confirm Node tests + 12-page audit.
- **Visual / keyboard / assistive-tech gate:** BLOCKED until an independent browser session verifies the matrix.
- **Publication and location evidence:** the catalogue remains exploratory; do not release unverified visitor entrances or New Alamein research as approved.

**Decision:** Production Preview for stakeholder review is acceptable once the first two gates pass. Do **not** claim unrestricted launch-ready or WCAG certification before manual acceptance and publication sign-off.
