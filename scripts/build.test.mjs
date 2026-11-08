import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizePlaces, resolveCanonicalPlace } from './catalog.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('production build cannot publish D04 preview records or preview mode', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const publicJson = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const published = JSON.parse(readFileSync(join(root, 'data/published.json'), 'utf8'));
  assert.equal(publicJson.mode, 'production');
  assert.deepEqual(publicJson.places, published.places);
  assert.ok(publicJson.places.every(place => place.verification === 'Published'));
  assert.ok(!readFileSync(join(root, 'dist/index.html'), 'utf8').includes('data-preview="true"'));
  assert.deepEqual(readdirSync(join(root, 'dist/data')), ['exploration.json', 'places.json']);
  assert.ok(!readdirSync(join(root, 'dist')).includes('prototype'));
  for (const asset of ['city-skyline.webp', 'civic-illustration.webp', 'financial-illustration.webp']) {
    assert.ok(readdirSync(join(root, 'dist/assets')).includes(asset), `${asset} is needed by the public homepage`);
  }
  const publicHome = readFileSync(join(root, 'dist/index.html'), 'utf8');
  assert.match(publicHome, /صور معمارية توضيحية وليست صورًا موثقة/);
});

test('D11 visitor pages ship with coherent navigation and noindex while launch is closed', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  for (const page of ['index', 'directory', 'place', 'about', 'contact', 'terms', 'privacy']) {
    const html = readFileSync(join(root, 'dist', `${page}.html`), 'utf8');
    assert.match(html, /<html lang="ar" dir="rtl">/, `${page}: Arabic RTL`);
    assert.match(html, /noindex,nofollow/, `${page}: not indexed without launch sign-off`);
    assert.match(html, /href="about.html"/, `${page}: about navigation`);
    assert.match(html, /href="contact.html"/, `${page}: contact navigation`);
    assert.match(html, /href="directory.html"/, `${page}: directory navigation`);
    assert.match(html, /class="mobile-nav"/, `${page}: responsive navigation`);
  }
  const catalogue = readFileSync(join(root, 'dist/directory.html'), 'utf8');
  for (const id of ['searchForm', 'q', 'kind', 'zone', 'sort', 'cards', 'count', 'pagination']) assert.match(catalogue, new RegExp(`id="${id}"`));
  assert.match(catalogue, /data-catalog="exploration"/, 'primary directory must show the full exploratory dataset');
  const home = readFileSync(join(root, 'dist/index.html'), 'utf8');
  assert.match(home, /data-home="true"/, 'homepage must expose expanded data too');
  assert.match(home, /id="exploreEntryCount"/, 'the homepage inventory count must be data-driven');
  assert.match(home, /id="sampleDirectoryCount"/, 'the sample introduction must be data-driven');
  assert.doesNotMatch(home, /64 جهة|الـ64 سجل/, 'historical counts must not be hard-coded');
  assert.match(readFileSync(join(root, 'dist/place.html'), 'utf8'), /id="visitBadge"/, 'visitor readiness must be separate from publication approval');
  assert.match(readFileSync(join(root, 'dist/contact.html'), 'utf8'), /mailto:hello@orveax.com/);
  assert.match(readFileSync(join(root, 'dist/terms.html'), 'utf8'), /زيارة/);
  assert.match(readFileSync(join(root, 'dist/privacy.html'), 'utf8'), /Google Fonts/);
  assert.deepEqual(readdirSync(join(root, 'dist/data')), ['exploration.json', 'places.json']);
});

