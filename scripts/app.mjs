import { canonicalizePlaces, filterPlaces, paginatePlaces, resolveCanonicalPlace, sourceStatusLabel, visitStatusLabel } from './catalog.mjs';
import { mapsDirectionsUrl, mapsSearchUrl } from './maps.mjs';

const $ = id => document.getElementById(id);
const preview = document.body.dataset.preview === 'true';
const exploration = document.body.dataset.catalog === 'exploration';
const home = document.body.dataset.home === 'true';
const detailHref = exploration ? 'explore-place.html?slug=' : 'place.html?slug=';
const PAGE_SIZE = 12;
let currentPage = 1;

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
    reset.type = 'button'; reset.addEventListener('click', () => { $('q').value = ''; $('kind').value = ''; $('zone').value = ''; renderDirectory(places, { resetPage: true }); });
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
  const stateClass = place.verification === 'Published' ? 'approved' : place.verification === 'Research' ? 'research' : 'source';
  imageWrap.append(element('span', 'verification-tag verification-tag--' + stateClass, sourceStatusLabel(place)));
  const body = element('div', 'place-card__body');
  body.append(element('span', 'place-card__eyebrow', labelZone(place.zone) + ' / ' + labelRole(place.role)));
  const title = element('h3'); title.append(link(place.name_ar, detailHref + encodeURIComponent(place.slug)));
  const status = element('div', 'place-card__status');
  const visitClass = place.public_access === 'By Appointment' ? 'appointment' : place.public_access === 'Walk-in Confirmed' ? 'walkin' : 'unknown';
  status.append(element('span', 'visit-status visit-status--' + visitClass, visitStatusLabel(place)));
  const address = element('p', 'place-card__address', '⌖  ' + place.address);
  const meta = element('div', 'place-card__meta');
  meta.append(element('span', '', labelZone(place.zone)));
  meta.append(link(place.kind === 'Building' ? 'تفاصيل المبنى ←' : 'تفاصيل الجهة ←', detailHref + encodeURIComponent(place.slug)));
  body.append(title, status, address, meta);
  if (exploration && place.verification === 'Research') body.append(element('p', 'place-card__verification-note', 'سجل بحثي غير معتمد؛ لا تعتمد على العنوان للزيارة.'));
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

function renderPagination(pageData, places) {
  const holder = $('pagination');
  if (!holder) return;
  holder.replaceChildren();
  holder.hidden = pageData.pages <= 1;
  if (holder.hidden) return;

  holder.append(element('span', 'pagination__summary', `عرض ${pageData.from}–${pageData.to} من ${pageData.total} نتيجة`));
  const controls = element('div', 'pagination__controls');
  const addPageButton = (label, target, className = '') => {
    const button = element('button', 'pagination__button ' + className, label);
    button.type = 'button';
    button.setAttribute('aria-label', target === pageData.page ? `الصفحة ${target} الحالية` : `انتقل إلى الصفحة ${target}`);
    if (target === pageData.page) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      currentPage = target;
      renderDirectory(places);
      document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    controls.append(button);
    return button;
  };
  const prev = addPageButton('السابق', Math.max(1, pageData.page - 1), 'pagination__button--edge');
  prev.disabled = pageData.page === 1;
  const pages = [...new Set([1, pageData.pages, pageData.page - 1, pageData.page, pageData.page + 1]
    .filter(page => page >= 1 && page <= pageData.pages))].sort((a, b) => a - b);
  pages.forEach((page, i) => {
    if (i && page > pages[i - 1] + 1) controls.append(element('span', 'pagination__ellipsis', '…'));
    addPageButton(String(page), page, page === pageData.page ? 'is-active' : '');
  });
  const next = addPageButton('التالي', Math.min(pageData.pages, pageData.page + 1), 'pagination__button--edge');
  next.disabled = pageData.page === pageData.pages;
  holder.append(controls);
}

