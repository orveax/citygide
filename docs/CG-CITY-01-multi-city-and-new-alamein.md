# CG-CITY-01 — Multi-city Research Intake & New Alamein (19 Nov 2026)

## Decision and implementation status

**Active city remains New Administrative Capital.** Its Notion Master has **350 records**, of which **30** have CG-DATA-05/06 detailed record-level desk-audit annotations at the 19 Nov 2026 baseline and **320** still need that pass. Do not mistake the 350-row structural screen for 350 independent external checks. A recent repository snapshot contains **265 exploratory capital records** and **2 formally approved profiles**, which does not represent the full live Notion Master. These are different scopes, not grounds to overwrite live data.

The **second city is New Alamein**, enabled in the editorial **research layer only**. Ten source-bounded candidates (ALM-001 to ALM-010) have been created in the one new Notion [City Expansion Research database](https://app.notion.com/p/41da7a233ee181abbb6ddd850d1d9544). This JSON is a source-controlled review snapshot for QA; **Notion remains the editable source of truth**.

## Multi-city domain model

- `City` (stable slug + names + governorate + country) owns zones, facilities and city-facing landing pages.
- `Zone` belongs to one city; do not use ambiguous zone names as identifiers.
- `Facility` (physical building/mall/campus) belongs to one city and zone; occupancy is a separately evidenced relationship with validity dates.
- `Organization` may operate in many cities; `Branch` links one operator to a facility and service-specific scope.
- `Service` and `Delivery Channel` are separate from `Branch`; national digital service does not create a physical pin.
- `Evidence` records first-party URL, claim, captured date, source publication date (if known), scope, limitations, and any contradiction.
- `Operational Window` permits date-bound/seasonal branches and explicitly distinguishes advertised vs confirmed hours.
- `Visitor Entrance` and `Directions` require fresh independent field verification and explicit human release.
- `Publication Approval` remains independent of evidence status and route approval.

### Migration gates (do not alter published v0.1 schema yet)

1. Read-only reconciliation: map all 350 Capital Master NC IDs to `city_id=new-capital` without creating duplicate records.
2. Dual-source staging (Capital Master + City Expansion Research) with an explicit city key and conflict/audit exports.
3. Normalize parent facility/tenant/branch relationships; preserve old NC IDs and current approved hashes.
4. Introduce `city_id` as a validated, required public field **only in a versioned migration** after adding compatibility tests and obtaining approval for existing published content.
5. Add city-specific directory routes and noindex staging previews; keep ALM entries absent until editorial and visitor-entrance release passes.

## Eight Alamein source candidates — NOT live places

| Code | Name / role | First-party evidence | Known limit |
| --- | --- | --- | --- |
| ALM-001 | المركز التكنولوجي لخدمة المواطنين والمستثمرين — جهاز العلمين الجديدة — Government Service | [رئاسة مجلس الوزراء](https://cabinet.gov.eg/News/Details/85830) | No confirmed operating hours, eligibility, visitor gate or presently available on-site service. |
| ALM-002 | بنك مصر — فرع أبراج العلمين الجديدة — Bank Branch | [Banque Misr](https://www.banquemisr.com/en/Pages/Elsahel?sc_lang=en) | No branch-specific hours, accessible entrance or confirmed permanent vs seasonal operation. |
| ALM-003 | CIB — فرع العلمين الجديدة — Bank Branch | [CIB Egypt](https://www.cibeg.com/Arabic/Business/BusinessBanking/Pages/branch-finder.aspx) | Precise unit, operating hours, year-round availability and public access not established. |
| ALM-004 | Orange — فرع العلمين الجديدة O Mall — Telecom Branch | [Orange Egypt](https://www.orange.eg/ar/Documents/National%20Shops%20AR.pdf) | Document may not be contemporaneous; stated gate is published address text, NOT verified visitor navigation entrance. |
| ALM-005 | جامعة العلمين الدولية AIU — University | [Alamein International University](https://aiu.edu.eg/contact-us/) | Arabic line on same page uses EG1 whereas English uses ED1; code conflict, visitor gate and public eligibility unresolved. |
| ALM-006 | الأكاديمية العربية للعلوم والتكنولوجيا — حرم العلمين — University | [AASTMT](https://www.aast.edu/en/campuses/Elalamein/) | Specific visitor entrance, accepted walk-in service and campus office hours unverified. |
| ALM-007 | North Square Mall — نورث سكوير — Commercial Facility | [City Edge Developments](https://cityedgedevelopments.com/project/north-square-mall/) | Listing describes development, NOT verified tenant inventory, operating businesses or approved entrance. |
| ALM-008 | Downtown Commercial — داون تاون التجاري — Property Asset | [City Edge Developments](https://cityedgedevelopments.com/project-type/retail-en/) | Asset != individual shop; store occupancy and access cannot be inferred. |
| ALM-009 | بنك مصر — ماكينة ATM بمول O Mall — ATM | [Banque Misr](https://banquemisr.com/ar-EG/Home/Pages/Elsahel) | No proven uptime, entry eligibility, 24-hour access or gate; separate from ALM-002 branch |\n| ALM-010 | سيتي إيدج — مركز مبيعات العلمين الجديدة — Sales Office | [City Edge](https://cityedgedevelopments.com/ar/contact-us-ar/) | Published hours and central contact, NOT guaranteed walk-in, current staffed hours or verified entrance |\n
All ten candidates have `visitor_hours=null`, `directions_url=null`, `verified_entrance=false`, and `release_approved=false`. A property development listing is not a verified shop list. University campus identity is not public access. Operator-published mall gate text is not field-verified directions.

## Capital P0 continuation

- CG-DATA-06 (19 Nov): 8 previously unclassified Capital Master records (NC-15, NC-108, NC-111, NC-112, NC-120, NC-143, NC-144, NC-162) received record-level audit/gap classifications and source-bound trace notes. This adds to 22 CG-DATA-05 detailed records, bringing that tracked cohort to **30 / 350**, not 30 external/field verifications.\n- 71 P0 candidate records in the 350-row baseline are *triage priority*, not source-verified walk-in services.
- Perform operator/official verification for **bank retail branches, ATMs, public counters** before spending on non-visitor investment/property records.
- Protect human release boundaries; investigate the two earlier Published-status records lacking named visitor-release approvers.
- Resolve known NC-35 / NC-202 identity and other parent-building conflicts without deletion or fabricated location.

## Release and QA gates

- Only source-linked candidates enter internal research.
- No entry into `data/published.json`, `data/exploration.json`, approved route maps, production CMS, or Directions as part of this change.
- The research validator and tests must pass in CI; the existing `node --test scripts/*.test.mjs` command includes them.
- Operators must reconfirm seasonality, public eligibility and visitor entry; an independent reviewer must check entrance/pin before any founder-signed promotion.

## Next work

- Alamein: confirm current Banque Misr/CIB/Orange hours and seasonal status; identify actual shopping tenant directories and government service menu.
- Capital: work the remaining 328 detailed audits in P0→P1→P2 order, not as an undifferentiated bulk publish.
- After a minimum sufficiently verified Alamein sample and a proven city filter, propose the public migration as a separate, reviewable change.
