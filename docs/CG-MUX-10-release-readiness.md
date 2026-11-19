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


## Validation performed — 19 November 2026

- Cloudflare Production run `74ba79a2-646c-49da-991d-1dea139e42cc` succeeded from `main` commit `1522e39bc65fa201118ca16dcb99c9bd3b63601a`.
- **46/46 Node tests PASSED**, confirmed in Cloudflare build logs; six selected pure suites ran as a blocking build gate.
- **12/12 public pages passed structural UX audit**, confirmed in Cloudflare build logs.
- Browser Rendering screenshots of the live directory were actually inspected at **320px and 390px**. The top-of-page mobile layout and start of the search sidebar displayed without obvious horizontal clipping in those screenshots. This is **not** full-page, interaction, or device QA.
- Cloudflare Browser Rendering returned HTTP 429 for the 1440px screenshot request. Desktop visual acceptance at 1440px and tablet at 768px therefore remain **NOT VERIFIED**.
- Full `scripts/build.test.mjs` independent run, screen reader, keyboard-only paths, 200% zoom, automated color contrast, and interactive end-to-end workflows remain **NOT VERIFIED**.
- Because `cityguide:measurement` has no reporting backend, real visitor funnel metrics remain **NOT COLLECTED**. Do not report conversion rates or search success statistics.

**Release verdict:** **CONDITIONAL INTERNAL/STAKEHOLDER PREVIEW APPROVED**, **PUBLIC LAUNCH SIGN-OFF BLOCKED** pending the manual cross-viewport/keyboard/screen reader matrix, full build regression suite and editorial publication checks. Site remains `noindex,nofollow`.

### START — CG-REL-01: Browser Acceptance & Public Launch Gate

Continue from the verified automated baseline with the remaining manual visual, keyboard, RTL zoom, assistive technology and page-journey tests. Only publish public-release status if all blocking findings are resolved and the editorial/public-access evidence gate is separately approved.
