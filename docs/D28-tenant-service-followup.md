# D28 follow-up — Deep Tenant & Service Discovery (post-D37)

Checked: **8 November 2026**. This is a **new follow-up to the historical D28 milestone**, not a replay or a reversal from the D37 baseline. Editorial source of truth: [Capital Guide Notion register](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167). Scope: Government District and Financial/Banks District of the New Administrative Capital only. No direct calls, in-person visits, or confirmed pedestrian entrances.

## Reconciliation

| Metric | D37 | D28 follow-up | Change |
|---|---:|---:|---:|
| Historical source records | 265 | **267** | +2 |
| Distinct visitor-directory entries | 264 | **265** | +1 net: +2 historic offices, −1 scope quarantine |
| Source Confirmed | 210 | **211** | +2 official historical registrations, −1 disputed office |
| Research | 53 | **54** | +1 scope dispute |
| Founder-approved Published | 2 | **2** | No change |
| New live visitor-service points confirmed | — | **0** | No operational claims inferred |
| New verified entrances/Google Maps directions | — | **0** | No unverified routing |

## New tenant evidence — official historical registrations

| Code | Company / unit | First-party evidence | Evidence boundary |
|---|---|---|---|
| **NC-266** | **طيبة العايدي لتصنيع الألومنيوم والمعادن**; unit **A-411**, fourth floor, **Cairo Business Plaza**, banks zone, Financial District | [Internal Trade Development Authority commercial gazette, Oct 2024](https://itda.gov.eg/CRM/879/CRA109.pdf), item 26: amended registered office **16 Oct 2024** | Historical legal registration only. No 2026 staff/occupancy/visitor eligibility, public hours, or pin. [Notion record](https://app.notion.com/p/412a7a233ee181509b5ef2848c24bdac) |
| **NC-267** | **سانتوريني للتنمية الزراعية**; office **608**, sixth floor, **SIAC building**, Financial District | [Internal Trade Development Authority commercial gazette, Dec 2024](https://itda.gov.eg/CRM/881/CRA53.pdf), company item **494**, registered **4 Dec 2024**. The office address belongs to *item 494*, **not** neighboring pharmacy item 495 | Historical legal address only, no proven present occupancy, counter, entrance, opening times, or pin. [Notion record](https://app.notion.com/p/412a7a233ee181cfb8dee86083e46e0f) |

Official registry bulletins contain publication/reproduction restrictions. We retained only short factual identity, unit, floor, date and attribution metadata with source URLs, **not copied bulletin material**. `Source Confirmed` labels the *historical recorded address*, not the current tenant's physical operation.

## Material geographic conflict — quarantined NC-263

**Harris Estates Egypt / Pioneer Plaza Branch** (`NC-263`) had been classified Financial District because the [company's own website](https://harris-estates.co.uk/) describes its Pioneer Plaza branch there. However, **Pioneer Plaza Business Complex** is independently identified as **MU23 A10**, with a [first-party commercial tenant listing, Brand Lift office 148](https://www.brandliftco.com/contact) giving that exact zone, and a [Regus venue listing](https://www.officespace.com/en/eg/office-rental/new-administrative-capital/14017-pioneer-plaza-business-complex) also identifying MU23 A10. The firm's district label therefore conflicts with the venue address. **MU23 cannot be silently treated as the scoped Financial District.**

Action: update Notion and the site snapshot for NC-263 to `Zone=Other`, `Verification=Research`, surface the MU23 address conflict in the description, and suppress it from the **visitor directory/search** via an explicit `SCOPE_QUARANTINE_PLACE_IDS` rule; preserve the record and legacy detail URL for audit. [Updated Notion record](https://app.notion.com/p/412a7a233ee181788f56c9889befb216).

We also inspected candidate businesses in **Pioneer Plaza** (Brand Lift and other Regus/Pioneer Plaza address holders). None is inserted under Financial District while MU23 placement remains outside the launch footprint. A virtual-office membership or developer marketing claim does not evidence a staffed tenant.

## Service-discovery de-duplication

- [National Bank of Egypt's official business-development centre list](https://www.nbe.com.eg/AssetsManager/18f114c6-262e-41f0-97de-ae4221075c3b.pdf) references A1-26 in the Financial/Banks district; **already `NC-45`**, next to existing NBE branch `NC-49`, not a new location.
- [QNB official Ministry of Industry ATM listing](https://www.qnb.com.eg/sites/qnb/qnbegypt/document/ar/arQNBATMS) references machine 1177; **already `NC-184`**, not a new ATM.
- [CAPW's own contact information](https://capw.gov.eg/about-capw/) confirms second/third floors of the Ministry of Housing; **already `NC-50`**, not a new authority office.
- [IMC's own October 2026 tender](https://www.imc-egypt.org/ar/public-tenders/item/1566-46-2026-m-1586-cl-eg-1010.html) confirms the first-floor Ministry of Industry location; **already `NC-242`** and expired submission deadline; no implied walk-in tender acceptance now.

## Release guardrails and next verification

1. Notion was updated **before** the repository snapshot: NC-266 and NC-267 appended; NC-263 quarantined, no changes to the two founder-approved publication records.
2. The exploratory directory may display historical offices, but its cards must clearly indicate unknown availability; neither record has a map deep link or verified entrance.
3. Next direct building/tenant confirmation queue (after the founder lifts the outreach hold): Cairo Business Plaza A-411, SIAC office 608, and Pioneer Plaza operator MU23 A10 versus Harris' claimed Financial District. Confirm unit occupancy, entrance and actual public service separately.
4. Do not create a fresh record for an existing ministerial sub-office, ATM, or NBE development centre merely because another official source repeats it.

**Outcome:** +2 auditable legal-location records, −1 misleading in-scope visitor candidate, 0 invented active tenants, 0 invented public services, 0 unverified routes. Historic `docs/D28-deep-discovery.md` remains unchanged.