test('D36 directory verification preserves approvals and all earlier source-backed cohorts', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const exploratory = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.equal(approved.mode, 'production');
  assert.equal(exploratory.mode, 'exploration');
  assert.equal(approved.places.length, 2);
  assert.equal(exploratory.places.length, 267);
  assert.deepEqual(exploratory.places.filter(p => p.verification === 'Published'), approved.places);
  assert.equal(exploratory.places.filter(p => p.verification === 'Research').length, 54);
  assert.equal(exploratory.places.filter(p => p.verification === 'Source Confirmed').length, 211);
  const historical = exploratory.places.filter(p => Number(p.id.slice(3)) <= 179);
  assert.equal(historical.length, 179);
  const companies = historical.filter(p => p.kind === 'Company');
  assert.equal(companies.length, 41);
  assert.equal(companies.filter(p => p.verification === 'Research').length, 12);
  assert.equal(companies.filter(p => p.role === 'Public Service Point' && p.verification === 'Source Confirmed').length, 7);
  assert.equal(companies.filter(p => p.role === 'Administrative HQ' && p.verification === 'Source Confirmed').length, 6);
  const buildings = historical.filter(p => p.kind === 'Building');
  assert.equal(buildings.length, 50);
  for (let i = 94; i <= 107; i++) {
    const building = buildings.find(p => p.id === `NC-${i}`);
    assert.ok(building, `NC-${i} persisted`);
    assert.equal(building.role, 'Facility');
    assert.equal(building.verification, 'Source Confirmed');
    assert.equal(building.public_access, 'Unknown');
    assert.equal(building.directions_url, '');
    assert.equal(building.verified_entrance, false);
    assert.ok(!['Entrance Confirmed', 'Pin Verified'].includes(building.address_precision));
  }
  const edge = companies.find(p => p.id === 'NC-80');
  assert.equal(edge.building_code, 'C5');
  assert.equal(edge.address_precision, 'Building Confirmed');
  assert.equal(edge.service_availability, 'On-site Confirmed');
  assert.equal(edge.verified_entrance, false);
  const added = exploratory.places.filter(p => Number(p.id.slice(3)) >= 108 && Number(p.id.slice(3)) <= 114);
  assert.deepEqual(added.map(p => p.id), ['NC-108', 'NC-109', 'NC-110', 'NC-111', 'NC-112', 'NC-113', 'NC-114']);
  assert.equal(added.filter(p => p.verification === 'Source Confirmed').length, 7);
  assert.equal(added.filter(p => p.verification === 'Research').length, 0);
  assert.ok(added.every(p => p.public_access === 'Unknown' && !p.verified_entrance && !p.directions_url));
  assert.ok(added.every(p => p.source_url.startsWith('https://') && ['2026-11-07', '2026-11-08'].includes(p.last_checked)));
  assert.ok(added.every(p => !p.visitor_hours), 'an official address does not imply current walk-in hours');
  assert.equal(added.find(p => p.id === 'NC-108')?.building_code, 'NI-1');
  assert.equal(added.find(p => p.id === 'NC-114')?.service_availability, 'Unknown');
  const batch22 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 115 && Number(p.id.slice(3)) <= 135);
  assert.deepEqual(batch22.map(p => p.id), Array.from({length: 21}, (_, i) => `NC-${i + 115}`));
  assert.equal(batch22.filter(p => p.verification === 'Source Confirmed').length, 17);
  assert.equal(batch22.filter(p => p.verification === 'Research').length, 4);
  assert.equal(batch22.filter(p => p.kind === 'Building').length, 8);
  assert.equal(batch22.filter(p => p.kind === 'Bank').length, 6);
  assert.equal(batch22.filter(p => p.kind === 'Authority').length, 5);
  assert.equal(batch22.filter(p => p.kind === 'Company').length, 2);
  assert.ok(batch22.every(p => p.service_availability === 'Unknown' && p.public_access === 'Unknown'));
  assert.ok(batch22.every(p => !p.verified_entrance && !p.directions_url && !p.visitor_hours));
  assert.ok(batch22.every(p => p.source_url.startsWith('https://') && ['2026-11-07', '2026-11-08'].includes(p.last_checked)));
  assert.ok(batch22.filter(p => p.verification === 'Research').every(p => p.source_category === 'Secondary News' || p.id === 'NC-117'));
  assert.equal(batch22.find(p => p.id === 'NC-121')?.source_category, 'Official Business');
  assert.equal(batch22.find(p => p.id === 'NC-123')?.verification, 'Source Confirmed', 'bank confirmed proposed branch; service is still not visitor-ready');
  const batch23 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 136 && Number(p.id.slice(3)) <= 159);
  assert.deepEqual(batch23.map(p => p.id), Array.from({length: 24}, (_, i) => `NC-${i + 136}`));
  assert.deepEqual(Object.fromEntries(['Authority', 'Bank', 'Building', 'Company'].map(kind => [kind, batch23.filter(p => p.kind === kind).length])), {Authority: 4, Bank: 3, Building: 11, Company: 6});
  assert.equal(batch23.filter(p => p.verification === 'Source Confirmed').length, 15);
  assert.equal(batch23.filter(p => p.verification === 'Research').length, 9);
  assert.ok(batch23.every(p => p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch23.every(p => !p.directions_url && !p.verified_entrance && !p.visitor_hours));
  assert.ok(batch23.every(p => p.source_url.startsWith('https://') && ['2026-11-07', '2026-11-08'].includes(p.last_checked)));
  assert.equal(batch23.find(p => p.id === 'NC-137')?.address_precision, 'Floor Confirmed', 'business-issued office and floor');
  assert.equal(batch23.find(p => p.id === 'NC-145')?.verification, 'Source Confirmed', 'NBK building project is sourced but not a live banking branch');
  assert.equal(batch23.find(p => p.id === 'NC-146')?.verification, 'Research', 'new EGX site is still a construction record');
  assert.equal(batch23.find(p => p.id === 'NC-151')?.building_code, '10B-L2M');
  assert.equal(batch23.find(p => p.id === 'NC-159')?.address_precision, 'Floor Confirmed');
  const batch24 = historical.filter(p => Number(p.id.slice(3)) >= 160);
  assert.deepEqual(batch24.map(p => p.id), Array.from({length: 20}, (_, i) => `NC-${i + 160}`));
  assert.deepEqual(Object.fromEntries(['Authority', 'Bank', 'Building', 'Company'].map(kind => [kind, batch24.filter(p => p.kind === kind).length])), {Authority: 3, Bank: 1, Building: 15, Company: 1});
  assert.equal(batch24.filter(p => p.verification === 'Source Confirmed').length, 18);
  assert.equal(batch24.filter(p => p.verification === 'Research').length, 2);
  assert.ok(batch24.every(p => p.last_checked === '2026-11-08' && p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch24.every(p => !p.visitor_hours && !p.verified_entrance && !p.directions_url));
  assert.equal(batch24.find(p => p.id === 'NC-160')?.address_precision, 'Floor Confirmed');
  assert.equal(batch24.find(p => p.id === 'NC-162')?.role, 'Public Service Point');
  assert.equal(batch24.find(p => p.id === 'NC-169')?.building_code, 'CS18');
  assert.equal(batch24.find(p => p.id === 'NC-170')?.building_code, '25B.3');
  assert.equal(batch24.find(p => p.id === 'NC-173')?.building_code, 'L1 C3A');
  const batch25 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 180 && Number(p.id.slice(3)) <= 201);
  assert.deepEqual(batch25.map(p => p.id), Array.from({length: 22}, (_, i) => `NC-${i + 180}`));
  assert.equal(batch25.filter(p => p.verification === 'Source Confirmed').length, 10);
  assert.equal(batch25.filter(p => p.verification === 'Research').length, 12);
  assert.ok(batch25.every(p => p.source_url.startsWith('https://') && p.last_checked === '2026-11-08'));
  assert.ok(batch25.every(p => p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch25.every(p => !p.visitor_hours && !p.verified_entrance && !p.directions_url));
  assert.equal(batch25.filter(p => p.slug.includes('monorail-station')).length, 2);
  assert.equal(batch25.find(p => p.id === 'NC-181')?.address_precision, 'District Only');
  assert.equal(batch25.find(p => p.id === 'NC-184')?.kind, 'Bank');
  assert.equal(batch25.find(p => p.id === 'NC-187')?.address_precision, 'Floor Confirmed');
  const batch26 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 202 && Number(p.id.slice(3)) <= 223);
  assert.deepEqual(batch26.map(p => p.id), Array.from({length: 22}, (_, i) => `NC-${202 + i}`));
  assert.equal(batch26.filter(p => p.verification === 'Source Confirmed').length, 13);
  assert.equal(batch26.filter(p => p.verification === 'Research').length, 9);
  assert.deepEqual(Object.fromEntries(['Authority', 'Bank', 'Building', 'Company'].map(kind => [kind, batch26.filter(p => p.kind === kind).length])), {Authority: 2, Bank: 9, Building: 6, Company: 5});
  assert.ok(batch26.every(p => p.last_checked === '2026-11-08'));
  assert.ok(batch26.every(p => p.public_access === 'Unknown' && (p.id === 'NC-202' ? p.service_availability === 'On-site Confirmed' : p.service_availability === 'Unknown')));
  assert.ok(batch26.every(p => !p.visitor_hours && !p.directions_url && !p.verified_entrance));
  assert.ok(batch26.every(p => p.source_url.startsWith('https://')));
  assert.ok(batch26.filter(p => Number(p.id.slice(3)) >= 215).every(p => p.verification === 'Research'));
  assert.equal(batch26.find(p => p.id === 'NC-203')?.address_precision, 'Floor Confirmed');
  assert.equal(batch26.find(p => p.id === 'NC-207')?.building_code, 'CS06');
  assert.equal(batch26.find(p => p.id === 'NC-208')?.building_code, 'CS-26');
  assert.equal(batch26.find(p => p.id === 'NC-220')?.address_precision, 'Building Confirmed');
  const batch27 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 224 && Number(p.id.slice(3)) <= 238);
  assert.deepEqual(batch27.map(p => p.id), Array.from({length: 15}, (_, i) => `NC-${224 + i}`));
  assert.equal(batch27.filter(p => p.verification === 'Source Confirmed').length, 8);
  assert.equal(batch27.filter(p => p.verification === 'Research').length, 7);
  assert.equal(batch27.filter(p => p.kind === 'Company').length, 2);
  assert.equal(batch27.filter(p => p.kind === 'Building').length, 13);
  assert.ok(batch27.every(p => p.last_checked === '2026-11-08'));
  assert.ok(batch27.every(p => p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch27.every(p => p.address_precision !== 'Pin Verified' && p.address_precision !== 'Entrance Confirmed'));
  assert.ok(batch27.every(p => !p.visitor_hours && !p.directions_url && !p.verified_entrance));
  assert.ok(batch27.every(p => p.source_url.startsWith('https://')));
  assert.equal(batch27.find(p => p.id === 'NC-224')?.building_code, '25-B3');
  assert.equal(batch27.find(p => p.id === 'NC-232')?.verification, 'Research', 'Laval district conflict remains unresolved');
  assert.equal(batch27.find(p => p.id === 'NC-238')?.verification, 'Research', 'Paragon 3 district conflict remains unresolved');
  const batch28 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 239 && Number(p.id.slice(3)) <= 245);
  assert.deepEqual(batch28.map(p => p.id), Array.from({length: 7}, (_, i) => `NC-${239 + i}`));
  assert.equal(batch28.filter(p => p.verification === 'Source Confirmed').length, 6);
  assert.equal(batch28.filter(p => p.verification === 'Research').length, 1);
  assert.equal(batch28.filter(p => p.kind === 'Company').length, 2);
  assert.equal(batch28.filter(p => p.kind === 'Authority').length, 5);
  assert.equal(batch28.filter(p => p.role === 'Public Service Point').length, 4);
  assert.ok(batch28.every(p => p.last_checked === '2026-11-08'));
  assert.ok(batch28.filter(p => p.id !== 'NC-241').every(p => p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch28.every(p => !p.visitor_hours && !p.directions_url && !p.verified_entrance));
  assert.ok(batch28.every(p => p.source_url.startsWith('https://')));
  assert.ok(batch28.every(p => ['Building Confirmed', 'Floor Confirmed'].includes(p.address_precision)));
  assert.equal(batch28.find(p => p.id === 'NC-239')?.building_code, 'Audaz unit A2-23');
  assert.equal(batch28.find(p => p.id === 'NC-240')?.building_code, 'B3-11 / B4-01 / B4-23');
  assert.equal(batch28.find(p => p.id === 'NC-243')?.phone, '0220542140');
  assert.equal(batch28.find(p => p.id === 'NC-245')?.verification, 'Research');
  assert.equal(new Set(exploratory.places.map(p => p.slug)).size, exploratory.places.length);
  assert.equal(new Set(exploratory.places.map(p => p.id)).size, exploratory.places.length);
  for (const id of ['NC-188', 'NC-189']) {
    assert.match(batch25.find(p => p.id === id)?.service_type ?? '', /تاريخي/);
  }
  assert.equal(historical.find(p => p.id === 'NC-35')?.verification, 'Source Confirmed');
  assert.equal(historical.find(p => p.id === 'NC-157')?.verification, 'Source Confirmed');
  for (const id of ['NC-74', 'NC-75', 'NC-76']) {
    assert.equal(companies.find(p => p.id === id)?.verification, 'Source Confirmed', `${id}: official company claim`);
  }
  for (const id of ['NC-77', 'NC-78']) {
    const candidate = companies.find(p => p.id === id);
    assert.equal(candidate?.verification, 'Research', `${id}: unresolved office status`);
    assert.equal(candidate?.address_precision, 'District Only');
    assert.equal(candidate?.directions_url, '');
  }
  for (let i = 79; i <= 93; i++) {
    const candidate = companies.find(p => p.id === `NC-${i}`);
    assert.ok(candidate, `NC-${i}: persisted D18 record`);
    assert.equal(candidate.directions_url, '', `NC-${i}: no unverified routing`);
    assert.equal(candidate.verified_entrance, false, `NC-${i}: no assumed entrance`);
    assert.equal(candidate.visitor_hours, '', `NC-${i}: no invented opening hours`);
  }
  assert.ok(companies.filter(p => p.verification === 'Research').every(p => !['Entrance Confirmed', 'Pin Verified'].includes(p.address_precision)));
  assert.ok(exploratory.places.every(p => !p.directions_url && !p.verified_entrance));
  assert.ok(exploratory.places.every(p => !['Notes', 'Change Reason', 'Evidence Scope', 'Coordinates'].some(key => key in p)));
  for (const name of ['directory.html', 'explore.html', 'explore-place.html']) {
    const html = readFileSync(join(root, 'dist', name), 'utf8');
    assert.match(html, /data-catalog="exploration"/);
    assert.match(html, /noindex,nofollow/);
    assert.doesNotMatch(html, /بيانات معتمدة مع تنبيهات واضحة قبل الزيارة/);
  }
  const approvedHtml = readFileSync(join(root, 'dist/approved.html'), 'utf8');
  assert.doesNotMatch(approvedHtml, /data-catalog="exploration"/);
  assert.match(approvedHtml, /عرض جميع سجلات الدليل/);
  assert.match(readFileSync(join(root, 'dist/index.html'), 'utf8'), /href="directory.html"/);
  assert.match(readFileSync(join(root, 'dist/directory.html'), 'utf8'), /data-kind="Building"/);
  assert.match(readFileSync(join(root, 'dist/index.html'), 'utf8'), /data-kind="Building"/);
  assert.ok(!readdirSync(join(root, 'dist')).includes('prototype'));
});

