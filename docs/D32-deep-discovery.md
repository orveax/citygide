# D32 — Deep primary-source discovery, district reconciliation, and no-outreach hold

**Review date:** 2026-11-08 · **Scope:** Government District and Financial/Banks District, New Administrative Capital, Egypt.

## Result

- Eight **new, source-confirmed exploratory** records (`NC-250`–`NC-257`): five company legal/registered offices, two authority/service records, one announced office complex. Source confirmation applies only to the stated facts.
- Five existing ministerial entries promoted from **Research** to **Source Confirmed** (`NC-22`, `NC-27`, `NC-28`, `NC-29`, `NC-31`) after finding their own or governmental primary-source address evidence; **all remain unverified for visitors**.
- Inventory moves from **249 to 257** records, with **175 Source Confirmed, 80 Research and 2 Published**. Published-only `data/places.json` stays at two entries, unchanged.
- **Zero outreach**: no calls, emails or messages. No new visitor entrances, pins, directions or walk-in permissions have been asserted.

## New source-backed records

| ID | Entity / factual finding | Primary evidence | Caveat |
| --- | --- | --- | --- |
| NC-250 | Smart Plan Contracting, registered unit 14, Sola Mall, Banks District, July 2025 | [ITDA gazette, entry 686](https://www.itda.gov.eg/CRM/888/CRA53.pdf) | Historic registered address; not a verified operating office |
| NC-251 | Trend Store, registered third-floor unit 14, **Salasel** Mall, Banks District, July 2025 | [ITDA gazette, entry 1036](https://www.itda.gov.eg/CRM/888/CRA53.pdf) | Distinct building name from **Sola**; don't merge based on unit 14 alone |
| NC-252 | Kadous Engineering Solutions, plot B1-26, third-floor office RO-C1-3-48, April 2025 | [ITDA gazette, entry 469](https://www.itda.gov.eg/CRM/885/CRA53.pdf) | Office does not imply walk-in availability |
| NC-253 | Mohamed Rashid Contracting & Supplies, Citadel Mall, Government District, Oct 2024 | [ITDA gazette, entry 972](https://itda.gov.eg/CRM/879/CRA53.pdf) | Office number and present tenancy unknown |
| NC-254 | State holding company for Roads, Bridges & Land Transport, first floor, Ministry of Transport, Oct 2023 | [ITDA commercial register, entry 89](https://www.itda.gov.eg/CRM/867/CRA1.pdf) | Old legal administrative address, no public counter proven |
| NC-255 | MDK Business Complex, three interconnected blocks A/B/C in Financial District; developer forecasts full operations in 2027 | [Developer primary project page](https://madkourdevelopments.com/ar/projects/مجمع-أعمال-mdk/) | Project listing only, not operating premises; exact plot unknown |
| NC-256 | House of Representatives notary branch at parliamentary service complex, established by Justice Minister decision **4703/2025** | [Al-Waqa'i al-Misriya issue 193, 31 Aug 2025](https://www.vetogate.com/Upload/libfiles/557/8/28.pdf) | Establishment does not establish actual opening, hours, visitor eligibility or entry |
| NC-257 | Egyptian Export Development Authority administrative contact at Ministry of Investment & Foreign Trade, Government District | [Official Egyptian Export Portal contact](https://www.expoegypt.gov.eg/contactus) | Email confirmed; reception and floor remain unknown |

## Research records upgraded from official evidence

| ID | Institution | Evidence supports | Does **not** support |
| --- | --- | --- | --- |
| NC-22 | Ministry of Water Resources & Irrigation | [Ministry project contact](https://www.mwri.gov.eg/?lang=en&page_id=33170): Government District location | Visitor entrance, service hours |
| NC-27 | Ministry of Petroleum & Mineral Resources | [Ministry petroleum model legal agreement](https://eug.petroleum.gov.eg/dp/jsp/assets/docs/2025%20EGPC%20Model%20Agreement%20%28Arabic%29.pdf): legal seat Government District | Operating citizen service counter |
| NC-28 | Ministry of Education & Technical Education | [ITDA trademark transfer notice](https://www.itda.gov.eg/TMD/1000/نشر%20نقل%20ملكية.pdf): legal address of entities transferred to ministry, 2023 | Whether a specific visitor desk exists |
| NC-29 | Ministry of Investment & Foreign Trade | [Ministry contact page](https://www.mift.gov.eg/contact/index): Ministers District and info@mift.gov.eg | Public entrance; published ministry **office hours** are not visitor hours |
| NC-31 | Ministry of Industry | [Official Industrial Modernization Centre tender](https://www.imc-egypt.org/ar/public-tenders/item/1569-49-2026-b-813-cl-eg-1004.html): ministry building used to receive tender material on first floor | General ministry walk-in availability |

## Explicit exclusions / discrepancies resolved

1. One news report labels the branch under decision 4703/2025 as belonging to the **Senate**. The **actual gazette text says House of Representatives**. NC-256 uses the primary text; no unproven duplicate was created.
2. QNB's official ATM list contains many locations in the **Capital city but outside both pilot districts** (Almasa shopping/hotel, City of Arts, Jasmine, Military Academy). These were not imported. Its Government District Ministry of Industry ATM was already `NC-184`.
3. Numerous Gazette matches refer to other cities' “Banks District”, particularly **6 October, New Sohag and New Tiba**. All excluded.
4. Property listings, proposed schemes without primary developer evidence, and tenant labels without a proper office or shop are not treated as verified current service destinations.
5. **Sola Mall** and **Salasel Mall** are preserved as separate original registry spellings; no geospatial merge without building-map proof.

## Governance and follow-up gate

- A registry entry is evidence of a recorded address at a historical date. It does not confirm continued occupancy.
- A ministerial legal address proves institutional presence at district level, not an exact public entrance.
- Keep all D32 additions at `Source Confirmed`, `service_availability=Unknown`, `public_access=Unknown`, `verified_entrance=false`, no directions and no visitor hours.
- Continue the evidence-driven company and service-counter expansion. Once the full institutional inventory is assembled, prepare **one consolidated direct-verification outreach batch**; this phase did not initiate that work.
- The [D32 evidence manifest](D32-source-register.json) contains only the minimum factual identifying details and source URLs; the official commercial-register PDF is not republished.
