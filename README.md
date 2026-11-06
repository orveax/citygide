# City Guide — governed capital directory

Arabic-first City Guide for Egypt's New Administrative Capital. The public site covers only **editorially Published** places, with explicit source attribution and visitor-access cautions.

## D08 Finder-inspired UX

The current branch implements a new responsive discovery layout, inspired by MadrasThemes' Finder / City Guide demo. It uses original CSS and illustrations and preserves our independent data model.

See [the D08 implementation plan](docs/D08-finder-city-guide-plan.md) for the visual-to-data mapping, completed components, and remaining review steps.

## Running it

```bash
node --test scripts/*.test.mjs

# Production-safe output; only Published records (currently zero)
node scripts/build.mjs
# Serve the output directory using any static server
python3 -m http.server 8080 --directory dist

# LOCAL DESIGN REVIEW ONLY, with unapproved sample records
node scripts/build-preview.mjs
python3 -m http.server 8081 --directory review-dist
```

For Cloudflare Pages, keep the build command `node scripts/build.mjs` and output directory `dist`. Never deploy the internal `review-dist` directory.

## Publishing boundary

- `data/published.json` is the sole public content source. The current approved dataset is empty.
- `data/preview.json` is a small manually transcribed set of source-backed editorial samples. They are **not** approved for public release.
- `scripts/validate.mjs` enforces known public fields, unique slugs/IDs, allowed verification states, approved direction links, and separation of visitor hours from office hours.
- `scripts/build.mjs` copies only explicitly approved static assets and `Published` records; it does not package preview data, the wireframe, or internal project files.
- Neither build exposes Notion credentials or runs client-side Notion requests.
- The live site remains `noindex,nofollow` until release approval and sufficient verified, published coverage.

The authoritative editorial process, full D06/D07 collection/verification, human approval, and a future Notion-to-JSON export are separate workstreams. UI completion does not imply publication of any record.