test('D29 evidence-based visitor enrichment remains service-specific and does not enable unverified navigation', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const byId = id => places.find(p => p.id === id);
  const qiz = byId('NC-241');
  assert.equal(qiz.address_precision, 'Floor Confirmed');
  assert.match(qiz.address, /5140/);
  assert.match(qiz.address, /مدخل الزائرين/);
  assert.equal(qiz.public_access, 'By Appointment');
  assert.equal(qiz.service_availability, 'On-site Confirmed');
  assert.match(qiz.service_type, /info@qizegypt\.gov\.eg/);
  assert.equal(qiz.visitor_hours, '', 'certificate-renewal instructions have no general public hours');
  assert.equal(qiz.verified_entrance, false, 'a named visitors gate is not a geocoded entrance');
  assert.equal(qiz.directions_url, '', 'never create directions without a verified arrival pin');

  const ltra = byId('NC-243');
  assert.match(ltra.office_hours, /09:00–14:30/);
  assert.equal(ltra.visitor_hours, '', 'a unit working schedule is not public reception hours');
  assert.equal(ltra.public_access, 'Unknown');
  assert.equal(ltra.service_availability, 'Unknown');

  assert.equal(byId('NC-52').phone, '0220541838');
  assert.equal(byId('NC-52').public_access, 'Unknown');
  assert.match(byId('NC-112').office_hours, /ليست ساعات استقبال/);
  assert.equal(byId('NC-112').visitor_hours, '');
  assert.equal(byId('NC-245').verification, 'Research', 'UDF official current reception still uncorroborated');
  assert.equal(byId('NC-60').address_precision, 'District Only', 'EBank branch parcel remains unknown');
  assert.ok(places.every(p => !p.directions_url && !p.verified_entrance));
  assert.match(readFileSync(join(root, 'scripts/app.mjs'), 'utf8'), /تواصل مع الجهة لتأكيد موعدك/);
});

