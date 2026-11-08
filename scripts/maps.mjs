// Google Maps URLs are outward links. The site never geolocates a visitor.
// A building/floor address is searchable, but never treated as a verified entrance.
const searchable = new Set(['Building Confirmed', 'Floor Confirmed', 'Entrance Confirmed', 'Pin Verified']);
const navigable = new Set(['Entrance Confirmed', 'Pin Verified']);

export function mapsSearchUrl(place) {
  if (!place || !searchable.has(place.address_precision) || !place.address?.trim()) return '';
  const query = [place.name_ar, place.address].filter(Boolean).join('، ');
  if (query.length > 700) return '';
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

export function mapsDirectionsUrl(place) {
  if (!place?.verified_entrance || !navigable.has(place.address_precision) || !place.directions_url) return '';
  try {
    const url = new URL(place.directions_url);
    if (url.protocol !== 'https:' || !['www.google.com', 'google.com', 'maps.google.com'].includes(url.hostname)) return '';
    if (!['/maps/dir', '/maps/dir/'].includes(url.pathname) || url.searchParams.get('api') !== '1' || !url.searchParams.get('destination')?.trim()) return '';
    url.searchParams.delete('origin'); // Let Google Maps use the visitor's own location, when available.
    url.searchParams.set('dir_action', 'navigate');
    return url.toString();
  } catch { return ''; }
}

// One navigation decision for both the profile hero and the Maps sidebar.
// A source-backed building is not a verified visitor entrance. Exploratory
// Research records do not receive even a search shortcut until reviewed.
export function navigationDecision(place, { exploration = false } = {}) {
  const directions = !exploration || place?.verification === 'Published' ? mapsDirectionsUrl(place) : '';
  if (directions) return {
    mode: 'directions', href: directions,
    label: 'ابدأ الملاحة على Google Maps',
    status: 'نقطة وصول مؤكدة',
    notice: 'تم توثيق نقطة الوصول في السجل. Google Maps يحدد نقطة البداية على جهازك؛ تأكد من شروط الزيارة قبل التحرك.'
  };
  if (exploration && place?.verification === 'Research') return {
    mode: 'unavailable', reason: 'research', href: '', label: '',
    status: 'رابط الخرائط محجوب لحين مراجعة السجل',
    notice: 'السجل ما زال قيد البحث؛ قد يكون عنوان المبنى مدونًا، لكن لم نعتمد استخدامه للتنقل أو البحث على الخرائط.'
  };
  const search = mapsSearchUrl(place);
  if (search) return {
    mode: 'search', href: search,
    label: 'ابحث عن المقر على Google Maps',
    status: 'بحث عن المقر فقط — ليس اتجاهات',
    notice: 'الرابط يعرض بحثًا عن المبنى أو العنوان، وليس مسارًا لمدخل زوار مؤكد. راجع مكان الدخول مع الجهة.'
  };
  return {
    mode: 'unavailable', reason: 'location', href: '', label: '',
    status: 'لا توجد نقطة وصول موثقة',
    notice: 'لن نعرض توجيهات أو رابط خرائط قبل وجود بيانات موقع كافية ومراجعتها.'
  };
}
