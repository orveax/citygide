import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  for (const id of ['searchForm', 'q', 'kind', 'zone', 'sort', 'cards', 'count']) assert.match(catalogue, new RegExp(`id="${id}"`));
  assert.match(catalogue, /data-catalog="exploration"/, 'primary directory must show the full exploratory dataset');
  assert.match(readFileSync(join(root, 'dist/index.html'), 'utf8'), /data-home="true"/, 'homepage must expose expanded data too');
  assert.match(readFileSync(join(root, 'dist/contact.html'), 'utf8'), /mailto:hello@orveax.com/);
  assert.match(readFileSync(join(root, 'dist/terms.html'), 'utf8'), /زيارة/);
  assert.match(readFileSync(join(root, 'dist/privacy.html'), 'utf8'), /Google Fonts/);
  assert.deepEqual(readdirSync(join(root, 'dist/data')), ['exploration.json', 'places.json']);
});

test('D25 source-backed expansion preserves approval and the D24 historical cohort', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const exploratory = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.equal(approved.mode, 'production');
  assert.equal(exploratory.mode, 'exploration');
  assert.equal(approved.places.length, 2);
  assert.equal(exploratory.places.length, 201);
  assert.deepEqual(exploratory.places.filter(p => p.verification === 'Published'), approved.places);
  assert.equal(exploratory.places.filter(p => p.verification === 'Research').length, 68);
  assert.equal(exploratory.places.filter(p => p.verification === 'Source Confirmed').length, 131);
  const historical = exploratory.places.filter(p => Number(p.id.slice(3)) <= 179);
  assert.equal(historical.length, 179);
  const companies = historical.filter(p => p.kind === 'Company');
  assert.equal(companies.length, 41);
  assert.equal(companies.filter(p => p.verification === 'Research').length, 28);
  assert.equal(companies.filter(p => p.role === 'Public Service Point' && p.verification === 'Source Confirmed').length, 6);
  assert.equal(companies.filter(p => p.role === 'Administrative HQ' && p.verification === 'Source Confirmed').length, 5);
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
  assert.equal(added.filter(p => p.verification === 'Source Confirmed').length, 6);
  assert.equal(added.filter(p => p.verification === 'Research').length, 1);
  assert.ok(added.every(p => p.public_access === 'Unknown' && !p.verified_entrance && !p.directions_url));
  assert.ok(added.every(p => p.source_url.startsWith('https://') && p.last_checked === '2026-11-07'));
  assert.ok(added.every(p => !p.visitor_hours), 'an official address does not imply current walk-in hours');
  assert.equal(added.find(p => p.id === 'NC-108')?.building_code, 'NI-1');
  assert.equal(added.find(p => p.id === 'NC-114')?.service_availability, 'Unknown');
  const batch22 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 115 && Number(p.id.slice(3)) <= 135);
  assert.deepEqual(batch22.map(p => p.id), Array.from({length: 21}, (_, i) => `NC-${i + 115}`));
  assert.equal(batch22.filter(p => p.verification === 'Source Confirmed').length, 15);
  assert.equal(batch22.filter(p => p.verification === 'Research').length, 6);
  assert.equal(batch22.filter(p => p.kind === 'Building').length, 8);
  assert.equal(batch22.filter(p => p.kind === 'Bank').length, 6);
  assert.equal(batch22.filter(p => p.kind === 'Authority').length, 5);
  assert.equal(batch22.filter(p => p.kind === 'Company').length, 2);
  assert.ok(batch22.every(p => p.service_availability === 'Unknown' && p.public_access === 'Unknown'));
  assert.ok(batch22.every(p => !p.verified_entrance && !p.directions_url && !p.visitor_hours));
  assert.ok(batch22.every(p => p.source_url.startsWith('https://') && p.last_checked === '2026-11-07'));
  assert.ok(batch22.filter(p => p.verification === 'Research').every(p => p.source_category === 'Secondary News' || p.id === 'NC-117'));
  assert.equal(batch22.find(p => p.id === 'NC-121')?.source_category, 'Official Business');
  assert.equal(batch22.find(p => p.id === 'NC-123')?.verification, 'Research', 'planned agricultural branch is not visitor-ready');
  const batch23 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 136 && Number(p.id.slice(3)) <= 159);
  assert.deepEqual(batch23.map(p => p.id), Array.from({length: 24}, (_, i) => `NC-${i + 136}`));
  assert.deepEqual(Object.fromEntries(['Authority', 'Bank', 'Building', 'Company'].map(kind => [kind, batch23.filter(p => p.kind === kind).length])), {Authority: 4, Bank: 3, Building: 11, Company: 6});
  assert.equal(batch23.filter(p => p.verification === 'Source Confirmed').length, 14);
  assert.equal(batch23.filter(p => p.verification === 'Research').length, 10);
  assert.ok(batch23.every(p => p.public_access === 'Unknown' && p.service_availability === 'Unknown'));
  assert.ok(batch23.every(p => !p.directions_url && !p.verified_entrance && !p.visitor_hours));
  assert.ok(batch23.every(p => p.source_url.startsWith('https://') && ['2026-11-07', '2026-11-08'].includes(p.last_checked)));
  assert.equal(batch23.find(p => p.id === 'NC-137')?.address_precision, 'Floor Confirmed', 'business-issued office and floor');
  assert.equal(batch23.find(p => p.id === 'NC-145')?.verification, 'Research', 'NBK construction is not a live banking branch');
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
  const batch25 = exploratory.places.filter(p => Number(p.id.slice(3)) >= 180);
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