test('D30 direct-confirmation queue never masquerades as completed outreach or a verified entrance', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const byId = id => places.find(p => p.id === id);
  const {items, stage} = JSON.parse(readFileSync(join(root, 'data/direct-verification.json'), 'utf8'));
  assert.equal(stage, 'D30');
  assert.deepEqual(items.map(i => i.entity_code), ['NC-241', 'NC-243', 'NC-245', 'NC-60']);
  assert.ok(items.every(i => i.outreach_status === 'Not Contacted' && i.verified_outcome === null));
  assert.ok(items.every(i => i.attempts.length === 0 && i.questions_ar.length >= 3));
  assert.equal(byId('NC-241').email, 'info@qizegypt.gov.eg', 'certificate collection has a separate contact from quarterly review');
  assert.equal(byId('NC-60').phone, '16710');
  assert.equal(byId('NC-60').verification, 'Source Confirmed', 'the bank directly announced the branch opened; exact address remains unknown');
  assert.equal(byId('NC-245').verification, 'Research');
  assert.ok(places.every(p => !p.directions_url && !p.verified_entrance));
});

test('D31 official expansion adds four non-duplicate entities without fabricated outreach or directions', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const batch = places.filter(p => Number(p.id.slice(3)) >= 246 && Number(p.id.slice(3)) <= 249);
  assert.deepEqual(batch.map(p => p.id), ['NC-246', 'NC-247', 'NC-248', 'NC-249']);
  assert.equal(batch.filter(p => p.kind === 'Company').length, 3);
  assert.equal(batch.filter(p => p.kind === 'Authority').length, 1);
  assert.ok(batch.every(p => p.verification === 'Source Confirmed' && p.source_category === 'Official Authority'));
  assert.ok(batch.every(p => p.service_availability === 'Unknown' && p.public_access === 'Unknown'));
  assert.ok(batch.every(p => p.visitor_hours === '' && p.office_hours === '' && p.directions_url === '' && !p.verified_entrance));
  assert.ok(batch.every(p => p.last_checked === '2026-11-08' && p.source_url.startsWith('https://')));
  assert.equal(batch.find(p => p.id === 'NC-246').zone, 'Government District');
  assert.match(batch.find(p => p.id === 'NC-247').address, /A2-18/);
  assert.match(batch.find(p => p.id === 'NC-248').address, /GR-03/);
  assert.match(batch.find(p => p.id === 'NC-249').service_type, /0220532546/);
  const byId = id => places.find(p => p.id === id);
  assert.equal(byId('NC-52').email, 'info@ldp.gov.eg');
  assert.equal(byId('NC-61').email, 'info@customs.gov.eg');
  assert.match(byId('NC-61').service_type, /15460/);
  const queue = JSON.parse(readFileSync(join(root, 'data/direct-verification.json'), 'utf8'));
  assert.ok(queue.items.every(item => item.outreach_status === 'Not Contacted' && item.attempts.length === 0));
});

