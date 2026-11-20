import { canonicalizePlaces, directoryReturnUrl, facetCounts, filterPlaces, paginatePlaces, placePurpose, relaxationSuggestions, resolveCanonicalPlace, safeDirectoryReturnUrl, searchSuggestions, sourceStatusLabel, visitStatusLabel } from './catalog.mjs';
import { arrivalReadiness, navigationDecision } from './maps.mjs';
import { buildingForPlace, buildingGroup } from './building-relations.mjs';
import { emitMeasurement } from './measurement.mjs';

const $ = id => document.getElementById(id);
const preview = document.body.dataset.preview === 'true';
const exploration = document.body.dataset.catalog === 'exploration';
const home = document.body.dataset.home === 'true';
const detailHref = exploration ? 'places/' : 'place.html?slug=';
const PAGE_SIZE = 12;
let currentPage = 1;

const ZONES = { 'Government District': 'الحي الحكومي', 'Financial District': 'حي المال والأعمال', Other: 'المنطقة قيد التحقق' };
const KINDS = { Government: 'وزارة', Authority: 'هيئة أو جهة', Bank: 'بنك', Company: 'شركة', Building: 'مبنى', District: 'حي' };
const KIND_GLYPHS = { Government: '▥', Authority: '◈', Bank: '▤', Company: '▣', Building: '⌂', District: '⌖' };
const ROLES = { 'Administrative HQ': 'مقر إداري', 'Public Service Point': 'نقطة خدمة للجمهور', Facility: 'مبنى أو منشأة', District: 'حي', Unknown: 'صفة الموقع قيد التحقق' };
const PURPOSE_LABELS = { 'bank-branch':'فرع بنك', 'bank-atm':'ماكينة ATM', 'bank-hq':'مقر إداري لبنك', 'public-counter':'نقطة خدمة حكومية', 'admin-hq':'مقر إداري', facility:'مبنى أو منشأة' };
const PRECISIONS = {
  'District Only': 'المنطقة فقط — لا يوجد مدخل دقيق مؤكد',
  'Building Confirmed': 'المبنى مؤكد، لكن المدخل غير مثبت',
  'Floor Confirmed': 'الطابق مؤكد، والمدخل لم يتأكد بعد',
  'Entrance Confirmed': 'المدخل مؤكد',
  'Pin Verified': 'نقطة الوصول مؤكدة'
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

async function loadPlaceDetails() {
  if (!exploration || !document.body.matches('[data-page="detail"]')) return {};
  try {
    const response = await fetch('data/place-details.json', {cache:'no-store'});
    if (!response.ok) return {};
    const payload = await response.json();
    if (payload.schema_version !== '0.1' || !payload.records || Array.isArray(payload.records)) return {};
    return payload.records;
  } catch { return {}; }
}

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
  const alternatives = relaxationSuggestions(places, filters);
  if (alternatives.length) {
    const recovery = element('div', 'empty-state__recovery');
    recovery.append(element('strong', '', 'طرق لتوسيع النتائج'));
    for (const suggestion of alternatives) {
      const button = element('button', 'empty-state__recovery-button', `بدون فلتر ${suggestion.label} · ${suggestion.count} نتيجة`);
      button.type = 'button';
      button.addEventListener('click', () => {
        $(suggestion.field).value = '';
        renderDirectory(places, { resetPage: true });
      });
      recovery.append(button);
    }
    holder.append(recovery);
  }
  if (places.length && (filters.q || filters.kind || filters.zone || filters.purpose)) {
    const reset = element('button', 'reset-filters', 'مسح كل الفلاتر');
    reset.type = 'button'; reset.addEventListener('click', () => { $('q').value = ''; $('kind').value = ''; $('zone').value = ''; if ($('purpose')) $('purpose').value = ''; renderDirectory(places, { resetPage: true }); });
    holder.append(reset);
  }
  if (places.length) holder.append(link('الجهة مش موجودة؟ اقترح إضافتها بمصدر رسمي ←', 'contact.html', 'empty-state__suggest-link'));
  return holder;
}

