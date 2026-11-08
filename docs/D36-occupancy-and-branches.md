# D36 — Deep Occupancy & Branch Verification

Checked: **8 November 2026**. Scope: **Government District** and **Financial & Business District**, New Administrative Capital. Notion Capital Guide Places database is the reconciled source of truth, reflected by `data/exploration.json`. **No outreach or direct visitor confirmations** in this batch.

## Outcome

| State | D35 baseline | D36 delta | D36 total |
|---|---:|---:|---:|
| All exploratory place records | 261 | +4 | **265** |
| Source Confirmed | 208 | +2 | **210** |
| Research | 51 | +2 | **53** |
| Editorially Published | 2 | 0 | **2** |

No new records were added for already indexed companies. User-visible public exploratory records retain their status labels; editorially approved data and maps were not expanded.

## New distinct firm-address candidates

| Record | Premises and role | Documentary evidence | Exact evidence ceiling |
|---|---|---|---|
| **NC-262 Mazar Real Estate Asset Management** | Audaz Mall, Financial District, company office | [Own company LinkedIn location](https://eg.linkedin.com/company/mazar-real-estate-asset-management); [Audaz developer brochure](https://gatesdevelopments.com/wp-content/uploads/2024/06/AUDAZ-Brochure.pdf) | **Source Confirmed** for company-published address, not independently observed open office. Unit, reception and hours unknown. |
| **NC-263 Harris Estates Egypt** | Pioneer Plaza Business Complex, Financial District, Egypt branch | [Company official website, Egypt branch section](https://harris-estates.co.uk/) | **Source Confirmed** for self-declared branch building, not entrance/staffed reception. Distinct from UK registered HQ. |
| **NC-264 Saad El Din Law & Arbitration** | Audaz Mall; `A2-30` is an unconfirmed directory unit marker | [31 Mar 2026 secondary report](https://misrconnect.com/news/egypt-news/saad-el-din-law-firm-and-arbitration-in-the-new-administrative-capital-comprehensive-legal-services-for-businesses), corroborating business-directory listings | **Research**; no first-party office or visitor-hour validation. Directory's 9–18 hours deliberately not published. |
| **NC-265 Apex CPA** | Sixty Business Park; directory office `L7` | [Dalil 140 listing](https://dalil140.com/company/ar/380-apex-cpa) and [140online](https://140online.com/company/En/NW25185/Apex%20Cpa) | **Research**; two directories agree on building, **disagree on phone number**. Public phone intentionally blank. |

Two distinct offices in the same mall are not duplicates if they represent different occupants. Only first-party **claims about addresses** were source-confirmed, not physical site inspection.

## Branch reality audit

**NC-49 National Bank of Egypt** — [NBE's 2022 official branch-inauguration statement](https://www.nbe.com.eg/AssetsManager/0691a4c8-df3e-444d-b79d-c9c60732be7c.pdf) explicitly documents a functioning banking branch, so the existing A1-26 Financial District record's `service_availability` is now **On-site Confirmed**. The first-party [bank/ITDA registry document](https://www.itda.gov.eg/CRM/850/CRA1.pdf) gives the precise A1-26 plot. An opening ceremony years ago **does not prove current visiting hours or entrance**. The press release's broad “government district” wording is not used to invent a second location.

**NC-36 QNB Egypt second public branch** — Its [official Arabic 2026 announcement](https://qnb.com.eg/sites/qnb/qnbegypt/ar/arcapital.html) describes the Financial District; [official English edition](https://qnb.com.eg/sites/qnb/qnbegypt/en/encapital.html) says Central Business District. Exact branch plot and the source-language boundary conflict **remain unresolved**. Its separately sourced [first QNB branch at Al Masa Capital Plaza](https://www.qnb.com.eg/sites/qnb/qnbegypt/document/ar/aratmspecialneed) is **not** assumed to lie in either scoped district and was not appended.

**NC-35 and NC-202 Nasser Social Bank** — [The bank's own statement](https://nsb.gov.eg/ar/المركز-الإعلامي/الأخبار/) describes a *single* fixed mobile banking point opposite the Ministry of Social Solidarity, with an employee and ATM. These existing records appear to represent **the same service point**. They have been flagged for a canonical data merge, not silently deleted or relabeled as two branches.

**Afreximbank** — [Bank's own annual report](https://media.afreximbank.com/afrexim/Afreximbank-Annual-Report-2024-en-1.pdf) documents land ownership and planned New Capital HQ construction, **not an opened retail banking branch**. No invented live location.

## False positives deliberately rejected

- **CodeCruze B7-04** at Audaz is already **NC-74**; its [own contact page](https://codecruze.com/contact-us/) corroborates the address.
- **HOECHST-Eg B2-18** at Audaz is already **NC-75**; its [own company profile](https://www.linkedin.com/company/hoechst-pharmaceutical-industry) corroborates the address.
- **Market Zone** at Audaz is already **NC-79**; [its website](https://marketzone-eg.com/) corroborates building-level address.
- **Elkobtan** at Three Square 25-B3 is already **NC-224**; [its contact page](https://elkobtan-ip.com/contact/) corroborates the building.
- **HQ/Regus** Sixty Walk and Financial Hub are already **NC-65** and **NC-66**; generic venue marketing and under-construction claims must not manufacture operating branches or duplicate occupants.
- Audaz is within the Finance/Government transition area; generic broker articles vary between the districts. [Gates' original brochure](https://gatesdevelopments.com/wp-content/uploads/2024/06/AUDAZ-Brochure.pdf) expressly says Financial District, which supersedes inconsistent reseller text for zone classification, **not** for doorway coordinates.

## Safe visitor-data boundaries

No records in D36 gain `verified_entrance`, `directions_url`, `visitor_hours`, `Walk-in Confirmed` or editorial publication status. A named building, business website, Google search snippet or projected construction delivery date is **not** proof of a publicly accessible working office. Calls and correspondence remain deferred by founder decision until the source-discovery sweep ends.

### Follow-up queue

1. Obtain corporate confirmation of **Mazar and Harris** actual office staffing and entry process; site claims alone are not direct occupancy verification.
2. Check **Saad El Din A2-30** and **Apex L7** with first-party company material, and reconcile Apex's conflicting phones before displaying a dialing action.
3. Resolve **QNB NC-36** exact plot with the bank's current branch directory, and **Nasser NC-35/202** duplicate with a recoverable canonicalization plan.
4. Continue first-party **bank branch, ATM and ministry public counter** research before enabling open-in-maps routing.

The [D36 source register](D36-source-register.json) carries exact candidate evidence, exclusions, statuses and publication constraints.
