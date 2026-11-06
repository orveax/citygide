# D15 — Expanded directory becomes the visitor default

Date: 2026-11-07. Founder: Mohamed Adel.

## Observed issue

Founder reported that the normal website appeared to contain only two places, despite D14 having deployed 64 records. Root cause: both `index.html` and `directory.html` still loaded the two-record `data/places.json`; the expanded data required discovery of a separate `/explore.html` link. This made the default visitor journey misleadingly sparse.

## Correction

- `index.html` now uses `data/exploration.json` and shows six sample results plus the full count. Search, category selection, and district selection navigate to the complete `/directory.html` results with filters preserved.
- `/directory.html` now uses all 64 source records by default. All records display their verification status, including `Research` warnings and restrictions on Maps links.
- `/explore.html` remains an alias for existing links; `/approved.html` is the clear, separate two-record approved-only view. The editorial `data/places.json` and its content-hash approval gate remain untouched.
- Neither `noindex,nofollow` nor visible warnings make exploratory records private. User has explicitly authorized public exploratory disclosure.
- The catalogue is still a 2026-11-06 snapshot, not live-synchronized Notion data.

## Acceptance checks

Confirm 64 results on default directory, six sampled cards and 64 count on home, search query and kind forwarding, 2 approved-only results, distinct Research labels, no directions for unconfirmed records, and Google Maps fallback for building-confirmed published company. Run `node --test scripts/*.test.mjs` before release, then smoke-test the deployed browser pages.
