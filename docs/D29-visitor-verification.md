# D29 — Visitor service verification: appointments, hours, and entry precision

Checked: **8 November 2026**. Scope: **Government District** and **financial/banks quarter** of Egypt's New Administrative Capital. [Notion Places & Organizations](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167) is the editorial source of truth. D29 enriches **four existing records**, and adds **zero** speculative or duplicate entities: **245 tracked, 158 Source Confirmed, 85 Research, 2 Published**. No new editorial publication approval or Google Maps route.

## Four source-backed updates

| ID | Verified from authoritative sources | Conservative visitor-facing decision |
| --- | --- | --- |
| **NC-241 QIZ Unit** | The [QIZ certificate-renewal instructions](https://www.qizegypt.gov.eg/Content/Site/Library/14451206104053198Certificates-Renewal%28qizegypt.gov.eg%29.pdf) identify **Ministry of Trade & Industry Visitors Gate, fifth floor, office 5140**. Renewed-certificate collection requires sending documents to **info@qizegypt.gov.eg**, waiting for validation, then **booking an appointment**. The separate [QIZ booking portal](https://qizunit.setmore.com/) covers quarterly reviews. | `Floor Confirmed`, `Public Access: By Appointment`, `Service Availability: On-site Confirmed` **for certificate-renewal collection only**. No numeric visitor hours, gate coordinates, or turn-by-turn directions. Other services need separate checks. |
| **NC-243 LTRA freight licensing** | [Egypt Trade Facilitation Portal](https://egypt.tradeportal.org/Contacts/18?l=ar), and its [procedure revised May 2026](https://egypt.tradeportal.org/procedure/194/step/827), identify the **Central Administration for Road Freight Services**, **second floor** of Ministry of Transport, phone **02 2054 2140**, and **Sunday–Thursday 09:00–14:30 working hours** for that unit. | The hours are labelled **unit office hours** only, not `visitor_hours`. Public entry and appointment conditions stay Unknown. The portal's malformed generic `.gov.gov` email was not imported. |
| **NC-52 Land and Dry Ports Authority** | [Official Egyptian Trade Portal](https://egypt.tradeportal.org/Contacts/20?l=ar) confirms the **third-floor Ministry of Transport HQ** and phone **02 2054 1840**. It separately lists 09:00–16:00 for its *Digital Transformation Unit* and 24-hour operation for *Sallum border land port*. | Added **HQ phone**; did **not** misattribute either subordinate-unit or border-port hours to the HQ public reception. No duplicate record. |
| **NC-112 Ministry of Finance Citizens Service** | [Official ministry service page](https://mof.gov.eg/ar/services/service-21) confirms **tower LC, sixth floor**; ministry-wide hours **Sunday–Thursday 08:00–15:00** and **16408** help line listed as available **24/7**. | The office-hours label explicitly says **ministry-wide only**. Service-counter visitor hours and entrance remain Unknown. Hotline availability does not prove office opening. |

## Reconciled findings without status inflation

- **NC-15 — MFA mobile attestation:** [official March 2026 statement](https://www.mfa.gov.eg/ar/Ministers/Details/MinisterActivities/4496) documents reception **opposite MFA Building C** during *official working times*, without numeric hours. Keep existing `On-site Confirmed`; do not invent times. A prior office index did not show a separate entry for this mobile branch.
- **NC-108 — NI-1 notary:** [official Justice Ministry order 1987/2024 in the government gazette](https://www.alamiria.com/Sec/TashTxt?id=bHPN1VKLrgg%3D) places the legally established branch at **shop 4A, NI-1 Mall**. Secondary reporting varies on the shop-number transcription; keep the primary order, but no claim about current daily reception hours.
- **NC-245 — Urban Development Fund customer center:** [31 July 2026 reported announcement](https://algomhor.com/455617) and [independent coverage](https://citymoney24.com/news/11891) agree on the **ground-floor L1M Zone 11** move from **5 August 2026**. Earlier [May 2026 sourced remarks](https://www.mobtada.com/economy/1610743/) still listed Nasr City customer service and a New Capital HQ. This is chronologically consistent with a move, but direct **current fund-owned** reception confirmation was not found. Keep `Research`, distinct from HQ `NC-157` on another floor.
- **NC-60 — EBank:** [bank-branded corporate announcement](https://ae.linkedin.com/posts/ebank.egypt_عالمجديدأحناأوله-activity-7492911955880628224-X9ZD) reports opening a New Capital branch on **11 August 2026**. [Official branch locator](https://ebank.com.eg/ar/branches-atm-locator/) did not expose a branch-specific address in the retrieved page. Keep `District Only` / `Research` and no guessed financial-quarter parcel.
- **NC-239/240 — company tenants:** government commercial registration establishes **historical registered units**, not present occupancy, public access or map pins. Still require direct company verification.

## Rules and limits

1. A registered address is **not** proof of current occupancy; a documented office or floor is **not** a precise outdoor navigation point.
2. A named **Visitors Gate** is legitimate preparation advice, but has **no verified coordinates** here. `verified_entrance=false`, `directions_url=''` remains across all unapproved records.
3. Agency-wide hours, individual department working hours, appointments, and the public service counter's reception hours must remain **separate facts**.
4. QIZ appointment evidence covers **renewed certificate collection**, not every QIZ activity.
5. No telephone call, physical visit or direct organization confirmation was made during D29; only verified web-source evidence is claimed.

## D30 direct-confirmation queue

| Priority | Target | Exact missing fact / recommended next check |
| --- | --- | --- |
| P0 | **QIZ NC-241** | Ask `info@qizegypt.gov.eg` whether the documented Visitors Gate is used for all certificate-collection appointments; obtain an **actual arrival GPS pin** before enabling directions. |
| P0 | **LTRA NC-243** | Call **02 2054 2140**: does the freight counter receive visitors now, are appointments required, and which entrance? Log answer, date and contact identity. |
| P0 | **UDF NC-245** | Obtain a directly owned **current** fund statement verifying the L1M ground-floor service-counter location and hours after the August move. |
| P1 | **EBank NC-60** | Confirm exact bank branch address, parcel, reception and entrance from an official branch locator or bank contact. |
| P1 | **Land/Dry Ports NC-52** | Call **02 2054 1840** about the HQ visitor gate and public reception; do not use Sallum border-port schedule. |
| P1 | **Proman/MKM NC-239/240** | Verify current tenants at Audaz/Ozar directly, with consent-based outreach or business-owned evidence. |

**Go-live:** maintain **two Published records**. Other entries remain clearly exploratory; no new turn-by-turn Google Maps route is available pending exact verified arrival destinations.