function currentDirectoryReturnUrl() {
  return directoryReturnUrl({
    target: home ? 'index.html' : exploration ? 'directory.html' : 'approved.html',
    filters: { q: $('q')?.value, city: $('city')?.value, zone: $('zone')?.value, kind: $('kind')?.value, purpose: $('purpose')?.value, sort: $('sort')?.value, view: document.body.dataset.view },
    page: currentPage
  });
}

function placeCard(place) {
  // One place identity, two independent trust statements, one primary visitor CTA.
  // Decorative glyphs are not building photographs or verified entrance imagery.
  const kindClass = KINDS[place.kind] ? place.kind.toLowerCase() : 'other';
  const card = element('article', 'place-card place-card--' + kindClass);
  const cardHref = exploration
    ? detailHref + encodeURIComponent(place.slug) + '.html?return=' + encodeURIComponent(currentDirectoryReturnUrl())
    : detailHref + encodeURIComponent(place.slug) + '&return=' + encodeURIComponent(currentDirectoryReturnUrl());
  const identity = element('div', 'place-card__image');
  const glyph = element('span', 'place-card__glyph', KIND_GLYPHS[place.kind] || '⌖');
  glyph.setAttribute('aria-hidden', 'true');
  const identityLink = link('', cardHref, 'place-card__image-link');
  identityLink.setAttribute('aria-label', `عرض تفاصيل ${place.name_ar}`);
  identityLink.append(glyph);
  identity.append(identityLink);
  const identityLabel = element('span', 'image-badge', labelKind(place.kind));
  identity.append(identityLabel);

  const body = element('div', 'place-card__body');
  const location = element('div', 'place-card__location');
  location.append(element('span', 'place-card__eyebrow', labelZone(place.zone)));
  const purpose = placePurpose(place);
  location.append(element('span', 'place-card__purpose', PURPOSE_LABELS[purpose] || labelRole(place.role)));

  const title = element('h3');
  title.append(link(place.name_ar, cardHref));
  const address = element('div', 'place-card__address-box');
  address.append(element('span', 'place-card__field-label', 'العنوان المسجّل'));
  address.append(element('p', 'place-card__address', place.address || 'العنوان غير مؤكد'));
  address.append(element('span', 'place-card__precision', PRECISIONS[place.address_precision] || 'دقة الموقع غير محددة'));

  const status = element('div', 'place-card__status');
  status.setAttribute('aria-label', 'حالة البيانات واستقبال الزوار');
  const stateClass = place.verification === 'Published' ? 'approved' : place.verification === 'Research' ? 'research' : 'source';
  status.append(element('span', 'source-status source-status--' + stateClass, sourceStatusLabel(place)));
  const visitClass = place.public_access === 'By Appointment' ? 'appointment' : place.public_access === 'Walk-in Confirmed' ? 'walkin' : 'unknown';
  status.append(element('span', 'visit-status visit-status--' + visitClass, visitStatusLabel(place)));

  const footer = element('div', 'place-card__meta');
  footer.append(element('span', 'place-card__checked', `مراجعة المصدر: ${place.last_checked || 'غير محددة'}`));
  const action = link('عرض التفاصيل وشروط الزيارة ←', cardHref, 'place-card__action');
  action.setAttribute('aria-label', `عرض تفاصيل ${place.name_ar} وشروط الزيارة`);
  footer.append(action);

  body.append(location, title, address, status);
  if (exploration && place.verification === 'Research')
    body.append(element('p', 'place-card__verification-note', 'سجل بحثي غير معتمد؛ لا تعتمد على العنوان للزيارة.'));
  body.append(footer);
  card.append(identity, body);
  return card;
}

