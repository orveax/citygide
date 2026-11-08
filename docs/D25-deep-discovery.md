# D25 — Government + Financial District Deep Discovery

Checked: **2026-11-08** · Geography: New Administrative Capital **Government District** and **Financial/Business District**.

## Reconciled catalogue

| Metric | D24 | D25 | Change |
| --- | ---: | ---: | ---: |
| Unique entries | 179 | **201** | +22 |
| Source Confirmed | 119 | **131** | +10 new; +2 previously Research upgraded |
| Research | 58 | **68** | +12 new; −2 upgraded |
| Published / founder-approved | 2 | **2** | 0 |

All 22 additions (`NC-180`–`NC-201`) were created in the authoritative [Notion places data source](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167), then imported into `data/exploration.json` through the guarded source-register importer. The public approved-only feed remains **2**. No new route, entrance, walk-in access, or visitor-hour claim was inferred.

## High-value discoveries (10 new Source Confirmed)

1. **NC-180 — Champs-Élysées Mall:** [developer's operational-opening announcement](https://pyramidsdevelopments.com/new/new.php?id=8) reports opening for visitors in November 2025; **not** proof of each tenant's occupancy or hours.
2. **NC-181 — Egypt Post Financial District:** [21 June 2026 public statement reported by Youm7](https://www.youm7.online/story/2026/6/21/جهاز-تنمية-التجارة-الداخلية-يتيح-خدمات-السجل-التجارى-عبر-البريد/7455537) confirms some commercial-register services available through the post office. Exact counter/building and hours still unknown; this is **one** physical record, not a duplicate registry office.
3. **NC-182 — General Organization for Cultural Palaces:** [the agency's own public notice](https://www.gocp.gov.eg/articles.aspx?ArticleID=210946) associates its administration with the Ministry of Culture's Government District building.
4. **NC-183 — Cultural Development Fund:** [official fund contact page](https://www.cdf.gov.eg/?q=node%2F92) specifies **fourth floor**, Ministry of Culture.
5. **NC-184 — QNB Egypt ATM:** [QNB's own ATM inventory](https://qnb.com/sites/qnb/qnbegypt/document/ar/arQNBATMS) explicitly lists ATM **1177** at the Ministry of Trade and Industry. A ministry-hosted ATM is **not** automatically publicly accessible.
6. **NC-185–186 — Government and Financial District monorail stations:** [National Authority for Tunnels](https://www.nat.gov.eg/NewsDetailsAr.aspx?id=1297) establishes these on the East Nile route. No user-ready entrance, pin, or schedule asserted.
7. **NC-187 — TiE HOUSE:** [brand-owned branch listing](https://tie-house.com/ar/pages/branchs) specifies **Shop 1, second floor, Champs-Élysées Mall**, next to Ministry of Finance.
8. **NC-188–189 — Master Piece and Alam Real Estate:** [ITDA register extract, 2022](https://www.itda.gov.eg/crm/855/CRA53.pdf) and [ITDA register extract, 2023](https://www.itda.gov.eg/CRM/868/CRA53.pdf) historically recorded these legal addresses at Grand Square. **These are historical registered addresses, not proof of current operation or walk-in visits**.

## Research leads (12; no current occupancy confirmation)

- **Grand Square:** Mandi Al Asima, Sama Al Asima, Pizza Yanni, Toscalini Café, Ashraf Farghali Juices and On Market. Most evidence comes from [an older mall review (2023)](https://www.foodtodayeg.com/Section-106/مطاعم/جراند-سكوير-مول-أول-مول-متكامل-الخدمات-في-العاصمة-الإدارية-الجديدة-33185) or [restaurant directories](https://www.al-makan.com/restaurants/مطاعم-سما-العاصمة-الادارية/).
- **N1 Mall:** Mohamed El-Sharkawy Liver Restaurant, Farghali Juices, Sandwich Plus, Kabda Wala Sogok and Koshary Hind. The latter has **conflicting location claims** and cannot be routed. Sources include [MenuEgypt](https://www.menuegypt.com/ar/كبده-ومخ-محمد-الشرقاوي/العاصمة-الادارية), [local restaurant index](https://www.egyptnewcapital.com/p/restaurants.html) and [local listing](https://almaqsadvillas.com/).
- **Champs-Élysées Mall:** Kosharista, listed by a local directory only; contact details need direct matching.

The source list, individual evidence limitations, IDs, and individual addresses appear in [D25 source register](D25-source-register.json). No speculative business was promoted to Source Confirmed.

## Existing records upgraded, not duplicated

- **NC-35 — Nasser Social Bank mobile unit:** [bank announcement](https://nsb.gov.eg/ar/) confirms a fixed mobile unit with an ATM **in front of the Social Solidarity Ministry**. Source Confirmed, but no hours or entrance pin.
- **NC-157 — Urban Development Fund:** an [official government publication](https://africa.sis.gov.eg/أفريقيا-اليوم/الأخبار/الحكومة-دعوة-لتأهيل-الشركات-المصرية-والعالمية-لمشروع-إدارة-وتشغيل-وصيانة-حدائق-تلال-الفسطاط/) confirms third-floor Cabinet-affiliated authorities building; [2026 press report](https://algomhor.com/455617) describes customer-service relocation starting August 5. Source Confirmed, public entry details unresolved.

## Rejected conflations / false precision

- Do **not** conflate the **N1 Mall** locality with a **MU1/15 Downtown** locality without branch evidence (Vodafone branch lead).
- Do **not** split one Egypt Post counter into a second physical registry-office entry.
- Do **not** confuse the two Farghali-named juice listings (Grand Square and N1) with one legally verified operator.
- Do **not** use an incorrect Zagazig address from a scraped 'Cabinet Post Office' directory entry.
- Do **not** assign Google Maps navigation from place names, historic registry filings or construction announcements.

## D26 priority — visitor verification, in order

1. **Postal branch:** identify the building/unit, verify exact available commercial registry services and opening hours directly with Egypt Post and ITDA.
2. **Two monorail stations:** verify platform entrances, actual service/timetable, accessible route and Maps pin against the operating authority.
3. **High-use service counters:** inspect the Nasser mobile unit and Urban Development Fund customer-service entrance; identify any access controls.
4. **Operational businesses:** telephone/visit 12 Research leads; close incorrect/outdated records rather than leaving stale storefronts searchable indefinitely.
5. **Publishing gate:** keep founder-approved feed at 2 until validated entrances/pins and public-contact conditions are documented.

## Acceptance

- [x] Notion records NC-180–201 created with unique Entity Code, evidence scope, and source.
- [x] Previously present NC-35 and NC-157 upgraded in Notion and source snapshot without duplicates.
- [x] Source register dry-run and controlled import verified.
- [x] `node scripts/validate.mjs data/exploration.json exploration` passes at 201.
- [x] `node --test scripts/*.test.mjs` — **27 / 27 passing**.
- [ ] Remote GitHub release and Cloudflare production validation (to be filled after deployment).
