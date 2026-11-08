# D37 — Actual Occupancy Verification

Checked: **8 November 2026**. Geographic scope remains **Government District** and **Financial & Business District** in Egypt's New Administrative Capital. Notion's **Capital Guide — Places & Organizations** is the source of truth; the GitHub data snapshot follows it. No phone/email outreach or physical visits took place.

## Decision and outcome

| Measure | D36 | D37 |
|---|---:|---:|
| Historical source records | 265 | **265** |
| Distinct visitor-facing locations | 265 | **264** |
| Source Confirmed records | 210 | **210** |
| Research records | 53 | **53** |
| Founder-approved published records | 2 | **2** |
| Documented on-site service upgrades | — | **2** (NC-55, NC-202) |
| Duplicate physical locations suppressed from visitor list | 0 | **1** (NC-35 → NC-202) |

**Important:** *On-site Confirmed* means a first-party institutional source has described a concrete banking service at the premises. It does **not** mean a D37 site inspection, proof that it is operating today, public walk-in permission, or a verified navigation pin.

## Case A — Nasser Social Bank, one fixed mobile service point

- **Canonical:** `NC-202` (`nasser-social-bank-mobile-unit-social-solidarity`), Government District, outside the Ministry of Social Solidarity.
- **Legacy duplicate:** `NC-35` (`nc-35-explore`). It is retained in Notion and `data/exploration.json` as an auditable research record, and excluded from visitor-facing list/search totals by an explicit, tested canonical mapping. An old deep link resolves to NC-202.
- [Nasser Social Bank's own report, 1 September 2026](https://nsb.gov.eg/ar/المركز-الإعلامي/الأخبار/مصروفات-دراسية/) specifically describes a unit that remains stationed at that address and includes a bank employee, ATM, enquiries and school-expense financing requests. This supports `On-site Confirmed` for NC-202 as a dated service claim, **not** a current live-status assertion.
- The fixed mobile unit is **not reclassified as a permanent branch building**. Opening hours, accessible route, actual position on a particular day and security restrictions remain unknown.

## Case B — Banque Misr parliamentary branch

- **Existing `NC-55`:** Banque Misr, House of Representatives, Government District.
- [Banque Misr's own list of accessibility-equipped branches](https://www.banquemisr.com/ar-EG/SMEs/Retail-Banking/Accounts-And-Deposits/Savings-Accounts/Details/The-branches-equipped-to-receive-distinguished-capabilities) names the branch *inside the House of Representatives* in the New Capital. This supports `On-site Confirmed` for a banking service at the institutional address.
- Parliament is a controlled building; the bank listing is **not evidence of open public entry**. `public_access=Unknown`, `visitor_hours=''`, no verified entrance and no directions URL remain mandatory.
- Distinct from `NC-46` Banque Misr Financial District branch (A2-23); no duplicate bank-location merge.

## Case C — QNB second New Capital branch: location conflict persists

- **Existing `NC-36`:** two QNB first-party opening announcements, both dated 26 April 2026, support a second branch around 1,100 m². [Arabic](https://qnb.com.eg/sites/qnb/qnbegypt/ar/arcapital.html) calls the location Financial District; [English](https://www.qnb.com.eg/sites/qnb/qnbegypt/en/encapital.html) calls it Central Business District.
- The separate [El-Masa Capital Plaza QNB branch listing](https://www.qnb.com.eg/sites/qnb/qnbegypt/document/ar/aratmspecialneed) names GB04 at El-Masa and is **not sufficient evidence for the second branch's plot**.
- D37 has **not** invented a plot number, assigned a Google Maps destination, created another bank record, or settled the language conflict without stronger evidence. The ambiguity has been flagged in Notion.

## Business-occupancy recheck — no upgrades without evidence

- `NC-262` **Mazar**: [company-maintained LinkedIn](https://eg.linkedin.com/company/mazar-real-estate-asset-management) lists Audaz Mall, Financial District. Only a company-published location; no staffed office or visitor hours established.
- `NC-263` **Harris Estates Egypt**: [the firm website](https://harris-estates.co.uk/) lists its Pioneer Plaza Financial District branch; a [third-party Property Finder profile](https://www.propertyfinder.eg/en/broker/harris-estates-6316) supplies a generic, different-format New Capital address. This does not resolve the exact unit or prove reception access.
- `NC-264` **Saad El Din Law**: an Audaz `A2-30` unit claim remains third-party **Research**; no verified first-party tenancy or permission to visit.
- `NC-265` **Apex CPA**: competing third-party phone numbers remain unresolved; **no dialing link** is published.
- Promotional occupancy figures, project delivery claims, construction photography and virtual office listings are not treated as proof of individually staffed premises.

## Operational safeguards

1. `scripts/catalog.mjs` now exposes deterministic **canonicalizePlaces** and **resolveCanonicalPlace**. Duplicates are removed from visitor counts without erasing historical audit evidence.
2. The existing Notion records for NC-35, NC-202, NC-55 and NC-36 carry the D37 reasons and evidence boundaries. Source snapshot changes are restricted to NC-55 and NC-202 service availability and NC-55 service description/date.
3. No changes to approved `data/published.json`; no new route pins, public hours, contact claims or broad status upgrades.
4. `node --test scripts/*.test.mjs` has a D37 regression proving 265 registry / 264 visitor sites, canonical legacy links, no navigation from unverified addresses, unchanged publication gate.

## Remaining verification queue

1. Confirm *present-day* Nasser mobile unit placement, operating times, public access and applicable products via official subsequent bank material; direct outreach only after founder lifts existing hold.
2. Confirm parliamentary branch eligibility for visitors and building security process (do not tell users to walk into the House of Representatives).
3. Source a current QNB official branch locator **with exact second-branch plot** and settle Financial District versus CBD before offering route instructions.
4. Obtain first-party/management evidence for Harris, Mazar, Saad El Din and Apex individual unit occupancy; disambiguate Apex contacts.

No claim of field verification or full visitor readiness is made by this phase.
