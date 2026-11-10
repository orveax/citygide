# BR-04 — Visual Hierarchy & Layout Refinement

Status: Draft for visual approval, not production.

## Design intent

Preserve the accepted Ink + Coral + Warm Neutral palette. Improve hierarchy and scanability in the existing Guide experience without changing data, trust labels, route eligibility or navigation.

## Changes

- Hero: slightly tighter vertical rhythm, larger descriptive copy, less excess whitespace, retained imagery and display typography.
- Search: stronger border/shadow, legible fields, larger primary action and clear responsive wrapping.
- Directory cards: larger titles, metadata and status type; more compact artwork header and consistent internal rhythm.
- Sections: more deliberate spacing, stronger headings, slightly larger body copy and refined CTA panel.
- Responsive: viewport-specific rules at <=1050px and <=760px, preserving existing mobile discovery patterns.

## Quality gates

- `node scripts/build.mjs` passes.
- `node --test scripts/*.test.mjs` passes (49/49).
- Pending: visual screenshots at 390, 768, 1440 px on Home, Directory, Place, About and Contact, interaction and overflow acceptance.
- Keep PR draft until browser QA. No automatic merge or production publish.
