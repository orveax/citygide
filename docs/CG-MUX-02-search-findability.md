# CG-MUX-02 — Search & Findability

## Objective
Turn existing place search into a more forgiving, source-grounded discovery path, without changing the editorial gate or adding unlicensed external search APIs.

## Changes
- Arabic/Persian numeral folding (e.g. ٢٣, ۲۳ to 23), dash/slash/comma normalization for location plot references (e.g. `A3-23`, `A3 23`). Existing Arabic hamza/ta-marbuta and search alias rules remain.
- Browser-native `<datalist>` with at most eight actual catalogue entity names. Matches may be triggered by Arabic name, English name, recorded aliases or recorded service text, but the **offered suggestion is always the real entity name**, not a generated facility/service.
- Native keyboard operation rather than a bespoke listbox. Suggestions are constrained by the currently selected zone and kind and refresh when those filters change.
- Same UX across home and directory that use the existing shared search script. No new network requests; the currently displayed catalogue dataset is the only suggestion source.
- An explicit short note clarifies that an auto-suggested listing does **not** verify visitor eligibility or precise Directions.

## Acceptance
1. All existing catalog tests pass, plus new normalization/suggestion/source-bound tests.
2. Quality build succeeds; no approved/public research data or route policy changed.
3. Mobile/desktop Preview acceptance: Arabic RTL, focus order, datalist support and fallback to ordinary form submission where the browser doesn't support datalist.
4. Check combinations of query + zone + kind; zero-result recovery remains reachable and no external redirects occur.

## Architectural note
Search suggestions read only `loadPlaces` output. Production `data/places.json` will only expose approved profiles; exploratory `data/exploration.json` may contain unapproved records with their disclosure. They must not be merged automatically.

## Next-stage START — CG-MUX-03: Directory Taxonomy & Refinement
**Entry condition:** CG-MUX-02 CI passes and visual Preview QA is accepted. Start from the MUX-02 branch after review.
**First change:** expose visitor-relevant distinctions on the directory: bank branch vs ATM vs bank HQ, government public counter vs administrative HQ, and building/facility. Prefer safe metadata-derived chips over inventing locations or recoding stored records. Show the current filter scope and count; preserve URL deep-link and keyboard access.
**Deliverable:** separate PR with clear taxonomy choices and integration tests.
**Do not:** represent every bank HQ as a customer branch, mark every ATM accessible, or expose Alamein research candidates publicly.
