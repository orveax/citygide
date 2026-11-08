# UX-01 — Discovery Experience / Sprint 1

Date: 8 November 2026. Scope: visitor UI only; no Notion data changes, source-verification promotions, new navigation pins, or release/indexing approval.

## Decision

Improve the existing Finder-inspired UI without rebuilding the site. A visitor should be able to browse the current catalogue in manageable groups, use a clearly named relevance order, and distinguish **source/publication status** from **permission to visit**.

## Delivered

1. **Live inventory numbers:** both homepage references to the catalogue size now read the canonical visitor list after loading rather than displaying historical `64` text. The editorial snapshot currently holds 267 source rows, with the D37 duplicate and D28 geographic-scope quarantine excluded, leaving 265 visible entries.
2. **Bounded listing:** dedicated directory and approved-only catalogue render 12 cards per page, with numbered accessible buttons, previous/next controls, a displayed range, and a normalized `?page=` deep link. Homepage remains a six-card sample. Search/filter/sort changes reset to page 1; a list/grid view toggle does not.
3. **Relevance option:** visitor-facing default order favors exact name/alias matches in search, then source maturity and the existing government/bank/authority focus. It is explicitly **not** a popularity or visitor-rating claim. Alphabetical and newest-source-review options remain available.
4. **Two separate status dimensions:** listing and detail UI distinguish `verification` (Research, Source Confirmed, Contact Verified, Published) from `public_access` (Unknown, By Appointment, Walk-in Confirmed). A primary-source address never becomes a public entry authorization, business opening, or verified Google Maps direction.
5. **Homepage category parity:** the Building option now exists in the search dropdown as well as the category chips.

## Checks and release boundary

- `node --test scripts/*.test.mjs`: automated validation includes exact-match precedence, source maturity sorting, pagination clamping, and independent visit/source state labels.
- `node scripts/build.mjs`: publishes only approved profiles through `data/places.json` while maintaining the separately labeled public exploratory catalogue.
- `noindex,nofollow`, founder publication approvals, and verified-entrance Google Maps gating remain unchanged.
- Before merging: review desktop and mobile preview for card density, pagination interactions and scroll position; confirm 265 total visible, 12 on page 1, page 2 deep links, reset after filters, two approved profiles, and correct Research/Source Confirmed warnings.

## Excluded from Sprint 1

Place-specific imagery, interactive map, location verification, mobile bottom-sheet filters, new contact form, and CSS architecture consolidation remain for later work. Do not equate automated tests with final visual acceptance.
