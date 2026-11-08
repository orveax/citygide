# City Guide — governed capital directory

Arabic-first City Guide for Egypt's New Administrative Capital. After the founder's D15 navigation correction, the **primary visitor journey** (homepage sample and `/directory.html`) uses the explicitly labeled exploratory catalogue of **258 Notion-source records** (D33 primary-source verification, 8 Nov 2026), including unapproved research records. The `/explore.html` URL remains as an alias. The separate `/approved.html` view and `data/places.json` contain only **2 editorially Published** records. Unapproved records must never be represented as approved for visits. See [D14 exploration policy](docs/D14-exploratory-catalog.md), [D15 default-directory decision](docs/D15-default-expanded-directory.md), [D21 source expansion](docs/D21-service-source-expansion.md), [D22 source expansion](docs/D22-source-expansion-batch02.md), [D23 deep discovery](docs/D23-deep-discovery.md), [D24 source-backed expansion](docs/D24-deep-discovery.md), [D25 deep discovery](docs/D25-deep-discovery.md), [D26 deep discovery](docs/D26-deep-discovery.md), [D27 deep discovery](docs/D27-deep-discovery.md), [D28 tenant and service discovery](docs/D28-deep-discovery.md), [D29 visitor verification](docs/D29-visitor-verification.md), [D31 source expansion](docs/D31-source-expansion.md), [D32 primary-source expansion](docs/D32-deep-discovery.md), and [D33 source verification](docs/D33-verification-and-discovery.md).

**D29 result:** improved four existing records: QIZ's official fifth-floor office 5140 and Visitors Gate with an appointment-only renewed-certificate collection process, LTRA freight-services unit hours, the Land and Dry Ports Authority's third-floor HQ phone, and the distinction between Ministry of Finance-wide hours and a citizen counter's unknown reception hours. No new approved profile or unverified navigation pin was created.

**D30 result:** [direct-confirmation readiness](docs/D30-direct-confirmation.md) and a four-entity [contact worklist](data/direct-verification.json). Corrected QIZ certificate-collection contact to `info@qizegypt.gov.eg` and added EBank's official **16710** helpline and branch locator. No call, outreach email, reply, walk-in confirmation or entrance pin is claimed. All four worklist entries remain **Not Contacted** until verifiable outreach happens.

**D31 result:** [four more primary-source entries](docs/D31-source-expansion.md) (NC-246–249) plus agency-owned contact enrichment for the Land/Dry Ports Authority and Egyptian Customs. **249 total, 162 Source Confirmed, 85 Research, 2 Published**. Commercial-registry records prove only historical registered addresses. Contact outreach is explicitly **deferred until the end of the source-discovery sweep**.

**D32 result:** [eight more verified-source exploratory entries](docs/D32-deep-discovery.md) (NC-250–257), including a documented parliamentary notary decision and an official export-authority contact, plus **five previously unconfirmed ministries reconciled to primary sources**. **257 total, 175 Source Confirmed, 80 Research, 2 Published.** Historical registered addresses and announced developments remain unverified for visitor entry. Outreach remains deferred.

**D33 result:** [one distinct Environmental Protection Fund contact at the environment agency's Government District building](docs/D33-verification-and-discovery.md) (NC-258) and **20 existing Research records promoted to Source Confirmed** based on direct ministry, bank, developer, contractor, and official gazette evidence. **258 total, 196 Source Confirmed, 60 Research, 2 Published.** Source confirmation is explicitly scoped to the documented address, registration, or project; **no visitor access, directions, or publication was granted**. Existing records NC-52 (Land and Dry Ports Authority), NC-110 (Egyptian Environmental Affairs Agency), and several company registrations were deduplicated rather than recreated. Outreach remains deferred.

## D11 Finder-inspired visitor experience

The visitor experience adapts discovery patterns from MadrasThemes' Finder City Guide homepage v1/v2, catalogue and place pages with original CSS and illustrative assets. Public routes include the homepage, a dedicated filtered directory, verified place details, About, Contact, Terms and Privacy. No unverified ratings, prices, user accounts or directions are added.

See [the D08 implementation plan](docs/D08-finder-city-guide-plan.md) for the visual-to-data mapping, completed components, and remaining review steps.

## Running it

```bash
node --test scripts/*.test.mjs

# Production-safe output; only individually approved Published records
node scripts/build.mjs
# Serve the output directory using any static server
python3 -m http.server 8080 --directory dist

# LOCAL DESIGN REVIEW ONLY, with unapproved sample records
node scripts/build-preview.mjs
python3 -m http.server 8081 --directory review-dist
```

For Cloudflare Pages, keep the build command `node scripts/build.mjs` and output directory `dist`. Never deploy the internal `review-dist` directory.

## Publishing boundary

- `data/published.json` is the sole formal publication-approved source: NC-32 (MCIT) and NC-64 (ORVEAX). The independently labeled exploratory directory is accessible publicly by founder decision but is **not** a publication approval.
- `data/publication-approvals.json` is a second gate: even a `Published` record is rejected by the build if its exact public-facing content does not match a dated founder sign-off.
- `scripts/sync-published.mjs` fetches `Published` pages from Notion's data source on the **server** via `NOTION_API_TOKEN`, validates each exact approval, and only writes after explicit `--write`. The token is never sent to the website.
- A write creates an immutable-by-name public-only snapshot under `data/releases/`. Keep those files in version control for rollback review. `--allow-removal` and `--allow-empty` are explicit safety overrides.
- `data/preview.json` is a small manually transcribed set of source-backed editorial samples. They are **not** approved for public release.
- `scripts/validate.mjs` enforces known public fields, unique slugs/IDs, allowed verification states, approved direction links, and separation of visitor hours from office hours.
- `scripts/build.mjs` copies only explicitly approved static assets and `Published` records; it does not package preview data, the wireframe, or internal project files.
- Neither build exposes Notion credentials or runs client-side Notion requests.
- The live site remains `noindex,nofollow` until release approval and sufficient verified, published coverage.

The authoritative editorial process, full D06/D07 direct verification, and per-record human approval remain separate prerequisites. The Notion-to-JSON export is now implemented, but **not activated** without a scoped Notion API credential and signed records. UI completion does not imply publication.

The D19 direct verification queue is **open**: no visitor gates, hours or Map directions were inferred from addresses in D20–D28. See [D19 priority checks](docs/D19-visitor-verification-queue.md), [D27 priority checks](docs/D27-deep-discovery.md), and [D28 priority checks](docs/D28-deep-discovery.md). The public exploratory catalogue is a manually reconciled snapshot, not a live Notion client-side connection.

The D24–D28, D31–D33 source registers (`docs/D24-source-register.json` through `docs/D28-source-register.json`, and `docs/D31-source-register.json` through `docs/D33-source-register.json`) are the source-evidence manifests for NC-160–258, plus D33's reconciliation index; entries have corresponding Notion records. To prepare future source-backed exploratory batches, run `node scripts/append-source-register.mjs docs/<batch>.json` for a validation-only dry run; `--write` updates the local exploratory snapshot only after Notion reconciliation. It never grants publication approval or visitor navigation.

See [D09 — Controlled Notion publishing](docs/D09-controlled-publishing.md) for the approval manifest, dry run, promotion checklist, operational safeguards and rollback.