test('D32 primary-source expansion and ministerial reconciliations have no invented visitor details', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const batch = places.filter(p => Number(p.id.slice(3)) >= 250 && Number(p.id.slice(3)) <= 257);
  assert.deepEqual(batch.map(p => p.id), Array.from({length: 8}, (_, i) => `NC-${250 + i}`));
  assert.equal(batch.filter(p => p.kind === 'Company').length, 5);
  assert.equal(batch.filter(p => p.kind === 'Authority').length, 2);
  assert.equal(batch.filter(p => p.kind === 'Building').length, 1);
  assert.ok(batch.every(p => p.verification === 'Source Confirmed'));
  assert.ok(batch.every(p => p.service_availability === 'Unknown' && p.public_access === 'Unknown'));
  assert.ok(batch.every(p => !p.visitor_hours && !p.office_hours && !p.directions_url && !p.verified_entrance));
  assert.ok(batch.every(p => p.source_url.startsWith('https://') && p.last_checked === '2026-11-08'));
  assert.match(batch.find(p => p.id === 'NC-251').address, /سلاسل/);
  assert.match(batch.find(p => p.id === 'NC-252').building_code, /B1-26/);
  assert.match(batch.find(p => p.id === 'NC-256').service_type, /4703/);
  assert.equal(batch.find(p => p.id === 'NC-257').email, 'edasys@mift.gov.eg');
  for (const id of ['NC-22', 'NC-27', 'NC-28', 'NC-29', 'NC-31']) {
    const entity = places.find(p => p.id === id);
    assert.equal(entity.zone, 'Government District');
    assert.equal(entity.verification, 'Source Confirmed');
    assert.equal(entity.role, 'Administrative HQ');
    assert.ok(entity.source_url.startsWith('https://'));
    assert.ok(!entity.visitor_hours && !entity.directions_url && !entity.verified_entrance);
  }
});

