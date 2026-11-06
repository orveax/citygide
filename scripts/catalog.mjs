// Pure catalog logic. Does not know about the DOM, source credentials, or private records.
const ARABIC_MARKS = /[\u064B-\u065F\u0670\u0640]/g;

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
