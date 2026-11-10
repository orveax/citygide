// Pure catalog logic. Does not know about the DOM, source credentials, or private records.
const ARABIC_MARKS = /[\u064B-\u065F\u0670\u0640]/g;

// D37: the source registry keeps both historic records for auditability, but
// they describe one fixed Nasser Social Bank mobile unit. Only the canonical
// place should be counted or displayed in the visitor catalogue.
export const CANONICAL_PLACE_IDS = Object.freeze({ 'NC-35': 'NC-202' });

// D28 follow-up: keep disputed records in the audit snapshot, not in the
// visitor directory until the actual in-scope district is independently fixed.
export const SCOPE_QUARANTINE_PLACE_IDS = Object.freeze(['NC-263']);

export function canonicalizePlaces(places) {
  const ids = new Set(places.map(place => place.id));
  const quarantined = new Set(SCOPE_QUARANTINE_PLACE_IDS);
  return places.filter(place => !ids.has(CANONICAL_PLACE_IDS[place.id]) && !quarantined.has(place.id));
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

const SOURCE_LABELS = {
  Published: 'معتمد للنشر',
  'Contact Verified': 'تم التحقق بالتواصل',
  'Source Confirmed': 'المصدر موثّق',
  Research: 'قيد البحث'
};

const VISIT_LABELS = {
  'Walk-in Confirmed': 'استقبال الجمهور موثّق',
  'By Appointment': 'الزيارة بموعد مسبق',
  Unknown: 'دخول الزوار غير مؤكد'
};

// Editorial status and visitor access are independent. Neither a primary
// source nor an approved profile proves that a visitor can enter a building.
export const sourceStatusLabel = place => SOURCE_LABELS[place?.verification] || 'حالة المصدر غير محددة';
export const visitStatusLabel = place => VISIT_LABELS[place?.public_access] || VISIT_LABELS.Unknown;

const DIRECTORY_ZONES = new Set(['Government District', 'Financial District', 'Other']);
const DIRECTORY_KINDS = new Set(['Government', 'Authority', 'Bank', 'Company', 'Building', 'District']);
const DIRECTORY_SORTS = new Set(['relevance', 'name', 'recent']);
const DIRECTORY_VIEWS = new Set(['grid', 'list']);

// Restore a user's discovery context without accepting arbitrary redirect URLs.
// Query values are always serialized, never interpolated into HTML.
export function directoryReturnUrl({ target = 'directory.html', filters = {}, page = 1 } = {}) {
  const safeTarget = ['directory.html', 'approved.html', 'index.html'].includes(target) ? target : 'directory.html';
  const params = new URLSearchParams();
  const query = String(filters.q || '').trim().slice(0, 120);
  if (query) params.set('q', query);
  if (DIRECTORY_ZONES.has(filters.zone)) params.set('zone', filters.zone);
  if (DIRECTORY_KINDS.has(filters.kind)) params.set('kind', filters.kind);
  if (DIRECTORY_SORTS.has(filters.sort) && filters.sort !== 'relevance') params.set('sort', filters.sort);
  if (DIRECTORY_VIEWS.has(filters.view) && filters.view !== 'grid') params.set('view', filters.view);
  if (safeTarget !== 'index.html' && Number.isSafeInteger(page) && page > 1 && page <= 10000) params.set('page', String(page));
  return safeTarget + (params.size ? '?' + params.toString() : '') + (safeTarget === 'index.html' ? '#places' : '#results');
}

export function safeDirectoryReturnUrl(raw, { exploration = false } = {}) {
  const fallback = exploration ? 'directory.html' : 'approved.html';
  if (typeof raw !== 'string' || raw.length > 500) return directoryReturnUrl({ target: fallback });
  const match = /^(directory\.html|approved\.html|index\.html)(?=[?#]|$)/.exec(raw);
  if (!match || (exploration ? match[1] === 'approved.html' : match[1] !== 'approved.html')) {
    return directoryReturnUrl({ target: fallback });
  }
  const params = new URL(raw, 'https://cityguide.invalid/').searchParams;
  const page = Number(params.get('page'));
  return directoryReturnUrl({
    target: match[1],
    filters: Object.fromEntries(['q', 'zone', 'kind', 'sort', 'view'].map(field => [field, params.get(field) || ''])),
    page
  });
}

export function relaxationSuggestions(places, filters = {}) {
  const descriptions = { q: 'كلمة البحث', zone: 'المنطقة', kind: 'نوع الجهة' };
  return Object.entries(descriptions)
    .filter(([field]) => String(filters[field] || '').trim())
    .map(([field, label]) => ({ field, label, count: filterPlaces(places, { ...filters, [field]: '' }).length }))
    .filter(suggestion => suggestion.count > 0)
    .sort((a, b) => a.count - b.count);
}

const sourceWeight = { Published: 4, 'Contact Verified': 3, 'Source Confirmed': 2, Research: 0 };
const kindWeight = { Government: 5, Bank: 4, Authority: 3, Company: 2, Building: 1, District: 0 };

function relevanceScore(place, query) {
  const source = (sourceWeight[place.verification] || 0) * 30;
  const category = (kindWeight[place.kind] || 0) * 3;
  const access = place.public_access === 'Walk-in Confirmed' ? 3 : place.public_access === 'By Appointment' ? 1 : 0;
  if (!query) return source + category + access;

  const nameAr = normalize(place.name_ar);
  const nameEn = normalize(place.name_en);
  const aliases = (place.aliases || []).map(normalize);
  let match = 0;
  if ([nameAr, nameEn, ...aliases].includes(query)) match = 1000;
  else if ([nameAr, nameEn, ...aliases].some(value => value.startsWith(query))) match = 750;
  else if ([nameAr, nameEn, ...aliases].some(value => value.includes(query))) match = 500;
  else if (normalize(place.service_type).includes(query)) match = 200;
  else if (normalize(place.address).includes(query)) match = 100;
  // A strong name match outranks a weak address match even when the latter
  // happens to have a more mature source. These are relevance rules, not ratings.
  return match + source + category + access;
}

export function paginatePlaces(places, requestedPage = 1, pageSize = 12) {
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 12;
  const pages = Math.max(1, Math.ceil(places.length / size));
  const requested = Number(requestedPage);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  const start = (page - 1) * size;
  return {
    items: places.slice(start, start + size),
    page, pages, total: places.length,
    from: places.length ? start + 1 : 0,
    to: Math.min(start + size, places.length)
  };
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
    if (filters.sort === 'relevance') {
      const score = relevanceScore(b, query) - relevanceScore(a, query);
      if (score) return score;
    }
    if (filters.sort === 'recent') {
      const newest = b.last_checked.localeCompare(a.last_checked);
      if (newest) return newest;
    }
    return a.name_ar.localeCompare(b.name_ar, 'ar');
  });
}

// Facets are calculated from the same catalogue as the results. The target
// field is intentionally ignored so users can see the available alternatives
// without losing their active query or other filters.
export function facetCounts(places, filters = {}, field) {
  if (!['zone', 'kind'].includes(field)) throw new Error('Unsupported directory facet');
  const scoped = filterPlaces(places, { ...filters, [field]: '' });
  const counts = { '': scoped.length };
  for (const place of scoped) counts[place[field]] = (counts[place[field]] || 0) + 1;
  return counts;
}