test('D33 confirms 20 narrow source claims and adds exactly one unique authority without enabling visits', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const ids = ['NC-19', 'NC-23', 'NC-24', 'NC-30', 'NC-33', 'NC-58', 'NC-63', 'NC-68', 'NC-69', 'NC-70', 'NC-71', 'NC-72', 'NC-73', 'NC-84', 'NC-85', 'NC-86', 'NC-87', 'NC-114', 'NC-117', 'NC-145'];
  for (const id of ids) {
    const place = places.find(p => p.id === id);
    assert.ok(place, `${id}: still present`);
    assert.equal(place.verification, 'Source Confirmed', `${id}: official-source fact reconciled`);
    assert.equal(place.last_checked, '2026-11-08');
    assert.equal(place.public_access, 'Unknown');
    assert.equal(place.visitor_hours, '');
    assert.equal(place.directions_url, '');
    assert.equal(place.verified_entrance, false);
    assert.ok(place.source_url.startsWith('https://'));
  }
  const added = places.filter(p => Number(p.id.slice(3)) === 258);
  assert.equal(added.length, 1);
  assert.equal(added[0].id, 'NC-258');
  assert.equal(added[0].kind, 'Authority');
  assert.equal(added[0].zone, 'Government District');
  assert.equal(added[0].address_precision, 'Building Confirmed');
  assert.match(added[0].name_ar, /صندوق حماية البيئة/);
  assert.equal(added[0].email, 'epf@moenv.gov.eg');
  assert.equal(added[0].verification, 'Source Confirmed');
  assert.equal(added[0].service_availability, 'Unknown');
  assert.equal(added[0].public_access, 'Unknown');
  assert.equal(added[0].visitor_hours, '');
  assert.equal(added[0].office_hours, '');
  assert.equal(added[0].directions_url, '');
  assert.equal(added[0].verified_entrance, false);
  assert.ok(places.some(p => p.id === 'NC-110' && p.name_ar.includes('جهاز شؤون البيئة')));
  assert.ok(!added.some(p => p.name_ar === places.find(x => x.id === 'NC-110').name_ar), 'no D33 duplicate of NC-110');
  assert.ok(places.some(p => p.id === 'NC-52' && p.name_ar.includes('البرية والجافة')));
  assert.ok(!added.some(p => p.name_ar.includes('البرية والجافة')), 'no D33 duplicate of NC-52');
});

