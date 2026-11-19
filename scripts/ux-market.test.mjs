import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { filterPlaces } from './catalog.mjs';

const file = rel => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const home = file('../index.html');
const css = file('../styles.css');
const exploration = JSON.parse(file('../data/exploration.json'));

test('CG-MUX-01 task shortcuts link to real directory searches', () => {
  const nav = home.match(/<nav class="task-shortcuts"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'home must expose task-first navigation');
  assert.match(nav[0], /aria-label="بحث سريع حسب الخدمة أو نوع الجهة"/);
  const anchors = [...nav[1].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)]
    .map(match => ({ url: new URL(match[1], 'https://citygide.invalid/'), label: match[2] }));
  assert.deepEqual(anchors.map(a => a.label), ['التوثيق', 'تصديقات الخارجية', 'التوقيع الإلكتروني', 'الجهات والمواقع المصرفية']);
  const expected = [{q:'توثيق'}, {q:'تصديقات'}, {q:'التوقيع'}, {kind:'Bank'}];
  anchors.forEach(({url}, i) => {
    assert.equal(url.pathname, '/directory.html');
    assert.equal(url.hash, '#results');
    assert.deepEqual(Object.fromEntries(url.searchParams), expected[i]);
    assert.ok(filterPlaces(exploration.places, {...expected[i], sort:'relevance'}).length > 0);
  });
});

test('CG-MUX-01 disclosure and responsive keyboard navigation', () => {
  assert.match(home, /task-shortcuts__note">النتائج استكشافية؛ حالة المصدر وإمكانية الزيارة موضحتان في كل سجل/);
  assert.match(css, /\.task-shortcuts a:focus-visible\s*\{/);
  assert.match(css, /@media \(max-width: 650px\)[\s\S]*?\.task-shortcuts\s*\{\s*display: grid;[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.task-shortcuts a\s*\{[^}]*min-height: 42px/s);
  assert.match(css, /\.task-shortcuts a\s*\{[^}]*min-height: 44px/s);
  assert.doesNotMatch(home.match(/<nav class="task-shortcuts"[\s\S]*?<\/nav>/)[0], /maps\/dir|directions_url|مفتوح الآن|الأقرب/);
});
