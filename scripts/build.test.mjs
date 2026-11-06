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
  assert.match(readFileSync(join(root, 'dist/contact.html'), 'utf8'), /mailto:hello@orveax.com/);
  assert.match(readFileSync(join(root, 'dist/terms.html'), 'utf8'), /زيارة/);
  assert.match(readFileSync(join(root, 'dist/privacy.html'), 'utf8'), /Google Fonts/);
  assert.deepEqual(readdirSync(join(root, 'dist/data')), ['exploration.json', 'places.json']);
});

test('D14 exploratory catalogue is explicitly labeled and cannot alter approved public records', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const approved = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const exploratory = JSON.parse(readFileSync(join(root, 'dist/data/exploration.json'), 'utf8'));
  assert.equal(approved.mode, 'production');
  assert.equal(exploratory.mode, 'exploration');
  assert.equal(approved.places.length, 2);
  assert.equal(exploratory.places.length, 64);
  assert.deepEqual(exploratory.places.filter(p => p.verification === 'Published'), approved.places);
  assert.equal(exploratory.places.filter(p => p.verification === 'Research').length, 17);
  assert.equal(exploratory.places.filter(p => p.verification === 'Source Confirmed').length, 45);
  assert.ok(exploratory.places.every(p => !p.directions_url && !p.verified_entrance));
  assert.ok(exploratory.places.every(p => !['Notes', 'Change Reason', 'Evidence Scope', 'Coordinates'].some(key => key in p)));
  for (const name of ['explore.html', 'explore-place.html']) {
    const html = readFileSync(join(root, 'dist', name), 'utf8');
    assert.match(html, /data-catalog="exploration"/);
    assert.match(html, /noindex,nofollow/);
    assert.doesNotMatch(html, /بيانات معتمدة مع تنبيهات واضحة قبل الزيارة/);
  }
  assert.match(readFileSync(join(root, 'dist/index.html'), 'utf8'), /href="explore.html"/);
  assert.ok(!readdirSync(join(root, 'dist')).includes('prototype'));
});