test('D34 primary-source reconciliation corrects boundaries and ministerial names without inventing walk-in access', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const byId = id => places.find(p => p.id === id);
  for (const id of ['NC-56', 'NC-83', 'NC-88', 'NC-89', 'NC-90', 'NC-91']) {
    const p = byId(id);
    assert.equal(p.verification, 'Source Confirmed', `${id}: narrow official fact`);
    assert.equal(p.last_checked, '2026-11-08');
    assert.equal(p.public_access, 'Unknown');
    assert.equal(p.visitor_hours, '');
    assert.equal(p.directions_url, '');
    assert.equal(p.verified_entrance, false);
    assert.match(p.source_url, /^https:\/\//);
  }
  assert.equal(byId('NC-56').role, 'Facility', 'a legally established branch is not an operational public service desk');
  assert.equal(byId('NC-56').address_precision, 'District Only');
  assert.equal(byId('NC-91').zone, 'Government District', 'developer places Rock Capital 1 in Government District');
  assert.equal(byId('NC-147').zone, byId('NC-91').zone, 'project and building must agree');
  assert.match(byId('NC-91').building_code, /Block 1/);
  assert.match(byId('NC-17').name_ar, /والبيئة/);
  assert.match(byId('NC-39').name_ar, /التعاون الدولي والمصريين بالخارج/);
  assert.ok(byId('NC-39').aliases.includes('وزارة الخارجية'), 'historical alias stays searchable');
  const newRecords = places.filter(p => Number(p.id.slice(3)) === 259);
  assert.deepEqual(newRecords.map(p => p.id), ['NC-259']);
  const operations = newRecords[0];
  assert.equal(operations.kind, 'Authority');
  assert.equal(operations.role, 'Facility');
  assert.equal(operations.zone, 'Government District');
  assert.equal(operations.verification, 'Source Confirmed');
  assert.equal(operations.email, 'emergency@moenv.gov.eg');
  assert.equal(operations.phone, '0220532502');
  assert.match(operations.service_type, /24 ساعة/);
  assert.equal(operations.visitor_hours, '', '24-hour reporting is not walk-in access');
  assert.equal(operations.office_hours, '');
  assert.equal(operations.service_availability, 'Unknown');
  assert.equal(operations.public_access, 'Unknown');
  assert.equal(operations.verified_entrance, false);
  assert.equal(operations.directions_url, '');
  assert.ok(places.every(p => !p.directions_url && !p.verified_entrance));
  const queue = JSON.parse(readFileSync(join(root, 'data/direct-verification.json'), 'utf8'));
  assert.ok(queue.items.every(item => item.outreach_status === 'Not Contacted' && item.attempts.length === 0));
});

test('D35 distinguishes operating bank HQ, opened branch and planned branch without fabricating visitor routes', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const byId = id => places.find(p => p.id === id);
  assert.deepEqual(places.filter(p => Number(p.id.slice(3)) >= 260 && Number(p.id.slice(3)) <= 261).map(p => p.id), ['NC-260', 'NC-261']);
  const reconstruction = byId('NC-260');
  assert.equal(reconstruction.zone, 'Government District');
  assert.equal(reconstruction.role, 'Administrative HQ');
  assert.equal(reconstruction.address_precision, 'Building Confirmed');
  assert.equal(reconstruction.public_access, 'Unknown');
  const qnbHQ = byId('NC-261');
  assert.equal(qnbHQ.zone, 'Financial District');
  assert.equal(qnbHQ.role, 'Administrative HQ');
  assert.equal(qnbHQ.verification, 'Source Confirmed');
  assert.notEqual(qnbHQ.id, byId('NC-36').id, 'QNB retail branch is a separate service point');
  assert.notEqual(qnbHQ.id, byId('NC-98').id, 'SIAC building remains its own place record');
  assert.equal(byId('NC-60').service_availability, 'On-site Confirmed', 'EBank confirms branch opening');
  assert.equal(byId('NC-60').zone, 'Other', 'a capital-city bank branch is not automatically a Financial District branch');
  assert.equal(byId('NC-59').zone, 'Other');
  assert.equal(byId('NC-123').service_availability, 'Unknown', 'planned ABE branch is not confirmed open');
  assert.equal(byId('NC-123').public_access, 'Unknown');
  assert.equal(byId('NC-80').public_access, 'By Appointment', 'EDGE directs users to book/contact for private workspaces');
  assert.equal(byId('NC-81').verification, 'Research', 'Raya facilities-management assignment is not a Raya public office');
  assert.equal(byId('NC-245').verification, 'Research', 'customer centre primary confirmation remains outstanding');
  assert.ok(places.every(p => !p.verified_entrance && !p.directions_url));
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  assert.equal(approved.places.length, 2);
});

