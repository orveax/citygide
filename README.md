# City Guide — D05 governed publishing

## Public release gate

Cloudflare Pages: build command `node scripts/build.mjs`, output directory `dist`.
The build reads only `data/published.json`, validates every entry as `Published`,
and copies only allowlisted public assets. Preview data, the full research wireframe,
source code, and editorial files remain outside the deployed output.
The current approved dataset is empty, so the public site shows launch preparation.

Run `node --test scripts/validate.test.mjs` and `node scripts/build.mjs` before deploying.
Human approval, source verification, and accurate visitor guidance are required for every future entry.

## Historical D04 preview

Arabic-first, static HTML/CSS/JavaScript preview. This is an **internal preview**, not a public directory release.

- `data/preview.json` is a manually transcribed, limited set of source-backed records from the Notion editorial database. Its entries are not approved for public production.
- `index.html` shows searchable cards with verification cautions.
- `place.html?slug=...` shows a place profile with office hours separated from visitor hours.
- `scripts/validate.mjs` validates public export policy; in production mode it rejects anything other than `Published` records.
- `scripts/validate.test.mjs` checks filtering, duplicates, unverified directions, and disallowed private fields.

Run `node --test scripts/validate.test.mjs` and `node scripts/validate.mjs data/preview.json preview`.

Serve the directory root with a static server (for example `python3 -m http.server 8080`) to browse it. No Notion API credentials or client-side Notion requests are used.

## Publishing boundary

The preview intentionally carries status `Source Confirmed` only. **Do not upload its JSON as the production dataset.** The actual Notion-to-JSON export, moderation, and rollback integration are later D04 tasks.
