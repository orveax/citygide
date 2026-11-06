# D16 — Company directory expansion (7 Nov 2026)

## Purpose and outcome

The 64-place exploratory pilot only had **two Company records**. Nine new company-related entries were researched against primarily first-party business sources, created in the Notion `Capital Guide — Places & Organizations` database as **NC-65–NC-73**, and manually mirrored as public allowlisted data in `data/exploration.json`. The catalogue now has **73 total records, 11 Company records**, while `data/published.json` continues to have exactly two founder-approved records.

## Evidence tiers and visitor safety

| Place ID | Entry | Editorial status | Verified claim | Unverified claim |
| --- | --- | --- | --- | --- |
| NC-65 | Regus — Sixty Walk | Source Confirmed | Operator lists workspaces at 12-A2, second floor | Visitor entrance/pin |
| NC-66 | Regus — Financial Hub | Source Confirmed | Operator lists flexible work center in Financial Hub | Visitor entrance/pin |
| NC-67 | Carrefour Market — Sixty Walk 2 | Source Confirmed | Retailer lists store and opening hours; developer locates project in financial district | Visitor entrance/pin |
| NC-68 | IC Group — The Office | Research | Developer owns an office project in district | Developer HQ at project |
| NC-69 | Al-Borouj Misr — Sixty Walk | Research | Developer projects in district | Developer HQ at project |
| NC-70 | Modad Developments — Sector | Research | Developer project in district | Developer HQ at project |
| NC-71 | SUD — Financial Hub | Research | Developer project and AFM operating agreement | Developer HQ / public reception at project |
| NC-72 | AFM (DORRA) — Financial Hub | Research | Facility-management agreement announced | Operating status / AFM office at project |
| NC-73 | VOW Developments — SOLAS | Research | Project in district; registered head office described separately in New Cairo | VOW office at project |

The six **Research** entries are associations between a company and a real-estate project, **not located/operating company offices**. They use `District Only`, `Facility`, no telephone or coordinates, and no Google Maps action. The three first-party **Source Confirmed** operational service-point listings can offer Google Maps *search*, with visible caveats, not automatic navigation to an unverified entrance. None of these nine were marked `Published` or given a verified entrance.

## Source provenance

- Regus Sixty Walk: https://www.regus.com/es/eg/7965
- Regus Financial Hub: https://www.regus.cn/coworking-space/egypt/%E5%BC%80%E7%BD%97/cairo-new-capital-financial-hub
- Carrefour official store finder: https://www.carrefouregypt.com/mafegy/en/n/c/clp_carrefour-store-finder-egypt
- Sixty Walk Two official project: https://alborouj-eg.com/sixty-walk-two/
- IC Group: https://icgroupeg.com/projects/theoffice/
- Al-Borouj Misr: https://alborouj-eg.com/sixty-walk-one/
- Modad: https://modaddevelopment.com/
- SUD / AFM announcement (5 Nov 2026): https://sud.com.eg/ar/sud-signs-agreement-with-afm-to-manage-and-operate-financial-hub-at-new-capital/
- VOW SOLAS brochure: https://vowdevelopments.com/wp-content/uploads/2022/03/Solas-Brochure.pdf

## Maintenance and QA

The Notion database is source-of-truth, but the website JSON remains a dated, **manual snapshot**, not a live Notion sync. Notion Query Data Source hit a temporary workspace allowance after creation; each new page was fetched directly to confirm IDs NC-65–NC-73 and properties. Reconcile later via database query or view when available. Run tests/build, verify 73 cards and 11 Company-filter results in the deployed visitor UI; verify Source Confirmed versus Research warnings and Google Maps search restrictions. D09 approval pipeline and `noindex,nofollow` remain enforced.
