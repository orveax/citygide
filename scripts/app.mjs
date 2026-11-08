import { canonicalizePlaces, filterPlaces, resolveCanonicalPlace } from './catalog.mjs';
import { mapsDirectionsUrl, mapsSearchUrl } from './maps.mjs';

const $ = id => document.getElementById(id);
const preview = document.body.dataset.preview === 'true';
const exploration = document.body.dataset.catalog === 'exploration';
const home = document.body.dataset.home === 'true';
const detailHref = exploration ? 'explore-place.html?slug=' : 'place.html?slug=';

const ZONES = { 'Government District': 'الحي الحكومي', 'Financial District': 'حي المال والأعمال', Other: 'المنطقة قيد التحقق' };
const KINDS = { Government: 'وزارة', Authority: 'هيئة أو جهة', Bank: 'بنك', Company: 'شركة', Building: 'مبنى', District: 'حي' };
const ROLES = { 'Administrative HQ': 'مقر إداري', 'Public Service Point': 'نقطة خدمة للجمهور', Facility: 'مبنى أو منشأة', District: 'حي', Unknown: 'صفة الموقع قيد التحقق' };
const PRECISIONS = {
  'District Only': 'المنطقة فقط — لا يوجد مدخل دقيق مؤكد',
  'Building Confirmed': 'المبنى مؤكد، لكن المدخل غير مثبت',
  'Floor Confirmed': 'الطابق مؤكد، والمدخل لم يتأكد بعد',
  'Entrance Confirmed': 'المدخل مؤكد',
  'Pin Verified': 'نقطة الوصول مؤكدة'
};
const IMAGES = {
  Government: 'assets/civic-illustration.webp',
  Authority: 'assets/civic-illustration.webp',
  Bank: 'assets/financial-illustration.webp',
  Company: 'assets/city-skyline.webp'
};
const labelZone = zone => ZONES[zone] || 'منطقة أخرى';
const labelKind = kind => KINDS[kind] || 'جهة';
const labelRole = role => ROLES[role] || role;
const setText = (id, value, fallback = 'غير مؤكد') => { if ($(id)) $(id).textContent = value || fallback; };
const element = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent !== undefined) node.textContent = textContent;
  return node;
};
const link = (label, href, className = '') => {
  const a = element('a', className, label);
  a.href = href;
  if (href.startsWith('https://')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  return a;
};

async function loadPlaces() {
  const response = await fetch(exploration ? 'data/exploration.json' : 'data/places.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load the catalog');
  const payload = await response.json();
  const requiredMode = exploration ? 'exploration' : preview ? 'preview' : 'production';
  if (payload.mode !== requiredMode || !Array.isArray(payload.places)) throw new Error('Unexpected dataset mode');
  const allowed = exploration ? new Set(['Research', 'Source Confirmed', 'Contact Verified', 'Published']) : preview ? new Set(['Source Confirmed', 'Contact Verified', 'Published']) : new Set(['Published']);
  if (!payload.places.every(place => allowed.has(place.verification))) throw new Error('Record passed the publishing gate without approval');
  return payload.places;
}

function emptyState(places, filters) {
  const holder = element('div', 'empty-state');
  holder.append(element('div', 'empty-state__icon', '⌕'));
  holder.append(element('h3', '', !places.length ? 'الدليل بيتجهّز بعناية' : 'ملقيناش جهة مطابقة للبحث'));
  holder.append(element('p', '', !places.length
    ? (preview ? 'دي معاينة داخلية لسجلات تحت المراجعة، وليست دليلاً منشورًا.' : 'بنراجع عناوين الجهات ومصادرها وشروط الزيارة قبل ما نعرضها. أول ما البيانات تتعتمد، هتلاقيها هنا.')
    : 'جرّب اسم مختلف، أو غيّر المنطقة ونوع الجهة علشان توسّع النتائج.'));
  if (places.length && (filters.q || filters.kind || filters.zone)) {
    const reset = element('button', 'reset-filters', 'مسح كل الفلاتر');
    reset.type = 'button'; reset.addEventListener('click', () => { $('q').value = ''; $('kind').value = ''; $('zone').value = ''; renderDirectory(places); });
    holder.append(reset);
  }
  return holder;
}

function placeCard(place) {
  const card = element('article', 'place-card');
  const imageWrap = element('div', 'place-card__image');
  const image = element('img'); image.src = IMAGES[place.kind] || IMAGES.Company;
  image.alt = ''; image.loading = 'lazy'; imageWrap.append(image);
  imageWrap.append(element('span', 'image-badge', labelKind(place.kind)));
  imageWrap.append(element('span', 'image-disclosure', 'مشهد معماري توضيحي'));
  if (exploration) {
    const stateLabel = place.verification === 'Published' ? 'منشور ومعتمد' : place.verification === 'Research' ? 'بحث مبدئي' : 'المصدر قيد المراجعة';
    imageWrap.append(element('span', 'verification-tag verification-tag--' + (place.verification === 'Published' ? 'approved' : place.verification === 'Research' ? 'research' : 'source'), stateLabel));
  }
  const body = element('div', 'place-card__body');
  body.append(element('span', 'place-card__eyebrow', labelZone(place.zone) + ' / ' + labelRole(place.role)));
  const title = element('h3'); title.append(link(place.name_ar, detailHref + encodeURIComponent(place.slug)));
  const address = element('p', 'place-card__address', '⌖  ' + place.address);
  const meta = element('div', 'place-card__meta');
  meta.append(element('span', '', labelZone(place.zone)));
  meta.append(link(place.kind === 'Building' ? 'تفاصيل المبنى ←' : 'تفاصيل الجهة ←', detailHref + encodeURIComponent(place.slug)));
  body.append(title, address, meta);
  if (place.public_access === 'Unknown') body.append(element('p', 'place-card__note', 'شروط دخول الزوار غير مؤكدة — تواصل قبل الزيارة.'));
  if (exploration && place.verification !== 'Published') body.append(element('p', 'place-card__verification-note', place.verification === 'Research' ? 'سجل بحثي غير معتمد؛ لا تعتمد على العنوان للزيارة.' : 'المصدر متاح، لكن هذه الصفحة لم تحصل على اعتماد النشر.'));
  card.append(imageWrap, body);
  return card;
}

function syncChips() {
  const selected = $('kind').value;
  document.querySelectorAll('[data-kind]').forEach(chip => {
    const active = chip.dataset.kind === selected;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function syncViews() {
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === (document.body.dataset.view || 'grid');
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('cards').classList.toggle('is-list', document.body.dataset.view === 'list');
}

function renderDirectory(places) {
  const filters = { q: $('q').value, kind: $('kind').value, zone: $('zone').value, sort: $('sort').value };
  const results = filterPlaces(places, filters);
  setText('count', String(results.length), '0');
  setText('resultsDescription', home ? 'سجلًا في الدليل — نعرض 6 نماذج منها' : exploration ? 'نتيجة استكشافية — حالات التحقق موضحة' : preview ? 'نتيجة للمعاينة الداخلية، غير معتمدة للنشر' : 'مكان معتمد للنشر');
  const target = $('cards'); target.replaceChildren();
  target.classList.toggle('is-sparse', results.length === 1);
  if (!results.length) target.append(emptyState(places, filters));
  else (home ? results.slice(0, 6) : results).forEach(place => target.append(placeCard(place)));
  syncChips(); syncViews();
  const url = new URL(location.href);
  for (const field of ['q', 'kind', 'zone']) {
    if (filters[field]) url.searchParams.set(field, filters[field]);
    else url.searchParams.delete(field);
  }
  history.replaceState(null, '', url);
}

function setupDirectory(places) {
  const fullDirectoryUrl = () => {
    const params = new URLSearchParams();
    for (const field of ['q', 'kind', 'zone']) if ($(field).value) params.set(field, $(field).value);
    return 'directory.html' + (params.size ? '?' + params.toString() : '');
  };
  const params = new URLSearchParams(location.search);
  for (const field of ['q', 'kind', 'zone']) {
    const value = params.get(field);
    if (value && ($(field).tagName === 'INPUT' || [...$(field).options].some(o => o.value === value))) $(field).value = value;
  }
  $('searchForm').addEventListener('submit', event => { event.preventDefault(); if (home) { location.assign(fullDirectoryUrl()); return; } renderDirectory(places); $('places').scrollIntoView({ behavior: 'smooth' }); });
  for (const field of ['q', 'kind', 'zone', 'sort']) $(field).addEventListener(field === 'q' ? 'input' : 'change', () => renderDirectory(places));
  document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => { $('kind').value = button.dataset.kind; if (home) { location.assign(fullDirectoryUrl()); return; } renderDirectory(places); $('places').scrollIntoView({ behavior: 'smooth' }); }));
  document.querySelectorAll('[data-zone-link]').forEach(a => a.addEventListener('click', event => { $('zone').value = a.dataset.zoneLink; $('kind').value = ''; $('q').value = ''; if (home) { event.preventDefault(); location.assign(fullDirectoryUrl()); return; } renderDirectory(places); }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { document.body.dataset.view = button.dataset.view; syncViews(); }));
  renderDirectory(places);
}

function setupDetail(places) {
  const slug = new URLSearchParams(location.search).get('slug');
  const place = resolveCanonicalPlace(places, slug);
  if (!place) {
    setText('title', 'الجهة غير موجودة في الدليل');
    setText('subtitle', 'ارجع للدليل وابحث عن اسم الجهة من جديد.');
    document.querySelector('.detail-badges').replaceChildren();
    document.querySelector('.detail-layout').hidden = true;
    return;
  }
  if (place.slug !== slug) {
    const url = new URL(location.href);
    url.searchParams.set('slug', place.slug);
    history.replaceState(null, '', url);
  }
  document.title = place.name_ar + ' | دليل العاصمة' + (exploration ? ' — نسخة استكشافية' : preview ? ' — معاينة داخلية' : '');
  setText('title', place.name_ar); setText('crumbName', place.name_ar); setText('crumbZone', labelZone(place.zone));
  setText('subtitle', labelZone(place.zone) + ' · ' + labelRole(place.role));
  setText('address', place.address); setText('precision', PRECISIONS[place.address_precision] || 'غير محدد');
  setText('role', labelKind(place.kind) + ' — ' + labelRole(place.role));
  setText('service', place.service_type, 'لا توجد خدمة حضورية محددة مثبتة');
  setText('visitorHours', place.visitor_hours, place.public_access === 'By Appointment'
    ? 'الزيارة بموعد مسبق — لا توجد ساعات استقبال مفتوحة معلنة'
    : 'غير مؤكدة — لا تعتمد على مواعيد العمل الإداري');
  setText('officeHours', place.office_hours, 'غير منشورة بمصدر واضح');
  setText('checked', place.last_checked);
  setText('accessNotice', exploration && place.verification === 'Research'
    ? 'هذا سجل بحثي أولي، ولم يتم اعتماد الموقع أو إمكانية الزيارة. لا تستخدم العنوان للتنقل.'
    : place.public_access === 'Unknown'
    ? 'تنبيه قبل الزيارة: دخول الجمهور ومدخل الزوار لم يتم تأكيدهما. اتصل بالجهة قبل التحرك.'
    : place.public_access === 'By Appointment'
      ? 'الزيارة بموعد مسبق للخدمة المحددة. تواصل مع الجهة لتأكيد موعدك ومدخل الزوار قبل التحرك.'
      : 'راجع شروط الزيارة وطريقة الوصول مع الجهة قبل التحرك.');
  document.querySelector('.detail-hero-art img').src = IMAGES[place.kind] || IMAGES.Company;
  const contact = $('contact');
  if (place.phone) contact.append(link('اتصل بالجهة', 'tel:' + place.phone.replace(/[^\d+]/g, ''), 'primary'));
  if (place.email) contact.append(link('البريد الإلكتروني', 'mailto:' + encodeURIComponent(place.email)));
  if (place.website) contact.append(link(place.kind === 'Building' ? 'صفحة المشروع لدى المصدر' : 'الموقع الرسمي', place.website));
  if (!contact.children.length) contact.append(element('p', 'source-note', 'لا توجد وسيلة اتصال مؤكدة في السجل.'));
  const directions = exploration && place.verification !== 'Published' ? '' : mapsDirectionsUrl(place);
  const mapSearch = exploration && place.verification === 'Research' ? '' : mapsSearchUrl(place);
  const mapActions = $('mapActions');
  if (directions) {
    mapActions.append(link('ابدأ الملاحة على Google Maps', directions, 'primary'));
    setText('mapNotice', 'وجهة الوصول ومدخل الزوار موثقان في السجل. هتفتح Google Maps وتختار موقع البداية المناسب لك.');
  } else if (mapSearch) {
    mapActions.append(link('ابحث عن المقر على Google Maps', mapSearch));
    setText('mapNotice', 'الرابط يفتح نتيجة بحث عن عنوان المقر، مش اتجاهات إلى مدخل مؤكد. راجع مكان الدخول مع الجهة قبل التحرك.');
  } else {
    mapActions.append(element('p', 'source-note', 'لا توجد نقطة وصول دقيقة أو عنوان مبنى موثق لعرضه على الخريطة.'));
    setText('mapNotice', 'هنضيف رابط الخرائط لما تتأكد دقة موقع الجهة.');
  }
  $('source').append(link(exploration && place.verification !== 'Published' ? 'راجع المصدر الأولي' : 'افتح المصدر الرسمي', place.source_url));
  if (preview) document.querySelector('.verified-badge').textContent = 'معاينة داخلية · ' + place.verification;
  if (exploration && !home) {
    const badge = document.querySelector('.verified-badge');
    badge.textContent = place.verification === 'Published' ? '✓ منشور ومعتمد' : place.verification === 'Research' ? '⚠ بحث مبدئي — غير معتمد للزيارة' : '⚠ مصدر أولي — لم تعتمد بيانات الزيارة';
    badge.classList.toggle('verified-badge--unapproved', place.verification !== 'Published');
  }
}

try {
  const places = await loadPlaces();
  if (preview) document.querySelectorAll('.announcement__inner > span:first-child').forEach(el => el.textContent = 'معاينة داخلية — السجلات لم تُعتمد للنشر العام');
  if (exploration) {
    document.querySelectorAll('.announcement__inner > span:first-child').forEach(el => el.textContent = 'نسخة استكشافية — بعض الجهات لم تُعتمد بيانات زيارتها');
    const note = element('aside', 'exploration-banner');
    note.setAttribute('role', 'note');
    const box = element('div', 'container exploration-banner__inner');
    box.append(element('strong', '', 'تجربة الدليل الموسّع'), element('p', '', 'النتائج تشمل سجلات منشورة وسجلات بحثية غير معتمدة. تحقّق من حالة كل جهة ومصدرها، ولا تتحرك إلى مقر غير مؤكد.'));
    box.append(link('عرض الجهات المعتمدة فقط ←', 'approved.html'));
    note.append(box);
    document.querySelector('main')?.prepend(note);
  }
  if ($('cards')) setupDirectory(exploration ? canonicalizePlaces(places) : places);
  if ($('title')) setupDetail(places);
} catch (error) {
  console.error('Catalog unavailable:', error.message);
  if ($('cards')) {
    $('cards').replaceChildren();
    const message = element('div', 'empty-state');
    message.append(element('h3', '', 'تعذر تحميل بيانات الدليل'), element('p', '', 'جرّب تحديث الصفحة لاحقًا. لم يتم عرض أي بيانات غير معتمدة.'));
    $('cards').append(message);
  }
  if ($('title')) { setText('title', 'تعذر تحميل بيانات الجهة'); document.querySelector('.detail-badges').replaceChildren(); document.querySelector('.detail-layout').hidden = true; }
}
