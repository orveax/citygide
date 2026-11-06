# D11 — Finder-inspired full visitor experience

## Design decision

Reference: [MadrasThemes Finder WordPress City Guide](https://themeforest.net/item/finder-multipurpose-directory-listing-wordpress-theme/39235665). Reviewed the actual City Guide [homepage v1](https://finder.madrasthemes.com/city-guide/), [v2](https://finder.madrasthemes.com/city-guide/home-v2/), category-led listing layout, place info page and About/FAQ.

- Homepage v1: retain white, text-first architectural hero and layered imagery, with original assets and independent brand.
- Homepage v2: emphasize the search and direct access to category filters.
- Directory: dedicated page with persistent desktop filtering sidebar and mobile-friendly filter fields, URL-backed queries, sorting and grid/list toggle.
- Place: clear title, location role, overview and visit sections, approved contact panel and source history; **no fabricated review, map pin, amenities, opening hours or visitor directions**.
- Supporting pages: About + FAQ, Contact with real verified ORVEAX email, Terms, Privacy, and aligned 404.

The theme's proprietary source code, logo, images and samples were not copied. The project remains static HTML/CSS/JS on Cloudflare Pages with the same record approval manifest, `Published`-only build and `noindex` while general launch is NO-GO.

## Content and security boundaries

- `data/published.json` and `data/publication-approvals.json` are unchanged; only the approved NC-32 record is visible.
- Conceptual architecture images are visible on cards/headers only with explicit disclosure; they are not presented as proof of any place's building or entrance.
- Contact does **not** simulate a form submission. It opens `mailto:hello@orveax.com`, independently confirmed on ORVEAX's live contact page on 6 Nov 2026.
- Terms and Privacy are functional site copy drafts marked for operational and legal review before public indexed launch; no claims of formal regulatory compliance.
- Fonts load from Google Fonts; the privacy copy transparently mentions this external request and Cloudflare hosting.
- The existing public pages remain `noindex,nofollow`; neither client JS nor the deployment bundle includes editorial/private data.

## Review checklist

- [x] All required static pages included in `scripts/build.mjs`.
- [x] 21/21 automated tests passed, including noindex and required navigation on all seven core visitor pages.
- [x] No non-Published records bundled; all internal preview assets excluded.
- [x] Internal static link check reports no missing local assets.
- [ ] Browser desktop/mobile QA on deployed branch: homepage collage, search, catalogue filtering, place detail, navigation and legal text.
- [ ] Human approval of visual direction and editorial/legal text.
- [ ] General public directory indexing remains a separate founder release decision.