test('D36 adds four distinct occupants with narrowly bounded source claims and corrects NBE branch history', () => {
  const {places} = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
  const byId = id => places.find(p => p.id === id);
  const added = places.filter(p => Number(p.id.slice(3)) >= 262 && Number(p.id.slice(3)) <= 265);
  assert.deepEqual(added.map(p => p.id), ['NC-262', 'NC-263', 'NC-264', 'NC-265']);
  assert.deepEqual(added.map(p => p.verification), ['Source Confirmed', 'Research', 'Research', 'Research']);
  assert.ok(added.every(p => p.kind === 'Company'));
  assert.ok(added.filter(p => p.id !== 'NC-263').every(p => p.zone === 'Financial District'));
  assert.ok(added.every(p => p.role === 'Administrative HQ' && p.address_precision === 'Building Confirmed'));
  assert.ok(added.every(p => p.service_availability === 'Unknown' && p.public_access === 'Unknown'));
  assert.ok(added.every(p => !p.visitor_hours && !p.office_hours && !p.directions_url && !p.verified_entrance));
  assert.ok(added.every(p => p.last_checked === '2026-11-08' && p.source_url.startsWith('https://')));
  assert.equal(byId('NC-262').building_code, 'Audaz Mall');
  assert.equal(byId('NC-263').building_code, 'Pioneer Plaza Business Complex');
  assert.equal(byId('NC-265').phone, '', 'conflicting directory numbers never become a public dialing action');
  const nbe = byId('NC-49');
  assert.equal(nbe.service_availability, 'On-site Confirmed', 'own bank opening statement proves branch existence');
  assert.equal(nbe.building_code, 'A1-26', 'financial district plot unchanged');
  assert.equal(nbe.public_access, 'Unknown', 'historical opening does not guarantee current walk-in hours');
  for (const id of ['NC-74', 'NC-75', 'NC-79', 'NC-224']) {
    assert.equal(places.filter(p => p.id === id).length, 1, `${id}: prior occupant remains unique`);
  }
  assert.ok(places.every(p => !p.directions_url && !p.verified_entrance));
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  assert.equal(approved.places.length, 2);
});

test('D37 reconciles the duplicate Nasser mobile point and documents bank branch occupancy without inventing access', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const {places} = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.ok(places.length >= 265, 'the source registry retains D37 historic entity codes');
  const visible = canonicalizePlaces(places);
  assert.equal(visible.length, places.length - 2, 'visitors see one Nasser point and no quarantined Pioneer Plaza tenant');
  assert.ok(visible.some(p => p.id === 'NC-202'));
  assert.ok(!visible.some(p => p.id === 'NC-35'));
  assert.ok(!visible.some(p => p.id === 'NC-263'));
  assert.equal(resolveCanonicalPlace(places, 'nc-35-explore')?.id, 'NC-202', 'old bookmarks resolve to canonical detail');
  assert.equal(resolveCanonicalPlace(places, 'nasser-social-bank-mobile-unit-social-solidarity')?.id, 'NC-202');
  const nasser = visible.find(p => p.id === 'NC-202');
  const parliament = visible.find(p => p.id === 'NC-55');
  for (const bank of [nasser, parliament]) {
    assert.equal(bank.service_availability, 'On-site Confirmed', 'first-party evidence confirms an on-site banking service');
    assert.equal(bank.public_access, 'Unknown', 'public walk-in permission is not established');
    assert.equal(bank.visitor_hours, '', 'bank branch existence is not current visitor hours');
    assert.equal(bank.directions_url, '', 'no navigable pin without a verified entrance');
    assert.equal(bank.verified_entrance, false);
  }
  assert.equal(visible.find(p => p.id === 'NC-36').address_precision, 'District Only', 'QNB cross-language district conflict remains unresolved');
  assert.equal(visible.find(p => p.id === 'NC-264').verification, 'Research', 'third-party law office listing remains unverified');
  assert.equal(visible.find(p => p.id === 'NC-265').phone, '', 'contradictory Apex CPA phones remain blocked');
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8')).places.map(p => p.verification), ['Published', 'Published']);
});

test('D28 tenant follow-up adds official historic addresses but quarantines MU23 scope conflict', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const {places} = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.equal(places.length, 267);
  const unique = canonicalizePlaces(places);
  assert.equal(unique.length, 265);
  for (const id of ['NC-266', 'NC-267']) {
    const p = unique.find(p => p.id === id);
    assert.ok(p, `${id} is a distinct financial district historical office`);
    assert.equal(p.kind, 'Company');
    assert.equal(p.verification, 'Source Confirmed');
    assert.equal(p.source_category, 'Official Authority');
    assert.equal(p.address_precision, 'Floor Confirmed');
    assert.equal(p.public_access, 'Unknown');
    assert.equal(p.service_availability, 'Unknown');
    assert.equal(p.visitor_hours, '');
    assert.equal(p.directions_url, '');
    assert.equal(p.verified_entrance, false);
  }
  const pioneer = places.find(p => p.id === 'NC-263');
  assert.equal(pioneer.zone, 'Other');
  assert.equal(pioneer.verification, 'Research');
  assert.match(pioneer.address, /MU23 A10/);
  assert.equal(resolveCanonicalPlace(places, pioneer.slug)?.id, 'NC-263', 'old reference remains auditable with uncertainty label');
  assert.ok(!unique.some(p => p.id === 'NC-263'), 'out-of-scope candidate does not enter public directory list');
  const counts = places.reduce((a,p)=>(a[p.verification]=(a[p.verification]||0)+1,a),{});
  assert.equal(counts['Source Confirmed'], 211);
  assert.equal(counts.Research, 54);
  assert.equal(counts.Published, 2);
  assert.equal(JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8')).places.length, 2);
});
