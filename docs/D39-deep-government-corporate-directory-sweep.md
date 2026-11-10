# D39 — Deep Government & Corporate Directory Sweep (Batch 01)

**Checked:** 2026-11-10 · **Scope:** Government District + Financial District · **Mode:** read-only evidence and gated internal intake · **Outbound communications:** none.

## Outcome

- Initial Notion snapshot: **267 Master records** and **107 internal research candidates**.
- D39 intake: **3 new candidates** in the internal staging database (now **110**). **0 automatic public Master additions.**
- A separate source register in `data/research/d39-directory-evidence.json` records source URLs, evidence scope, master de-duplication, and whether navigation is permissible.
- Authoritative working note: [D39 evidence log in Notion](https://app.notion.com/p/414a7a233ee18179ac19ec829718db32).

## High-priority discovery

The Internal Trade Development Authority [states that nine commercial registry services became exclusively digital](https://www.itda.gov.eg/en/news-details1-1.html) from January 2026. Its [own public announcement](https://www.linkedin.com/posts/itdagovegy_%D8%AC%D9%87%D8%A7%D8%B2%D8%AA%D9%86%D9%85%D9%8A%D8%A9%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D8%A9%D8%A7%D9%84%D8%AF%D8%A7%D8%AE%D9%84%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D8%A7%D9%84%D8%A5%D8%B9%D9%84%D8%A7%D9%85%D9%8A-activity-7474205153366245377-uNpI) also describes *some* services through the Financial District postal branch. The directory should not claim that every listed procedure can be completed in person. Service availability must be resolved at the **individual service-type level**.

The [government website of NOSI](https://www.nosi.gov.eg/ar/News/Pages/2024-02-19.aspx) separately confirms an administrative Egypt Post building used in the Capital by 2024. Do not confuse it with the existing consumer-facing post-office record; precise public entrance is still unverified.

A corporate registry entry for ARCZONE at Citadel is a **registered address only**, with potentially conflicting building delivery status; no visitor navigation.

## Existing Master matches (no duplicates)

Cross-checked: Waste Management Regulatory Authority, Internal Trade Development Authority, National Authority for Tunnels, Egyptian Shore Protection Authority, GAHAR, National Organization for Military Production, General Authority for Supply Commodities, Egyptian Tax Authority, Land Transport Regulatory Authority, General Authority for Land and Dry Ports, and National Center for Translation. Source and enrichment details are stored in the JSON evidence register.

## Research catalog and provenance

Priority first-party and administrative directory sources:

1. [Cabinet organizations hierarchy](https://cabinet.gov.eg/Hierarchy) — organizational membership, *not* location proof.
2. [Cairo Chamber governmental directory](https://www.cairochamber.org.eg/Government.aspx) — discovery, verify directly with organization.
3. [Egypt Trade Portal](https://egypt.tradeportal.org/Contacts?l=ar) — government/business services and contacts; sometimes older addresses.
4. [ITDA Commercial Gazette](https://itda.gov.eg/jurnal.aspx) — legal registration only; **republication prohibited absent written permission**.
5. [ITDA digital services](https://www.itda.gov.eg/registry.aspx) — route service workflows by type.
6. [Federation of Egyptian Industries](https://www.fei.org.eg/) — potential company names, not proof of New Capital presence.
7. [General Authority for Investment](https://www.gafi.gov.eg/) — enterprise source register, not physical entrance.
8. [Egypt Post](https://www.egyptpost.org/) — distinguish HQ and service branch.

## D39.1 review gates

- Categorize `Operating Location | Published Contact | Registered Address Only | Building or Asset Only | Unclear`.
- Store one primary-source URL and verification date per significant factual claim.
- Resolve `Zone → Building → Tenant → Service` relationships before map pins.
- Do not infer business presence from a construction/developer announcement.
- Restrict government visit instructions to services currently available at that location.
- Create no public coordinates or directions from project marketing descriptions.
- Internal research data remains outside the live exploration feed until separate evidence approval.
- No calls, emails, or forms sent to entities.

## QA / blockers

This is an **evidence intake**, not an operational or publication pass. An additional grouping query against Notion hit a temporary quota, so verification distribution by status was not recalculated. The count snapshots above were fetched before the quota was reached. The source register is not a license to republish an official registry.

**Next:** Review more agency sub-units and full company directory candidates while keeping the original operator, office, building and service entities distinct.
