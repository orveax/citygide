# D09 — Controlled Notion publishing | 2026-11-06

## Source of truth and current baseline

- The authoritative editorial database is [Capital Guide — Places & Organizations](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167), data source `8903b5e7-eca2-448b-9004-7b565eda97d5`.
- Direct connector query, 2026-11-06: **63 records** = 46 Source Confirmed + 17 Research + **0 Published**.
- [D07 direct verification SOP](https://app.notion.com/p/410a7a233ee18130b59dd0e9b6ea99cf) still reports zero Contact Verified and pending official replies; sending an inquiry is not verification.
- [D05 first-batch approval pack](https://app.notion.com/p/410a7a233ee1814cbdc5e967d75e5156) approves **Option A as product policy**, not individual records. NC-32 can be reviewed as an administrative-only profile; NC-15 needs current visitor confirmation; NC-38 and NC-36 remain on hold.

## Architecture

1. Notion's `Verification = Published` is a **necessary but insufficient** state. Founder approval is per-record, for exact copy, public fields and disclaimers.
2. The private server-side sync queries Notion API `POST /v1/data_sources/{id}/query` with a `status = Published` filter and pagination. Notion API version: `2026-03-11`.
3. Mapper reads exact Notion properties, strips all internal fields by allowlist, and never infers entrance, directions or visitor hours from a building/office address. It does not interpret the old `Public Hours` field.
4. A separate `data/publication-approvals.json` contains `page_id`, `place_id`, `approved_by`, `approved_at`, and `content_sha256` for *exact* public copy. Any content change breaks the hash and blocks the export and build.
5. `data/published.json` remains the only production dataset; `node scripts/build.mjs` independently checks each record against the approval manifest. `data/preview.json` and the prototype never enter `dist/`.
6. The committed release JSON and its versioned `data/releases/<date>-<digest>.json` snapshot provide an auditable rollback source. Git history plus Cloudflare deployment history provide additional rollback points.

## Workflow — only after individual founder approval

1. Review a Notion record's exact public fields and its `Evidence Scope`/official source. Do not approve unresolved conflicts or invent public access.
2. Prepare the record's approval hash from the public-only mapping (`contentHash(toPublicRecord(page))`, with `Verification` matching the final Published state); attach the exact public copy to the founder review request.
3. Founder approves that individual public copy; record the page UUID, resulting `NC-xx`, date and SHA-256 in `data/publication-approvals.json`, with `approved_by = "Mohamed Adel"`. Keep reviewer evidence in Notion, not the website.
4. Only then set Notion `Verification = Published` for that same record, after QC confirms the approved public fields match.
5. Configure a private CI or local runtime with read-only `NOTION_API_TOKEN` shared **only** to the City Guide data source (never a front-end/Cloudflare Pages variable). An existing Notion connector session does not itself create a general-purpose external API key.
6. Run `node scripts/sync-published.mjs` for a read-only dry-run. This does not write files. Then run `node scripts/sync-published.mjs --write` after inspecting the candidate count and diffs. For deliberate takedowns use `--allow-removal`; for an intentional empty release use `--allow-empty`.
7. Review the generated JSON and release snapshot in a PR, run tests + `node scripts/build.mjs`, obtain release approval, merge, and inspect the live Cloudflare page. A successful build is not permission to turn off `noindex`.

## Fail-closed acceptance checks

- `Source Confirmed` and `Research` never appear via the production API query or compiled JSON.
- Missing per-record founder sign-off, duplicate approvals, stale content digests and missing public source block publishing.
- A directions URL without a separately confirmed visitor entrance/pin blocks publishing.
- Internal Notes, Verified By, Change Reason, phone-call evidence, Notion auth and deprecated `Public Hours` never appear in the output.
- New releases cannot silently delete an existing published place; explicit removal override and a reviewable diff are required.
- CI executes all schema, security, catalog and publishing tests; public output stays `noindex` pending the separate launch decision.

## Current release decision

**NO-GO for publishing entity profiles.** Zero per-record approvals. The code-level pipeline is ready for review; it has not promoted any Notion status or written a nonempty public dataset. The next business action is first individual founder sign-off following the evidence review, starting with NC-32.
