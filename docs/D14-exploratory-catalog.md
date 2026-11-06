# D14 — Founder-authorized exploratory catalogue

Date: 2026-11-06. Founder: Mohamed Adel.

## Decision and publication boundary

The founder explicitly requested a realistic user experience containing **all existing Notion places and organizations, including records without publication approval**. This authorizes a **separately labeled, public exploratory experience** at `/explore.html`; it does **not** change the formal `Published` status of unapproved records.

- `/directory.html` and the default `/place.html` still consume the content-hash-locked `data/places.json` with only founder-approved `Published` records.
- `/explore.html` and `/explore-place.html` consume `data/exploration.json`, with obvious warnings and per-card verification labels. They are publicly reachable, but `noindex,nofollow` remains in the document and response headers. **Noindex is not access control**; this is a deliberate limited editorial disclosure and must not be represented as private.
- The internal `data/preview.json`, prototype, internal Notion `Notes`, `Evidence Scope`, `Change Reason`, reviewer details, coordinates, and approval metadata remain excluded from public output.
- Exploratory records never gain a route to an unverified entrance. Research-only records do not offer a Maps search button; building-confirmed Source Confirmed records may only open a visibly caveated Google Maps address search, never navigation.

## Notion snapshot (6 Nov 2026)

64 records: 2 Published, 45 Source Confirmed, 17 Research. Kinds: 28 Government, 20 Authority, 12 Bank, 2 Company, 1 Building, 1 District.

- 48 records lacked public page slugs: deterministic `nc-<Place ID>-explore` identifiers were assigned for **exploratory** links without changing Notion.
- 2 records had no address: their public preview says `العنوان غير منشور — قيد التحقق`.
- Some Research records contain only a general government directory source or explicit *قيد التحقق* wording. They are clearly marked as research, not as validated destinations.
- Published records in exploratory data must match `data/published.json` byte-for-byte after JSON parsing; changes must be approved in the normal D09 pipeline.
- Source link and last checked date are retained, but private notes and uncertain phone numbers for Research rows are not exported.

## Operation and acceptance

Run `node --test scripts/*.test.mjs` and `node scripts/build.mjs`. Check both exploratory pages, Arabic search, category/zone filters, both Approved and Research status badges, Google Maps restrictions, 404/unknown slug, phone and source links. Do not lift noindex until separate launch sign-off.

Data is a dated snapshot, not a live Notion integration. The next refresh should use the same allowlisted export and source-diff review, with an owner assigned for data quality and stale records. A final QA pass remains scheduled after the UX iterations as requested.
