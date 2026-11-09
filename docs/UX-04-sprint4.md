# UX-04 — Place Details & Navigation UX

## Goal

Answer three visitor questions at the top of a place profile: (1) can I visit, (2) can I navigate to a verified entrance, (3) what contact/action should I take now?

## Implementation

- An above-the-fold visitor decision panel displays independent public-access and navigation states with direct first actions.
- One `navigationDecision()` in `scripts/maps.mjs` produces the same gated action for the hero and Maps sidebar:
  - `directions`: a valid approved Google Maps directions URL plus verified entrance and sufficient location precision; explorer records must also be Published.
  - `search`: a Building/Floor confirmed address that is not a verified entrance; never described as directions.
  - `unavailable`: an exploratory Research record or a district-only/unusable location.
- Telephone is prioritized if present; otherwise official website, then the safe map or on-page address action. The phone/email/website links in the sidebar remain unchanged.
- An abstract classification panel replaces generic architectural photo in individual profiles. It explicitly says it is not an actual office photo.
- The exact source/visitor verification states and `noindex` boundary remain unchanged.

## Acceptance

- [x] Automated policy tests cover all three map modes, exploratory research suppression and approved-only direction gating.
- [x] 46/46 node tests pass; default build continues to contain 267 raw / 265 canonical exploratory and 2 approved-only records.
- [ ] Browser QA on Published, Source Confirmed and Research profiles.
- [ ] Mobile QA at 545px and 340px without overflow, dead actions, or misleading CTA text.
- [ ] Founder visual approval before merge to production.

No service, visitor hours, source verification, map pin, coordinates, external outreach or editorial approval is altered in this sprint.
