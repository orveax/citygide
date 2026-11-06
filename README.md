# City Guide — governed capital directory

Arabic-first City Guide for Egypt's New Administrative Capital. The primary public directory covers only **editorially Published** places, with explicit source attribution and visitor-access cautions. The separate, prominently labeled `/explore.html` experience includes unapproved Notion research records by explicit founder request; its records must not be represented as approved for visits. See [D14 exploration policy](docs/D14-exploratory-catalog.md).

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

- `data/published.json` is the sole public content source. The first approved administrative-only NC-32 profile is published; all other candidates remain withheld.
- `data/publication-approvals.json` is a second gate: even a `Published` record is rejected by the build if its exact public-facing content does not match a dated founder sign-off.
- `scripts/sync-published.mjs` fetches `Published` pages from Notion's data source on the **server** via `NOTION_API_TOKEN`, validates each exact approval, and only writes after explicit `--write`. The token is never sent to the website.
- A write creates an immutable-by-name public-only snapshot under `data/releases/`. Keep those files in version control for rollback review. `--allow-removal` and `--allow-empty` are explicit safety overrides.
- `data/preview.json` is a small manually transcribed set of source-backed editorial samples. They are **not** approved for public release.
- `scripts/validate.mjs` enforces known public fields, unique slugs/IDs, allowed verification states, approved direction links, and separation of visitor hours from office hours.
- `scripts/build.mjs` copies only explicitly approved static assets and `Published` records; it does not package preview data, the wireframe, or internal project files.
- Neither build exposes Notion credentials or runs client-side Notion requests.
- The live site remains `noindex,nofollow` until release approval and sufficient verified, published coverage.

The authoritative editorial process, full D06/D07 direct verification, and per-record human approval remain separate prerequisites. The Notion-to-JSON export is now implemented, but **not activated** without a scoped Notion API credential and signed records. UI completion does not imply publication.

See [D09 — Controlled Notion publishing](docs/D09-controlled-publishing.md) for the approval manifest, dry run, promotion checklist, operational safeguards and rollback.
