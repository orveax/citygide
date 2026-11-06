# D10 — First approved public profile: NC-32

## Publication decision — 6 November 2026

Founder Mohamed Adel explicitly authorized publication of the **NC-32** information-only administrative headquarters profile in the City Guide working conversation, following the D05 Option A model. This is **not** permission to publish the rest of Batch 01, turn on location directions, or index the whole directory.

| Field | Approved public claim |
| --- | --- |
| Place | وزارة الاتصالات وتكنولوجيا المعلومات |
| Role | Administrative HQ — مقر إداري |
| Zone | Government District |
| Address | مبنى 10B-L2M، الحي الحكومي، العاصمة الإدارية الجديدة |
| Telephone | +20235341300, the ministry's published general number |
| Official source | https://mcit.gov.eg/ar/contact_us |
| Evidence | Source confirms headquarters address and general telephone only |
| Last Checked | 2026-11-06 |
| Next Review | 2026-12-06 |
| Visitor service/access | Unknown — verify with the ministry before travel |
| Entrance, visitor hours, directions | Not published; no verified visitor entrance or hours |

The website uses original generic architectural illustration for the card, **not** a photo purporting to document the real ministry building. Public access warnings remain visible. The profile's exact public JSON is content-hash approved in `data/publication-approvals.json`.

## Evidence and data controls

- Notion source record: https://app.notion.com/p/410a7a233ee181ab9beeeaa61602a1dd. Its verification status was changed from Source Confirmed to Published only after the founder's individual sign-off. The research-era page note was corrected and the change reason/next review recorded.
- First released snapshot is versioned under `data/releases/`; public build only ships `data/places.json` and approved static assets.
- No other Source Confirmed or Research record was promoted or exported. NC-15 (MFA), NC-36 (QNB) and NC-38 (ACUD) remain withheld, pending their separate evidence and approval gates.
- Public `noindex,nofollow` stays in force. One profile is a controlled review release, **not** launch authorization.

## Post-deployment acceptance

- [x] First approved record validates with `node scripts/build.mjs` and founder-signoff hash.
- [x] All 20 automated checks pass; public output contains only one record.
- [ ] Desktop/mobile browser UAT on published URL, search filters, direct detail link and telephone/source link.
- [ ] Founder reviews visual/content presentation and reports required adjustments.
- [ ] Separate launch decision for indexing and promoting additional profiles.
