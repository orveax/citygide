// Candidate research registry: deliberately separate from the approved and exploratory public catalogues.
const STATES = new Set(['Source identified', 'Needs operator confirmation', 'Conflict hold', 'Field QA required', 'Research only']);
const TYPES = new Set(['Government Service','Bank Branch','Telecom Branch','University','Commercial Facility','Property Asset','Other']);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export function validateCityResearch(dataset) {
  const errors = [];
  if (dataset?.schema_version !== '0.1') errors.push('research schema_version must be 0.1');
  if (dataset?.mode !== 'research') errors.push('research dataset must have mode research');
  if (dataset?.publication_scope !== 'Internal research only; not included in any public build') errors.push('publication scope must be internal');
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(dataset?.city?.id || '')) errors.push('city.id must be a slug');
  if (!DATE.test(dataset?.checked_at || '')) errors.push('checked_at must be date');
  if (!Array.isArray(dataset?.places)) return [...errors, 'places must be an array'];
  const ids = new Set();
  for (const [i, p] of dataset.places.entries()) {
    const tag = `places[${i}]`;
    if (!/^ALM-\d{3,}$/.test(p.id || '')) errors.push(`${tag}: invalid ID`);
    if (ids.has(p.id)) errors.push(`${tag}: duplicate ID`);
    ids.add(p.id);
    if (!p.name_ar?.trim() || !p.address_source_text?.trim()) errors.push(`${tag}: missing place identity/address`);
    if (!TYPES.has(p.entity_type)) errors.push(`${tag}: invalid entity type`);
    if (!STATES.has(p.research_state)) errors.push(`${tag}: invalid research state`);
    if (!/^https:\/\/[^\s]+$/i.test(p.source?.url || '') || !p.source?.owner || !p.source?.claim || !DATE.test(p.source?.checked_on || '')) errors.push(`${tag}: source evidence incomplete`);
    if (!p.evidence_boundary?.trim() || !p.next_verification_action?.trim()) errors.push(`${tag}: evidence boundary/action missing`);
    if (p.release_approved !== false || p.verified_entrance !== false || p.directions_url !== null || p.public_access !== 'Unknown' || p.visitor_hours !== null) errors.push(`${tag}: unapproved candidate may not carry routing, visitor hours or release flags`);
    if ('latitude' in p || 'longitude' in p || 'pin' in p || 'verification' in p) errors.push(`${tag}: research must not masquerade as a public place`);
  }
  return errors;
}
