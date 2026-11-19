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


// CG-MUX-08: renderable arrival readiness is independent of a Maps link.
// A searchable building address never becomes a verified visitor entrance.
export function arrivalReadiness(place, { exploration = false } = {}) {
  const navigation = navigationDecision(place, { exploration });
  const precision = place?.address_precision || 'District Only';
  const role = place?.role || 'Unknown';
  const steps = [];
  let location = 'المنطقة فقط — المبنى ومدخل الجمهور غير مثبتين';
  if (precision === 'Building Confirmed') location = 'المبنى محدد — مدخل الجمهور غير مثبت';
  if (precision === 'Floor Confirmed') location = 'المبنى والطابق مذكوران — مدخل الجمهور غير مثبت';
  if (precision === 'Entrance Confirmed' || precision === 'Pin Verified') {
    location = place?.verified_entrance
      ? 'نقطة الوصول مسجلة كمؤكدة'
      : 'توجد دقة موقع أعلى، لكن اعتماد مدخل الجمهور غير مكتمل';
  }
  if (place?.service_availability === 'Other Location') {
    steps.push('تأكد أن الخدمة المطلوبة متاحة في هذا العنوان، لا في مقر مختلف');
  } else {
    steps.push('راجع اختصاص الجهة والخدمة المطلوبة قبل التحرك');
  }
  if (place?.public_access === 'By Appointment') steps.push('أكد موعدك ومتطلبات الدخول مع الجهة');
  else if (place?.public_access === 'Walk-in Confirmed') steps.push('تأكد من مواعيد الاستقبال الفعلية والوثائق المطلوبة');
  else steps.push('استعلم عن استقبال الجمهور ومدخل الزوار قبل الزيارة');
  if (navigation.mode === 'directions') steps.push('استخدم الاتجاهات إلى نقطة الوصول الموثقة ثم راجع تعليمات الموقع');
  else if (navigation.mode === 'search') steps.push('رابط Google Maps للبحث عن المبنى فقط؛ لا تعتمد عليه للوصول إلى شباك الخدمة');
  else steps.push('لا توجد ملاحة معتمدة لهذا السجل؛ اعتمد على المصدر الرسمي والتواصل قبل السفر');
  if (role === 'Administrative HQ') steps.push('هذا مقر إداري، وليس بالضرورة نقطة خدمة للجمهور');
  return {
    location,
    mode: navigation.mode,
    readyForNavigation: navigation.mode === 'directions',
    verifiedEntrance: Boolean(place?.verified_entrance && ['Entrance Confirmed', 'Pin Verified'].includes(precision)),
    steps
  };
}
