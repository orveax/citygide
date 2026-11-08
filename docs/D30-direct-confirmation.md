# D30 — Direct confirmation readiness and contact routing

Checked: **8 November 2026**. Scope: the four **D29 unresolved visitor destinations** in Egypt's New Administrative Capital. The authoritative editorial database remains [Notion Places & Organizations](https://app.notion.com/p/adf3616237a14eed811ebc354aa8f167).

**Decision:** prepare an actionable direct-contact queue, correct the two visitor-contact fields backed by primary sources, but **do not falsely mark outreach as completed**. No calls, email enquiries, site visits, or responses were made in D30. No entrance coordinate, walk-in availability, public reception hours, or map route is approved as a result. Catalog remains **245 tracked / 158 Source Confirmed / 85 Research / 2 Published**.

## Newly verified contact routing

| Entity | First-party or authoritative contact proof | Change to City Guide | Still missing |
| --- | --- | --- | --- |
| **NC-241 QIZ** | The [QIZ renewal PDF](https://www.qizegypt.gov.eg/Content/Site/Library/14451206104053198Certificates-Renewal%28qizegypt.gov.eg%29.pdf) instructs companies to submit renewal documents to **info@qizegypt.gov.eg**, await verification, and book a certificate-collection appointment at the **Visitors Gate, floor 5, office 5140**. The separate quarterly-review booking route uses `review@qizegypt.gov.eg` and [Setmore](https://qizunit.setmore.com/). | Corrected the **primary entity email** from `review@…` to `info@…` because this record's proven service is certificate collection. The quarterly-review address is still separately documented. | Whether all pre-booked visitors use this gate, security protocol, reception hours, GPS arrival pin. |
| **NC-243 LTRA** | The government [Egypt Trade Facilitation Portal](https://egypt.tradeportal.org/Contacts/18?l=ar) lists the **2nd floor of Ministry of Transport**, **02 2054 2140**, and *freight-licensing unit* working hours Sun–Thu **09:00–14:30**. | No data inflation; a live enquiry can use the known number. **The portal's malformed `ltra@lhps.gov.gov` is not a valid contact route.** | Actual public counter opening, appointment rule, visitor gate, service-specific documents. |
| **NC-245 UDF** | [31 July 2026 report of the fund announcement](https://www.algomhor.com/455617) says reception was to move to the **ground floor of L1M – Zone 11** from **5 August**. The [June 2026 fund announcement reported by Shorouk](https://www.shorouknews.com/news/view.aspx?cdate=08062026&id=31d38bc8-3c9c-44c6-872b-5f4ab0275534) provides the online [complaints portal](https://complaints.udf-apps.com/) for **actual citizen complaints**, not as a directory-validation mailbox. Older media cite **15444** for property sales, but current suitability for visitor-location confirmation is not verified. | None. Keep `Research`; do **not** submit a false complaint or upload anyone's personal ID just to verify the office. | Fund-controlled current reception confirmation, general contact channel, hours, gate. |
| **NC-60 EBank** | [EBank's official contact page](https://ebank.com.eg/ar/contact-us/) lists **16710** for customer service, and [its branch locator](https://ebank.com.eg/ar/branches-atm-locator/) is authoritative but did **not** expose an address for the new branch in fetched content. [Bank-branded corporate post](https://ae.linkedin.com/posts/ebank.egypt_عالمجديدأحناأوله-activity-7492911955880628224-X9ZD) records the New Capital branch opening in August 2026. | Added **16710** and official branch-locator link. Remains `Research`, `District Only`, `zone: Other`. | Bank-confirmed district, plot/building, opening hours and branch entrance. |

## Contact queue, not fabricated confirmations

The machine-readable queue is [`data/direct-verification.json`](../data/direct-verification.json). All four entries are `Not Contacted`, each with its official/verified contact route (when found), exact questions, acceptance standard and an empty attempt history.

| Priority | Contact owner/action | Outbound prompt (short form) | Accepted result |
| --- | --- | --- | --- |
| P0 QIZ | Project owner or designated representative emails `info@qizegypt.gov.eg` | “نقوم بتوثيق مسار زيارة استلام شهادات الكويز المجددة. هل مدخل الزائرين المذكور في تعليماتكم هو مدخل كل موعد؟ وهل يلزم تصريح دخول؟ وهل يوجد رابط خرائط رسمي لنقطة استقبال الزوار وساعات استقبال المواعيد؟” | Written service-specific reply; map pin still independently checked. |
| P0 LTRA | Project owner calls `02 2054 2140` | “هل إدارة خدمات نقل البضائع تستقبل المراجعين حاليًا بالدور الثاني؟ هل مواعيد 9:00–14:30 مواعيد الجمهور أم مواعيد عمل الموظفين فقط؟ هل يلزم موعد ومن أي بوابة ندخل؟” | Dated call log recording the respondent/department; written backup for entrance. |
| P0 UDF | First resolve an **appropriate official general-information channel** | “هل مركز خدمة عملاء L1M Zone 11 يعمل الآن؟ ما ساعات الاستقبال ونظام الدخول والمدخل الرسمي؟” | First-party UDF notice or named official respondent; no fabricated complaint submission. |
| P1 EBank | Project owner calls official **16710** | “ما العنوان التفصيلي ورقم القطعة لفرع العاصمة الجديدة؟ وهل الفرع يعمل بالفعل، وما ساعات الجمهور ورابط الفرع على الخريطة؟” | Bank-owned locator/confirmation tied unambiguously to **the branch**, not HQ. |

## Verification acceptance gates

1. **Direct answer:** log timestamp, method, contacted identity/department, original evidence and exact service scope. Mere dialling is not verification.
2. **Visit-ready:** independently confirm public access type (`By Appointment` or `Walk-in Confirmed`) and *public-counter* hours; unit/agency work hours do not qualify.
3. **Navigation-ready:** obtain entrance, actual arrival point and safe Google Maps destination from institution-controlled evidence or separately verified location. Building centroids and unrelated business/map listings cannot be substituted.
4. **Publish-ready:** require human editorial approval; a positive reply may update `Source Confirmed`, not automatically `Published`.

## Next operational action

Obtain confirmation from QIZ and LTRA, then branch details from EBank; parallel task: locate UDF's valid general-information contact. Only once replies or verified first-party evidence are **actually received** should the queue's `attempts` and `verified_outcome` be updated. Do not create directions until the entrance gate passes the evidence test.
