# D31 — Source-led expansion, all outreach deferred

Checked **8 November 2026**. Editorial truth: [Notion Places & Organizations](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167). Scope: **Government District** and **Financial/Banks District** only. The D31 source register is [`D31-source-register.json`](D31-source-register.json).

**Result:** **245 → 249** exploratory records (**+4**); **158 → 162 Source Confirmed**, **85 Research**, **2 Published**. No email, call, complaint submission, location pin, route or visitor-access confirmation was made. The [D30 outbound queue](../data/direct-verification.json) stays **Not Contacted**.

## New source-confirmed identities and *limited* evidence

| Code | Record | Primary evidence | What this does NOT prove |
| --- | --- | --- | --- |
| NC-246 | **Quantec Contracting**, N1 Mall, Government District, units D15/D16 | [ITDA official commercial-register publication](https://www.itda.gov.eg/CRM/883/CRA53.pdf), company address-change item 1168, 18 Feb 2025 | 2026 occupancy, site opening, customer walk-in. |
| NC-247 | **MMZ Real Estate Development**, Financial/Banks District, second-floor unit **A2-18** | [ITDA bulletin](https://www.itda.gov.eg/CRM/889/CRA53.pdf), entity item 260 and its address immediately after, dated 6 Aug 2025 | Current office or public opening; A2-18 is a **unit**, not a verified plot. A tempting nearby CS-26 address belongs to the preceding company, not the next item. |
| NC-248 | **A.U.F Egypt**, Sixty Mall 1, ground-floor unit **GR-03**, plot **A2-12**, Financial District | [ITDA bulletin](https://www.itda.gov.eg/CRM/881/CRA53.pdf), company branch-opening item 933, 12 Dec 2024 | Continued operation or customer access in Nov 2026. |
| NC-249 | **Environmental Affairs Agency investor service center**, Government District | [Agency-owned contact page](https://eeaa.gov.eg/ContactUs/Index), expressly listing an investor service center at its New Capital ministry and **02 2053 2545 / 2546** | Floor, public reception schedule or independent entrance; functionally distinct from administrative HQ NC-110. |

The ITDA bulletin prohibits copying/republication. Only minimally restated entity identity/address/date facts are retained, not bulletin prose or a reproduced commercial dataset.

## Existing-record contact corrections

- **NC-52, General Authority for Land and Dry Ports:** [agency-controlled page](https://ldp.gov.eg/اتصل-بنا/) gives Government District, Ministry of Transport, **third floor**, official email `info@ldp.gov.eg`, website and phone **02 2054 1838**. We used this number in place of the older **02 2054 1840** reference, flagging the discrepancy for later contact verification.
- **NC-61, Egyptian Customs Authority:** [agency-owned website](https://customs.gov.eg/) confirms `info@customs.gov.eg` and hotline **15460**. The existing Capital building-specific **02 2053 1040** remains separate. Its other [contact page](https://customs.gov.eg/home/Contact) shows a different *Cairo* address and published hours; those hours are **not** copied to New Capital.
- **NC-36 QNB branch:** [QNB Arabic announcement](https://qnb.com.eg/sites/qnb/qnbegypt/ar/arcapital.html) calls the second branch “حي المال والأعمال”, while [QNB English announcement](https://qnb.com/sites/qnb/qnbegypt/en/encapital.html) calls it “Central Business District”. Without a confirmed parcel, the record retains `District Only` and **no route**; this address vocabulary conflict remains a verification item.
- **NC-35 and NC-202:** both describe the same **Nasser Social Bank mobile unit** in front of Social Solidarity. This is a pre-existing likely duplicate. No deletion or merge was done as part of source expansion; queue a controlled Notion-first deduplication for a separate QA batch.

## Data quality gates and next expansion

1. `Source Confirmed` means only that the **stated limited claim** is supported by its linked authoritative source. A dated business register is not 2026 proof of occupancy.
2. `Public Access`, `Service Availability` and public hours remain unknown for all four new records. `verified_entrance=false` and `directions_url=""` for each.
3. The primary exploratory directory contains all 249 entries and remains explicitly labeled, `noindex`, while only 2 user-approved records exist in `data/places.json`.
4. Next research: bank-owned branch/ATM locators for address-level evidence, more Government District public service counters, and reconciliation of duplicate entities. **Batch all outreach after the source sweep is complete**.
