// Pure catalog logic. Does not know about the DOM, source credentials, or private records.
const ARABIC_MARKS = /[\u064B-\u065F\u0670\u0640]/g;

// D37: the source registry keeps both historic records for auditability, but
// they describe one fixed Nasser Social Bank mobile unit. Only the canonical
// place should be counted or displayed in the visitor catalogue.
export const CANONICAL_PLACE_IDS = Object.freeze({ 'NC-35': 'NC-202' });

export function canonicalizePlaces(places) {
  const ids = new Set(places.map(place => place.id));
  return places.filter(place => !ids.has(CANONICAL_PLACE_IDS[place.id]));
}

export function resolveCanonicalPlace(places, slug) {
  const match = places.find(place => place.slug === slug);
  if (!match) return undefined;
  const canonicalId = CANONICAL_PLACE_IDS[match.id];
  return canonicalId ? places.find(place => place.id === canonicalId) || match : match;
}

export function normalize(value = '') {
  return String(value).toLocaleLowerCase('ar')
    .replace(ARABIC_MARKS, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

export function filterPlaces(places, filters = {}) {
  const query = normalize(filters.q || '');
  const tokens = query.split(' ').filter(Boolean);
  const filtered = places.filter(place => {
    if (filters.zone && place.zone !== filters.zone) return false;
    if (filters.kind && place.kind !== filters.kind) return false;
    const searchText = normalize([
      place.name_ar, place.name_en, place.address, place.building_code,
      place.service_type, ...(place.aliases || [])
    ].join(' '));
    return tokens.every(token => searchText.includes(token));
  });
  return filtered.sort((a, b) => {
    if (filters.sort === 'recent') {
      const newest = b.last_checked.localeCompare(a.last_checked);
      if (newest) return newest;
    }
    return a.name_ar.localeCompare(b.name_ar, 'ar');
  });
}