function renderActiveFilters(places, filters) {
  const holder = $('activeFilters');
  if (!holder) return;
  holder.replaceChildren();
  const active = [
    ['q', filters.q.trim() ? `بحث: ${filters.q.trim()}` : ''],
    ['zone', filters.zone ? labelZone(filters.zone) : ''],
    ['kind', filters.kind ? labelKind(filters.kind) : ''],
    ['purpose', filters.purpose ? PURPOSE_LABELS[filters.purpose] : '']
  ].filter(([, label]) => label);
  holder.hidden = !active.length;
  if (!active.length) return;
  holder.append(element('span', 'active-filters__label', 'بحثك الحالي'));
  for (const [field, label] of active) {
    const button = element('button', 'active-filters__chip', label);
    button.type = 'button';
    button.setAttribute('aria-label', `إزالة فلتر ${label}`);
    button.append(element('span', 'active-filters__remove', '×'));
    button.addEventListener('click', () => {
      $(field).value = '';
      renderDirectory(places, { resetPage: true });
    });
    holder.append(button);
  }
  if (active.length > 1) {
    const reset = element('button', 'active-filters__clear', 'مسح الكل');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      for (const field of ['q', 'zone', 'kind', 'purpose']) if ($(field)) $(field).value = '';
      renderDirectory(places, { resetPage: true });
    });
    holder.append(reset);
  }
}

function renderFacets(places, filters) {
  if (!$('districtShortcuts')) return;
  const zones = facetCounts(places, filters, 'zone');
  const kinds = facetCounts(places, filters, 'kind');
  const purposes = $('purpose') ? facetCounts(places, filters, 'purpose') : null;

  for (const [field, counts] of [['zone', zones], ['kind', kinds]]) {
    for (const option of $(field).options) {
      // Preserve the human label when counts change on every search keystroke.
      if (!option.dataset.label) option.dataset.label = option.textContent;
      option.textContent = `${option.dataset.label} (${counts[option.value] || 0})`;
    }
  }
  if (purposes) {
    for (const option of $('purpose').options) {
      if (!option.dataset.label) option.dataset.label = option.textContent;
      option.textContent = `${option.dataset.label} (${purposes[option.value] || 0})`;
    }
  }
  document.querySelectorAll('.sidebar-categories [data-kind]').forEach(button => {
    let count = button.querySelector('.category-chip__count');
    if (!count) {
      count = element('span', 'category-chip__count');
      button.append(count);
    }
    count.textContent = String(kinds[button.dataset.kind] || 0);
  });

  const shortcuts = $('districtShortcuts');
  shortcuts.replaceChildren(element('span', 'district-shortcuts__label', 'تصفح حسب المنطقة'));
  for (const zone of ['', 'Government District', 'Financial District', 'Other']) {
    const selected = filters.zone === zone;
    const button = element('button', 'district-shortcuts__button' + (selected ? ' is-active' : ''));
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected));
    button.append(element('span', '', zone ? labelZone(zone) : 'كل المناطق'));
    button.append(element('strong', 'district-shortcuts__count', String(zones[zone] || 0)));
    button.addEventListener('click', () => {
      $('zone').value = zone;
      renderDirectory(places, { resetPage: true });
    });
    shortcuts.append(button);
  }
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
  const addPageButton = (label, target, className = '', { edge = false } = {}) => {
    const button = element('button', 'pagination__button ' + className, label);
    button.type = 'button';
    button.setAttribute('aria-label', edge ? label : target === pageData.page ? `الصفحة ${target} الحالية` : `انتقل إلى الصفحة ${target}`);
    if (!edge && target === pageData.page) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      currentPage = target;
      renderDirectory(places);
      document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    controls.append(button);
    return button;
  };
  const prev = addPageButton('السابق', Math.max(1, pageData.page - 1), 'pagination__button--edge', { edge: true });
  prev.disabled = pageData.page === 1;
  const pages = [...new Set([1, pageData.pages, pageData.page - 1, pageData.page, pageData.page + 1]
    .filter(page => page >= 1 && page <= pageData.pages))].sort((a, b) => a - b);
  pages.forEach((page, i) => {
    if (i && page > pages[i - 1] + 1) controls.append(element('span', 'pagination__ellipsis', '…'));
    addPageButton(String(page), page, page === pageData.page ? 'is-active' : '');
  });
  const next = addPageButton('التالي', Math.min(pageData.pages, pageData.page + 1), 'pagination__button--edge', { edge: true });
  next.disabled = pageData.page === pageData.pages;
  holder.append(controls);
}

