# D28 — Actual tenants, public-facing service units, and historical registration boundaries

Checked: **8 November 2026**. Scope: only Government District and the **banks/financial quarter** of Egypt's New Administrative Capital, not projects elsewhere branded CBD. Editorial source of truth: [Capital Guide Notion register](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167).

## Reconciled directory result

| State | D27 | D28 | Delta |
|---|---:|---:|---:|
| Unique records | 238 | **245** | **+7** |
| Source Confirmed | 152 | **158** | +6 |
| Research | 84 | **85** | +1 |
| Published | 2 | **2** | 0 |

The seven new records are **two historically registered companies and five separately identifiable government-facing services/offices**; **zero speculative property developments**. Five public-facing/operational offices do **not** imply five verified walk-in points: four records have `Public Service Point` role, and each new record remains `Service Availability: Unknown`, `Public Access: Unknown`, and `Operational Status: Unknown` in Notion. No visitor hours, Google directions, verified gate or entrance were inferred. All 245 IDs/slugs were cross-checked against the previous 238; repeated organizations and projects were excluded. The two approved records remain untouched.

## Financial District — first-party commercial registry addresses

| ID | Entity | Documented address | What is actually proven |
|---|---|---|---|
| **NC-239** | Proman Real Estate / برومان العقارية | **Unit A2-23, Audaz Mall** | Historical branch-registration action on **1 June 2025**, [ITDA commercial bulletin](https://www.itda.gov.eg/CRM/887/CRA107.pdf), item 18. Cannot infer 2026 occupancy, customer reception, or entrance. **Audaz unit A2-23 is not Banque Misr's separate bank-zone land plot A2-23**. |
| **NC-240** | MKM Misr for Touristic and Real Estate Investments | **B4-01 and B4-23**, Ozar building, banks-zone plot **B3-11** | Historical registered-address amendment **11 February 2025**, [ITDA commercial bulletin](https://itda.gov.eg/CRM/883/CRA53.pdf), item 661. The adjacent item 660 relates to an **unrelated Luxor branch action of the same company**. Neither action proves operating-hours or physical access in the capital today. |

**Rights/provenance:** The ITDA official bulletins expressly restrict reproduction. The register stores minimal factual name, date, company identity and address with a source link; it does not republish bulletin prose or reproduce pages. The publication status is *not* elevated by a legal registration event.

## Government District — named units and real services

| ID | Unit | Location | Source and qualification |
|---|---|---|---|
| **NC-241** | Qualified Industrial Zones Unit (**QIZ / الكويز**) | **Ministry of Industry building**, floor unspecified | [Government-identified appointment portal](https://qizunit.setmore.com/) explicitly names that address and offers quarter-review appointments, with `review@qizegypt.gov.eg`. [Egypt State Information Service](https://sis.gov.eg/en/international-relations/intl-and-regional-organizations/qualified-industrial-zones-qiz/) confirms the executive body's remit. Service known; visitor admission still confirmable only with booking. |
| **NC-242** | Industrial Modernization Centre (**IMC / مركز تحديث الصناعة**) | **First floor, Ministry of Industry** | [IMC's own tender notice dated 15 October 2026](https://www.imc-egypt.org/ar/public-tenders/item/1569-49-2026-b-813-cl-eg-1004.html) explicitly states it as one location where offers were accepted until **1 November 2026**. Distinct from the Ministry and from QIZ; the deadline has passed, so **do not advertise the tender as open**. |
| **NC-243** | Land Transport Regulatory Authority (**LTRA**) | **Second floor, Ministry of Transport** | [Egypt Trade Facilitation Portal, updated May 2026](https://egypt.tradeportal.org/procedure/194/step/827) identifies the actual freight licensing/transit-permits agency, precise floor, and contact **02 2054 2140**. The portal presents a malformed generic agency email; it has **not** been imported. |
| **NC-244** | Industrial Investors Service & Support Unit | **Ministry of Industry building**, floor unspecified | [Cairo Governorate government notice](https://www.cairo.gov.eg/ar/news/2024/5bce1f8fbda942a38f1a572c991d1dcf) invites investors with urgent problems to that unit in the Government District; [2025 industry-government reporting](https://www.nile.eg/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D8%A9-%D8%AA%D8%B9%D9%84%D9%86-%D8%B9%D9%86-%D9%85%D8%B3%D8%AA%D8%AC%D8%AF%D8%A7%D8%AA-%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%AF%D8%B9) identifies its digital complaint channel. Neither source proves current reception room/hours. |
| **NC-245** | Urban Development Fund **Customer Service Center** | **Ground floor**, Council-of-Ministers subsidiary agencies building **L1M–Zone 11** | [July 2026 report on the fund's move](https://citymoney24.com/news/11891) states start of customer reception **5 August 2026**. **Research** pending the fund's own current-address confirmation. Distinct from administrative HQ **NC-157**, reported on another floor. Prior May 2026 information still listed Nasr City service, so this is a genuine historical-location transition, not licence to assume walk-in today. |

## Notion-to-site and duplicate handling

- Notion database reconciliation completed **before** appending to the repository's `data/exploration.json`: 245 rows, 245 distinct `Entity Code` values, 158 Source Confirmed, 85 Research and 2 Published.
- Each new entry has an individual Notion row and evidence scope. The local source manifest is [`D28-source-register.json`](D28-source-register.json). The exploratory JSON only carries public-safe factual fields and the primary URL.
- Previously known **Banque Misr NC-46, National Bank of Egypt NC-45/NC-49, Grand Square firm Alam NC-189, Qalam NC-137, Egyptian Drug Authority NC-203, and IMC host Ministry of Industry NC-31** were checked for duplicates; no second record was created for the same physical office. The company entry `NC-239` and the bank branch `NC-46` have *different* entities despite both having string `A2-23` in **different address systems**.
- The `EBank` entry **NC-60** has a newer [16 August 2026 opening report](https://ahram.org.eg/daily/NewsPrint/1026451.aspx) while its current research label still describes an unknown opening status. This is a **D29 enrichment/update candidate** requiring a precise branch parcel and alignment in Notion before downstream amendment, not a new bank record.
- `Source Confirmed` refers only to the address, existence, affiliation or historical registry fact that the source can actually establish. No uncontrolled geocoding or external navigation link is generated.

## D29 priority verification queue

1. **Visitor-first calls/official confirmations:** QIZ (booking requirements, department floor, visitor gate); LTRA (appointments, licensing service window and entrance); IMC (current first-floor front desk); Industrial Investor Support Unit (public counter and digital vs onsite handling). Never auto-call or imply confirmed hours.
2. **UDF discrepancy:** obtain a direct official statement confirming the ground-floor **L1M–Zone 11** customer center is currently receiving visitors; reconcile separately from HQ third-floor record NC-157.
3. **Financial company tenants:** check Proman Audaz `A2-23` and MKM Ozar `B4-01/B4-23` with direct company sources or permission-based outreach; legal domicile alone cannot enable turn-by-turn Maps routing.
4. **EBank NC-60:** reconcile August 2026 bank branch opening against official branch locator, physical plot, and original Notion row rather than adding a duplicate.
5. **Dataset quality:** preserve distinct layers `legal_registered_address`, `claimed_office`, `current_operational_status`, `public_service_window`, `building`, `unit`, `entrance`, `direction_pin`, and `last_confirmed`, with human approval for high-risk navigation fields.

**Go-live boundary:** The exploratory directory can show unapproved records with clear uncertainty labels under the founder's D15 decision; the publication-approved `data/places.json` remains exactly two records. D28 makes no change to `Published`, site indexability, or Maps routing.
