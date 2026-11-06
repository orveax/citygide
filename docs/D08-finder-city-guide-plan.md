# D08 — Finder-inspired City Guide experience

## Decision

Use the *Finder / City Guide* demo by MadrasThemes as a UX reference for the capital directory's navigation, discovery, visual hierarchy, filters, listings, and place profiles. Preserve City Guide's own data contract, approval gate, Arabic-first content, and independent identity. Do not copy premium theme source, branding, stock photos, sample business profiles, or unlicensed assets.

Official reference: https://themeforest.net/item/finder-multipurpose-directory-listing-wordpress-theme/39235665

The demo's live site displayed a browser security challenge during initial review. The ThemeForest screenshot gallery supplied the visual baseline: white navigation, asymmetrical place-photo collage, prominent pill-shaped search, category chips, image-led listings, and generous vertical rhythm.

## Design-to-data mapping

| Visual feature | City Guide source field / rule | Guardrail |
| --- | --- | --- |
| Hero search | `name_ar`, `name_en`, `aliases`, `address`, `building_code`, `service_type` | No invented autocomplete suggestions |
| Region select | `zone` | Only Government/Financial District for now |
| Category chips | `kind` | No fabricated category counts |
| Card title & location | `name_ar`, `address`, `zone` | Do not present sample data publicly |
| Trust note | `public_access` | Unknown entry status must be disclosed |
| Detail actions | `phone`, `email`, `website` | Only populated fields appear |
| Directions | `directions_url` + `verified_entrance` + precision | No maps / directions for unverified entrances |
| Source panel | `source_url`, `last_checked` | Never turn office hours into visitor hours |
| Image panel | Original *illustrations*, keyed by `kind` | Never imply images document a specific building |

## Incremental work plan

| Step | Area | Acceptance | Status |
| --- | --- | --- | --- |
| D08-01 | Finder-inspired header, hero, architectural collage, search | AR RTL responsive layout; search works; identity is original | Implemented in branch |
| D08-02 | Category chips, listing cards, grid/list, 2 district discovery panels | Combined filters, URL deep-link, empty states; no fake ratings | Implemented in branch |
| D08-03 | Place profiles | Address precision, visitor access, contact, source and verified-only directions | Implemented in branch |
| D08-04 | Editorial-safe review | Separate local preview build; public output uses approved records only | Implemented in branch |
| D08-05 | Real editorial imagery and logos | Licensed or permissioned images; attachment provenance and evidence; fallback graphics | Pending |
| D08-06 | Real map & geolocation | Map only for records with verified pin/entrance, no simulated markers | Pending verification pipeline |
| D08-07 | Browser QA + release readiness | Desktop/mobile, keyboard, contrast, LTR strings, browser QA; human design acceptance | Pending review |

## Production and preview separation

- Public Cloudflare Pages: `node scripts/build.mjs` → `dist/`. It reads only `data/published.json`. It currently has **zero Published records** and stays `noindex`.
- Internal local review only: `node scripts/build-preview.mjs` → `review-dist/`. It reads `data/preview.json` and displays a visible internal-preview notice. **Never configure `review-dist/` as a public Pages build output or commit its generated files.**
- Source records, Notion editorial workflow, D06/D07 verification, and a future governed export remain unchanged.
- Neither mode includes user-submitted reviews, claimed business accounts, pricing, rankings, or fabricated coordinates.

## Visual reference limits

The current SVG architecture images are intentionally illustrations, not photographs of verified locations. They keep visual shape and hierarchy reviewable while source-specific image permissions are unresolved. Replace them with provenance-tracked editorial assets in D08-05, not arbitrary scraped photos.
