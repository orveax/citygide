# D17 — Deep Company Discovery (7 Nov 2026)

## Outcome and scope

Five more company records (NC-74–NC-78) were collected against business-managed primary sources, written into the Notion **Capital Guide — Places & Organizations** data source, and mirrored in the allowlisted exploratory catalogue. This creates **78 total catalogue records and 16 Company records** (previously 73 / 11). Of the new five, **three are Source Confirmed** for the company's own stated address, **two remain Research** because an opening is future-tense or two company channels conflict.

These are publicly sourced exploratory records; they do **not** imply independent verification of occupancy, visitor reception, entrance, or office hours. The separate two-record `Published` approval list remains untouched.

## First-party evidence register

| ID | Company / location claim | Tier | Address reliability and limitation |
| --- | --- | --- | --- |
| NC-74 | CodeCruze — New Capital HQ | Source Confirmed | Official contact page states Audaz Business Complex office B7-04. Operations address in New Cairo is separate. No entrance inspection. |
| NC-75 | HOECHST-Eg — New Capital HQ | Source Confirmed | Company's website and managed LinkedIn both state Audaz Mall B2-18. The website also contains leftover contact-template material; only the dedicated headquarters section and independent LinkedIn corroboration were retained. |
| NC-76 | Al-Wahaj Trading — Cairo regional office | Source Confirmed | Official contact page lists Business District, New Capital as MENA office. Global HQ is in Sana'a. Building, unit, and visitor reception are unknown; precision remains District Only. |
| NC-77 | Deluge Pharm — future HQ | Research | Company website says **COMING SOON** at Audaz Mall A4-31. Do not mark operating or offer navigation. |
| NC-78 | Volt Misr — disputed New Capital office | Research | Company LinkedIn lists Audaz Mall Tower A, A5-09, but official contact page lists Heliopolis, Cairo. Physical existence of another office is unconfirmed; do not route visitors. |

## Primary sources

- CodeCruze: https://codecruze.com/contact-us/
- HOECHST-Eg: https://hoechst-eg.com/index.php/contact-us/ and https://www.linkedin.com/company/hoechst-pharmaceutical-industry
- Al-Wahaj Trading: https://www.al-wahaj.com/contact.html
- Deluge Pharm: https://delugepharm.com/skin.php
- Volt Misr: https://www.linkedin.com/company/volt-misr and conflicting https://www.voltmisr.com/contact-us

## Verification and publishing controls

- This batch is based on company statements, not independently observed tenancy. `Source Confirmed` describes a source-backed claim only.
- A named office unit does not prove its entrance, operating hours, public access, or a safe navigable pin. All five have `verified_entrance: false` and blank `directions_url`.
- Future-tense and conflicting-source records stay in Research with `District Only` precision and visitor warnings.
- No data was bulk-copied from governmental commercial-register PDF journals, which carry republication restrictions.
- The visitor catalogue is a dated manually synced snapshot. Notion is the editorial source of truth; scheduled synchronization and independent phone/site checks are follow-up work.

## Next verification queue

1. Call **CodeCruze** and **HOECHST** for entrance instructions, office hours, and appointments; record respondent/date and verify matching pin.
2. Ask **Al-Wahaj** for its Cairo regional building, suite, and onsite operating status.
3. Ask **Deluge Pharm** whether Audaz A4-31 is open; keep Research while site says Coming Soon.
4. Resolve **Volt Misr** address discrepancy directly before showing a visitor location.
5. Continue first-party company discovery in financial/business and government districts; exclude developer project promotions from claims of operating company offices.

## QA

Build/test validation checks the five IDs, counts, status tiers, and lack of navigation for unresolved addresses. The baseline `data/published.json` still contains exactly two approved records; the site remains `noindex,nofollow` pending launch sign-off.
