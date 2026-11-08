# UX-03 — Faceted Discovery, Preview Only

## Decision

The first discovery enhancement after UX-02 is navigation clarity, not adding more controls or unverified pins. A user deciding where to look should see the actual size of the Government and Financial District result sets, then narrow by entity type without a blind dropdown.

## Scope

- Data-derived area shortcuts above the results: All, Government District, Financial District, and unconfirmed location. The last category is not promoted as an actual third district.
- Contextual count badges in the entity-type sidebar chips and both `zone`/`kind` select menus.
- Each facet count respects the search query and the *other* selected facet, but ignores its own active selection to show alternative choices.
- A shortcut updates the same `zone` control used by the existing filtering, pagination, URL state and removable filter chips.
- No new records, visitor claims, review state, pin, location, analytics or indexing change.

## QA acceptance

- [ ] Default directory counts show 265 canonical records, with 140 Government District, 122 Financial District, 3 location-not-confirmed.
- [ ] Changing query or type updates contextual area counts without altering source data.
- [ ] Area shortcut selection updates the URL, active chip and page 1; query and type remain selected.
- [ ] A directory with no results shows zero-count alternatives honestly; removing a filter returns the available records.
- [ ] Mobile widths of 340px and 545px show shortcuts without horizontal page overflow.
- [ ] `/approved.html` derives counts from its two approved records only, not the exploratory data.
- [ ] GitHub tests, build and Preview deployment pass before merge.

## Release boundary

This sprint starts as a separate Draft PR against `main`. Founder visual review is required before another production merge. The existing 265 exploration records and two approved records remain as previously governed.
