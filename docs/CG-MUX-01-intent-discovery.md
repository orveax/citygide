# CG-MUX-01 — Homepage task-driven discovery

Product reference: https://app.notion.com/p/41da7a233ee1814a95a4f482dc3ef97e

## Research translated to UX
- Yellow Pages Egypt: start by what/where, show contacts and location; don't copy generic catalogue breadth.
- Alamien Now: find local activities and services by user intent; don't build its marketplace or booking features.
- City Guide before this change: full entity-kind chips and search, but no direct service searches under the homepage search form.

## Implemented
- Four safe, real intent links beneath homepage search: التوثيق، تصديقات الخارجية، التوقيع الإلكتروني، الجهات والمواقع المصرفية.
- The existing category row remains as a second choice, now introduced as 'أو تصفح حسب نوع الجهة'.
- Existing directory URL query parameters and #results anchor only. No new app API, dataset, approved entrance or contact info.
- Responsive wrapping and two-column small-screen grid, keyboard-visible focus, and disclosure that results are exploratory.
- All four searches have results in the current source-controlled exploratory data snapshot.

## Acceptance
1. Node tests assert exact link query values, existing matches, keyboard focus styles, mobile grid and no unapproved navigation hints.
2. Existing data/build tests and build must pass in GitHub Actions.
3. Visual review before merge on desktop, tablet, 390px and 320px mobile, plus keyboard tab order.
4. No data edits, no new Directions links, no change to Publication/Visitor Release, no brand redesign.
5. Later measurement: establish click and search success baseline before claiming improvements.

State: Stage 1 proposal in isolated PR; not released to production.