function renderDirectory(places, { resetPage = false } = {}) {
  if (resetPage) currentPage = 1;
  const filters = { q: $('q').value, city: $('city')?.value || '', kind: $('kind').value, zone: $('zone').value, purpose: $('purpose')?.value || '', sort: $('sort').value, view: document.body.dataset.view || 'grid' };
  const results = filterPlaces(places, filters);
  const pageData = paginatePlaces(results, currentPage, PAGE_SIZE);
  currentPage = pageData.page;
  setText('count', String(results.length), '0');
  setText('filterResultCount', String(results.length), '0');
  setText('activeCityLabel', 'العاصمة الإدارية الجديدة — سجلات هذه المدينة فقط');
  setText('resultsDescription', home ? `سجلًا في الدليل — نعرض ${Math.min(results.length, 6)} نماذج منها` : exploration ? 'نتيجة استكشافية — حالات المصدر والزيارة منفصلة' : preview ? 'نتيجة للمعاينة الداخلية، غير معتمدة للنشر' : 'مكان معتمد للنشر');
  const target = $('cards'); target.replaceChildren();
  target.setAttribute('aria-label', results.length ? 'نتائج دليل الجهات' : 'لا توجد نتائج مطابقة');
  target.classList.toggle('is-sparse', pageData.items.length === 1);
  if (!results.length) target.append(emptyState(places, filters));
  else (home ? results.slice(0, 6) : pageData.items).forEach(place => target.append(placeCard(place)));
  if (!home) renderPagination(pageData, places);
  renderActiveFilters(places, filters);
  renderFacets(places, filters);
  syncChips(); syncViews();
  const url = new URL(location.href);
  for (const field of ['q', 'city', 'kind', 'zone', 'purpose', 'sort', 'view']) {
    if (filters[field] && !(field === 'sort' && filters.sort === 'relevance')) url.searchParams.set(field, filters[field]);
    else url.searchParams.delete(field);
  }
  if (filters.view === 'grid') url.searchParams.delete('view');
  if (!home && currentPage > 1) url.searchParams.set('page', String(currentPage));
  else url.searchParams.delete('page');
  history.replaceState(null, '', url);
}

function setupSearchSuggestions(places) {
  const input = $('q');
  if (!input) return;
  // Native datalist ensures Arrow keys / Enter work without replacing keyboard
  // behavior, focus management or adding a third-party autocomplete API.
  const options = document.createElement('datalist');
  options.id = 'placeSearchSuggestions';
  input.setAttribute('list', options.id);
  input.setAttribute('aria-describedby', 'searchSuggestionHint');
  input.setAttribute('autocomplete', 'off');
  const hint = element('span', 'search-suggestion-hint', 'اكتب حرفين لعرض أسماء من الدليل. الاقتراح لا يعني أن الزيارة مؤكدة.');
  hint.id = 'searchSuggestionHint';
  input.insertAdjacentElement('afterend', hint);
  input.insertAdjacentElement('afterend', options);
  const refresh = () => {
    const candidates = searchSuggestions(places, {
      q: input.value,
      zone: $('zone')?.value || '',
      kind: $('kind')?.value || ''
    });
    options.replaceChildren(...candidates.map(name => {
      const option = document.createElement('option');
      option.value = name;
      return option;
    }));
  };
  input.addEventListener('input', refresh);
  input.addEventListener('focus', refresh);
  $('zone')?.addEventListener('change', refresh);
  $('kind')?.addEventListener('change', refresh);
  refresh();
}