function renderDirectory(places, { resetPage = false } = {}) {
  if (resetPage) currentPage = 1;
  const filters = { q: $('q').value, kind: $('kind').value, zone: $('zone').value, sort: $('sort').value };
  const results = filterPlaces(places, filters);
  const pageData = paginatePlaces(results, currentPage, PAGE_SIZE);
  currentPage = pageData.page;
  setText('count', String(results.length), '0');
  setText('resultsDescription', home ? 'سجلًا في الدليل — نعرض 6 نماذج منها' : exploration ? 'نتيجة استكشافية — حالات المصدر والزيارة منفصلة' : preview ? 'نتيجة للمعاينة الداخلية، غير معتمدة للنشر' : 'مكان معتمد للنشر');
  const target = $('cards'); target.replaceChildren();
  target.classList.toggle('is-sparse', pageData.items.length === 1);
  if (!results.length) target.append(emptyState(places, filters));
  else (home ? results.slice(0, 6) : pageData.items).forEach(place => target.append(placeCard(place)));
  if (!home) renderPagination(pageData, places);
  syncChips(); syncViews();
  const url = new URL(location.href);
  for (const field of ['q', 'kind', 'zone', 'sort']) {
    if (filters[field] && !(field === 'sort' && filters.sort === 'relevance')) url.searchParams.set(field, filters[field]);
    else url.searchParams.delete(field);
  }
  if (!home && currentPage > 1) url.searchParams.set('page', String(currentPage));
  else url.searchParams.delete('page');
  history.replaceState(null, '', url);
}

function setupDirectory(places) {
  const fullDirectoryUrl = () => {
    const params = new URLSearchParams();
    for (const field of ['q', 'kind', 'zone', 'sort']) if ($(field).value && !(field === 'sort' && $(field).value === 'relevance')) params.set(field, $(field).value);
    return 'directory.html' + (params.size ? '?' + params.toString() : '');
  };
  const params = new URLSearchParams(location.search);
  for (const field of ['q', 'kind', 'zone', 'sort']) {
    const value = params.get(field);
    if (value && ($(field).tagName === 'INPUT' || [...$(field).options].some(o => o.value === value))) $(field).value = value;
  }
  if (!home) currentPage = Number(params.get('page')) || 1;
  $('searchForm').addEventListener('submit', event => { event.preventDefault(); if (home) { location.assign(fullDirectoryUrl()); return; } renderDirectory(places, { resetPage: true }); document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth' }); });
  for (const field of ['q', 'kind', 'zone', 'sort']) $(field).addEventListener(field === 'q' ? 'input' : 'change', () => renderDirectory(places, { resetPage: true }));
  document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => { $('kind').value = button.dataset.kind; if (home) { location.assign(fullDirectoryUrl()); return; } renderDirectory(places, { resetPage: true }); document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth' }); }));
  document.querySelectorAll('[data-zone-link]').forEach(a => a.addEventListener('click', event => { $('zone').value = a.dataset.zoneLink; $('kind').value = ''; $('q').value = ''; if (home) { event.preventDefault(); location.assign(fullDirectoryUrl()); return; } renderDirectory(places, { resetPage: true }); }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { document.body.dataset.view = button.dataset.view; syncViews(); }));
  setText('exploreEntryCount', String(places.length), '0');
  setText('sampleDirectoryCount', String(places.length), '0');
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
  const sourceBadge = document.querySelector('.verified-badge');
  sourceBadge.textContent = 'حالة السجل: ' + sourceStatusLabel(place);
  sourceBadge.classList.toggle('verified-badge--unapproved', place.verification !== 'Published');
  const visitBadge = $('visitBadge');
  if (visitBadge) {
    visitBadge.textContent = 'الزيارة: ' + visitStatusLabel(place);
    visitBadge.className = 'visit-status visit-status--' + (place.public_access === 'By Appointment' ? 'appointment' : place.public_access === 'Walk-in Confirmed' ? 'walkin' : 'unknown');
  }
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
  $('source').append(link(exploration && place.verification !== 'Published' ? 'راجع مصدر البيانات' : 'افتح المصدر الرسمي', place.source_url));
  if (preview) sourceBadge.textContent = 'معاينة داخلية · ' + sourceStatusLabel(place);
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
