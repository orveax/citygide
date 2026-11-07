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

test('D21 source-backed service expansion distinguishes published places from visitor-ready locations', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const exploratory = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.equal(approved.mode, 'production');
  assert.equal(exploratory.mode, 'exploration');
  assert.equal(approved.places.length, 2);
  assert.equal(exploratory.places.length, 114);
  assert.deepEqual(exploratory.places.filter(p => p.verification === 'Published'), approved.places);
  assert.equal(exploratory.places.filter(p => p.verification === 'Research').length, 39);
  assert.equal(exploratory.places.filter(p => p.verification === 'Source Confirmed').length, 73);
  const companies = exploratory.places.filter(p => p.kind === 'Company');
  assert.equal(companies.length, 32);
  assert.equal(companies.filter(p => p.verification === 'Research').length, 22);
  assert.equal(companies.filter(p => p.role === 'Public Service Point' && p.verification === 'Source Confirmed').length, 3);
  assert.equal(companies.filter(p => p.role === 'Administrative HQ' && p.verification === 'Source Confirmed').length, 5);
  const buildings = exploratory.places.filter(p => p.kind === 'Building');
  assert.equal(buildings.length, 16);
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
  const added = exploratory.places.filter(p => Number(p.id.slice(3)) >= 108);
  assert.deepEqual(added.map(p => p.id), ['NC-108', 'NC-109', 'NC-110', 'NC-111', 'NC-112', 'NC-113', 'NC-114']);
  assert.equal(added.filter(p => p.verification === 'Source Confirmed').length, 6);
  assert.equal(added.filter(p => p.verification === 'Research').length, 1);
  assert.ok(added.every(p => p.public_access === 'Unknown' && !p.verified_entrance && !p.directions_url));
  assert.ok(added.every(p => p.source_url.startsWith('https://') && p.last_checked === '2026-11-07'));
  assert.ok(added.every(p => !p.visitor_hours), 'an official address does not imply current walk-in hours');
  assert.equal(added.find(p => p.id === 'NC-108')?.building_code, 'NI-1');
  assert.equal(added.find(p => p.id === 'NC-114')?.service_availability, 'Unknown');
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