function setupDirectory(places) {
  const fullDirectoryUrl = () => directoryReturnUrl({
    target: 'directory.html',
    filters: { q: $('q').value, city: $('city')?.value || '', kind: $('kind').value, zone: $('zone').value, purpose: $('purpose')?.value || '', sort: $('sort').value, view: document.body.dataset.view }
  });
  const params = new URLSearchParams(location.search);
  for (const field of ['q', 'city', 'kind', 'zone', 'purpose', 'sort']) {
    const value = params.get(field);
    if (!$(field)) continue;
    if (value && ($(field).tagName === 'INPUT' || [...$(field).options].some(o => o.value === value))) $(field).value = value;
  }
  if (params.get('view') === 'list') document.body.dataset.view = 'list';
  if (!home) currentPage = Number(params.get('page')) || 1;
  $('searchForm').addEventListener('submit', event => {
    event.preventDefault();
    const filters = {q:$('q').value,zone:$('zone').value,kind:$('kind').value,purpose:$('purpose')?.value || '',city:$('city')?.value || ''};
    const count = filterPlaces(places, filters).length;
    const context=home?'home':exploration?'directory':'approved';
    emitMeasurement('search_submitted',{context,resultCount:count,filterCount:[filters.q,filters.zone,filters.kind,filters.purpose].filter(Boolean).length});
    if (!count) emitMeasurement('no_results',{context,resultCount:0});
    if (home) { location.assign(fullDirectoryUrl()); return; }
    renderDirectory(places, { resetPage: true });
    const region=document.querySelector('.catalog-results');
    if(region) {region.setAttribute('tabindex','-1');region.focus({preventScroll:true});region.scrollIntoView({behavior:'smooth',block:'start'});}
  });
  for (const field of ['q', 'city', 'kind', 'zone', 'purpose', 'sort']) if ($(field)) $(field).addEventListener(field === 'q' ? 'input' : 'change', () => {
    if(field !== 'q') emitMeasurement('filter_changed',{context:home?'home':exploration?'directory':'approved'});
    renderDirectory(places, { resetPage: true });
  });
  document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => { $('kind').value = button.dataset.kind; if (home) { location.assign(fullDirectoryUrl()); return; } renderDirectory(places, { resetPage: true }); document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth' }); }));
  document.querySelectorAll('[data-zone-link]').forEach(a => a.addEventListener('click', event => { $('zone').value = a.dataset.zoneLink; $('kind').value = ''; $('q').value = ''; if (home) { event.preventDefault(); location.assign(fullDirectoryUrl()); return; } renderDirectory(places, { resetPage: true }); }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { document.body.dataset.view = button.dataset.view; renderDirectory(places); }));
  // Listen for user actions, not page impressions, search keystrokes or raw queries.
  $('cards')?.addEventListener('click', event => {
    if(event.target.closest('a[href*="place.html?slug="], a[href^="places/"]'))
      emitMeasurement('place_opened',{context:home?'home':exploration?'directory':'approved'});
  });
  setupSearchSuggestions(places);
  setText('exploreEntryCount', String(places.length), '0');
  setText('sampleDirectoryCount', String(places.length), '0');
  renderDirectory(places);
}

function setupDetail(places, detailRecords = {}) {
  const routeParts = location.pathname.split('/');
  const routeName = routeParts[2]?.endsWith('.html') ? routeParts[2].slice(0,-5) : (routeParts[2] || '');
  const pathSlug = routeParts.length === 3 && routeParts[1] === 'places' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routeName) ? routeName : '';
  const slug = new URLSearchParams(location.search).get('slug') || pathSlug;
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
  const requestedReturn = new URLSearchParams(location.search).get('return');
  const returnHref = safeDirectoryReturnUrl(requestedReturn, { exploration });
  document.querySelectorAll('.back-link, .breadcrumbs a[href="directory.html"], .site-header .header-action')
    .forEach(anchor => { anchor.href = returnHref; });
  const back = document.querySelector('.back-link');
  if (back) back.textContent = returnHref.includes('?') || returnHref.startsWith('index.html')
    ? '← رجوع إلى نتائج بحثك' : '← رجوع إلى الدليل';
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
  const heroArt = $('detailHeroArt');
  if (heroArt) heroArt.dataset.kind = KINDS[place.kind] ? place.kind.toLowerCase() : 'other';
  setText('detailHeroGlyph', KIND_GLYPHS[place.kind] || '⌖');
  setText('detailHeroKind', labelKind(place.kind));
  const serviceOnSite = place.service_availability === 'On-site Confirmed';
  const serviceElsewhere = place.service_availability === 'Other Location';
  const serviceKnown = Boolean(place.service_type?.trim()) && !serviceElsewhere;
  const serviceStatus = serviceElsewhere
    ? 'الخدمة أو النشاط مرتبط بموقع آخر — لا تعتمد على هذا العنوان'
    : serviceOnSite ? 'خدمة أو نقطة عمل مذكورة لهذا الموقع — التشغيل الحالي يحتاج تأكيدًا'
    : serviceKnown ? 'معلومة خدمة مسجلة — وجودها حضوريًا غير مثبت'
      : 'لا توجد خدمة استقبال جمهور محددة مثبتة';
  setText('serviceReadiness', serviceStatus);
  if ($('serviceReadiness')) $('serviceReadiness').dataset.mode = serviceOnSite ? 'caution' : 'unknown';
  setText('serviceDecision', serviceStatus + '. المصدر لا يثبت وحده أن المكتب مفتوح أو أن الدخول مسموح.');
  if ($('serviceDecision')) $('serviceDecision').dataset.mode = serviceElsewhere ? 'warning' : 'caution';
  setText('serviceChannel', serviceElsewhere
    ? 'الخدمة أو النشاط في موقع آخر؛ راجع المصدر'
    : serviceOnSite ? 'موقع مرتبط بالخدمة في السجل؛ راجع التشغيل والاستقبال'
      : 'غير محددة — استعلم عن القناة الرسمية (حضوري أو إلكتروني)');
  setText('addressReadiness', PRECISIONS[place.address_precision] || 'درجة دقة العنوان غير محددة');
  setText('entranceDecision', place.verified_entrance && ['Entrance Confirmed','Pin Verified'].includes(place.address_precision)
    ? 'نقطة وصول مسجلة كمؤكدة؛ راجع شروط الدخول'
    : 'مدخل الزوار لم يتم توثيقه بعد');
  setText('contactScope', place.phone || place.email || place.website
    ? 'وسائل التواصل مدرجة على مستوى سجل الجهة؛ تأكد أنها تخص المكتب أو الفرع والخدمة المطلوبة.'
    : 'لم تُسجل قناة تواصل مؤكدة لهذا المكتب. راجع المصدر الرسمي للجهة.');
  setText('visitorReadiness', visitStatusLabel(place));
  if ($('visitorReadiness')) $('visitorReadiness').dataset.mode = place.public_access === 'Walk-in Confirmed' ? 'walkin' : place.public_access === 'By Appointment' ? 'appointment' : 'unknown';
  const navigation = navigationDecision(place, { exploration });
  document.querySelector('.maps-card')?.addEventListener('click', event => {
    if(event.target.closest('a[href^="https://www.google.com/maps/"]'))
      emitMeasurement('maps_action',{context:'place',action:navigation.mode});
  });
  setText('navigationReadiness', navigation.status);
  if ($('navigationReadiness')) $('navigationReadiness').dataset.mode = navigation.mode;
  setText('mapStatus', navigation.status);
  if ($('mapStatus')) $('mapStatus').dataset.mode = navigation.mode;
  setText('address', place.address); setText('precision', PRECISIONS[place.address_precision] || 'غير محدد');
  setText('role', labelKind(place.kind) + ' — ' + labelRole(place.role));
  setText('service', place.service_type, 'لا توجد خدمة حضورية محددة مثبتة');
  setText('visitorHours', place.visitor_hours, place.public_access === 'By Appointment'
    ? 'الزيارة بموعد مسبق — لا توجد ساعات استقبال مفتوحة معلنة'
    : 'غير مؤكدة — لا تعتمد على مواعيد العمل الإداري');
  setText('officeHours', place.office_hours, 'غير منشورة بمصدر واضح');
  setText('checked', place.last_checked);
  const extraFacts = $('extraFacts');
  if (extraFacts) {
    const values = [
      ['الاسم بالإنجليزية', place.name_en],
      ['أسماء أخرى', Array.isArray(place.aliases) ? place.aliases.join('، ') : ''],
      ['الحي / المنطقة', labelZone(place.zone)],
      ['رمز المبنى', place.building_code],
      ['فئة المصدر', place.source_category],
      ['حالة الاعتماد المعلوماتي', sourceStatusLabel(place)],
      ['معرّف السجل', place.id]
    ];
    const detail = detailRecords[place.id] || {};
    const additional = [
      ['التصنيف التفصيلي', detail.entity_subtype],
      ['الدور / رقم المكتب', detail.floor_suite],
      ['رمز الوحدة', detail.unit_code],
      ['النطاق التفصيلي', detail.neighborhood],
      ['صندوق البريد', detail.po_box],
      ['الرمز البريدي', detail.postal_code],
      ['مصدر رقم التواصل', detail.contact_attribution],
      ['حالة التشغيل المسجلة (ليست تأكيدًا لحظيًا)', detail.operational_status],
      ['ساعات الخط الساخن (ليست ساعات استقبال)', detail.hotline_hours],
      ['حدود ما يثبته المصدر', detail.evidence_scope],
      ['نوع دليل المستأجر', detail.tenant_evidence_class],
      ['نوع دليل الخريطة (ليس بالضرورة مدخلًا)', detail.map_evidence_class],
      ['تاريخ مراجعة البيانات المقبل', detail.next_review],
      ['رمز الجهة', detail.entity_code],
      ['ترخيص استخدام المصدر', detail.source_license],
      ['طريقة التحقق من المصدر', detail.verification_method],
      ['دليل الربط بالمبنى أو الوحدة (لا يثبت الدخول)', detail.relation_evidence]
    ];
    if (additional.some(([,v]) => typeof v === 'string' && v.trim())) {
      values.push(['بيانات إضافية قيد المراجعة', 'الحقول التالية مبنية على الأدلة المتاحة ولا تؤكد التشغيل أو السماح بالدخول']);
      values.push(...additional);
    }
    for (const [label, value] of values) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const row = element('div');
      row.append(element('dt', '', label), element('dd', '', value));
      extraFacts.append(row);
    }
    if (!extraFacts.children.length) $('recordFacts')?.setAttribute('hidden', '');
  }

  setText('accessNotice', exploration && place.verification === 'Research'
    ? 'هذا سجل بحثي أولي، ولم يتم اعتماد الموقع أو إمكانية الزيارة. لا تستخدم العنوان للتنقل.'
    : place.public_access === 'Unknown'
    ? 'تنبيه قبل الزيارة: دخول الجمهور ومدخل الزوار لم يتم تأكيدهما. اتصل بالجهة قبل التحرك.'
    : place.public_access === 'By Appointment'
      ? 'الزيارة بموعد مسبق للخدمة المحددة. تواصل مع الجهة لتأكيد موعدك ومدخل الزوار قبل التحرك.'
      : 'راجع شروط الزيارة وطريقة الوصول مع الجهة قبل التحرك.');
  const curatedBuilding = place.kind === 'Building' ? buildingGroup(places, place.id) : buildingForPlace(places, place.id);
  const buildingRelationshipUrl = curatedBuilding && 'buildings.html?id=' + encodeURIComponent(curatedBuilding.buildingId);
  const quickActions = $('quickActions');
  if (quickActions) {
    if (place.phone) quickActions.append(link('اتصل بالجهة قبل الزيارة', 'tel:' + place.phone.replace(/[^\d+]/g, ''), 'detail-quick-actions__primary'));
    else if (place.website) quickActions.append(link('راجع الموقع الرسمي للجهة', place.website, 'detail-quick-actions__primary'));
    if (buildingRelationshipUrl) quickActions.append(link(
      place.kind === 'Building' ? 'الجهات المرتبطة بعنوان المبنى' : 'بيانات المبنى المرتبط بعنوان الجهة',
      buildingRelationshipUrl, 'detail-quick-actions__secondary'));
    if (navigation.href) quickActions.append(link(navigation.label, navigation.href, 'detail-quick-actions__secondary'));
    else quickActions.append(link('راجع تفاصيل العنوان', '#overview', 'detail-quick-actions__secondary'));
  }
  const contact = $('contactActions');
  if (place.phone) contact.append(link('اتصل بالجهة (قد يكون رقمًا عامًا)', 'tel:' + place.phone.replace(/[^\d+]/g, ''), 'primary'));
  if (place.email) contact.append(link('البريد الإلكتروني', 'mailto:' + encodeURIComponent(place.email)));
  if (place.website) contact.append(link(place.kind === 'Building' ? 'صفحة المشروع لدى المصدر' : 'الموقع الرسمي', place.website));
  if (!contact.children.length) contact.append(element('p', 'source-note', 'لا توجد وسيلة اتصال مؤكدة في السجل.'));
  const mapActions = $('mapActions');
  if (navigation.href) {
    mapActions.append(link(navigation.label, navigation.href, navigation.mode === 'directions' ? 'primary' : ''));
  } else {
    mapActions.append(element('p', 'source-note', navigation.reason === 'research'
      ? 'الخرائط معطّلة لهذا السجل البحثي حتى استكمال التحقق.'
      : 'لا توجد نقطة وصول أو عنوان مبنى بدقة كافية لعرضه على الخريطة.'));
  }
  setText('mapNotice', navigation.notice);
  const arrival = arrivalReadiness(place, { exploration });
  setText('arrivalLocation', arrival.location);
  setText('arrivalEntrance', arrival.verifiedEntrance
    ? 'نقطة وصول مسجلة كمؤكدة — تحقق من شروط الدخول'
    : 'لم يتم تأكيد مدخل الجمهور لهذا السجل');
  if ($('arrivalSteps')) {
    $('arrivalSteps').replaceChildren(...arrival.steps.map(step => element('li', '', step)));
  }
  const nextAction = place.public_access === 'By Appointment'
    ? 'الخطوة التالية: أكد الموعد، والخدمة المطلوبة، ومدخل الزوار مع الجهة.'
    : place.public_access === 'Walk-in Confirmed'
      ? 'الخطوة التالية: تأكد من مواعيد الخدمة والوثائق المطلوبة قبل التحرك.'
      : serviceElsewhere
        ? 'الخطوة التالية: تحقق من عنوان تقديم الخدمة الفعلي؛ هذا السجل ليس إثباتًا لنقطة خدمة هنا.'
        : 'الخطوة التالية: استعلم عن الخدمة وساعات استقبال الجمهور ومدخل الزوار قبل التحرك.';
  setText('nextStep', nextAction);
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
  if ($('title')) setupDetail(places, await loadPlaceDetails());
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
