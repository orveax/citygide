# UX-02 — Cards and discovery refinement / Sprint 2

Date: 9 November 2026. Status: draft for visual Preview QA and founder review.

## Product problem

There are 265 canonical visitor-facing places, but listing cards previously repeated three generic architectural scenes. In a discovery directory, those prominent images were not evidence of an actual premises and made different organizations look interchangeable. Search and category filters also had no clear removable summary of the active constraints.

## Implementation decisions

1. **Data-first cards:** category-specific typographic visual treatment, compact header, stronger entity name and address reading order. The listing card no longer adds a generic building photo. Homepage and individual profiles retain explicitly disclosed conceptual imagery.
2. **Two distinct trust states in content:** source/publication maturity and visitor access remain independently labeled. Neither can imply current occupancy, opening hours or verified directions.
3. **Quiet interactions:** hover changes border/shadow, not the card's position, shape or image size; focus states are visible for keyboard navigation.
4. **Active filters:** the directory shows removable chips for selected text query, district and kind, with a clear-all action for combined filters. Removing a chip resets pagination without losing other constraints; the current filter state remains reflected in the URL.
5. **Responsive density:** compact mobile cards, wider list variant on desktop; no horizontal overflow or large repeated images. Responsive acceptance targets 1363px, 545px and 340px CSS viewport widths.

## Acceptance and release gates

- [ ] Desktop/mobile visual QA on Cloudflare Preview; inspect card contrast, text wrapping, active chips, list view and empty results.
- [ ] Verify all 265 canonical results and 2 approved profiles remain unchanged.
- [ ] Verify filter chip dismissal preserves independent query/kind/zone constraints, resets page 1, and syncs the URL.
- [ ] Verify source and visit statuses and the Google Maps navigation gate are unaffected.
- [ ] Run automated tests and production build; confirm `noindex,nofollow` remains.
- [ ] Founder approves merge to `main` after visual review.

## Excluded

Interactive map, geolocation/entrance verification, local business-ownership claims, place-specific photo sourcing, modal filters, and data verification promotions remain separate workstreams.
