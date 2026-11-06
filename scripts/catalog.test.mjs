import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, normalize } from './catalog.mjs';

const places = [
  { slug: 'a', name_ar: 'وزارة الاتصالات', name_en: 'Communications Ministry', address: 'الحي الحكومي', aliases: ['MCIT'], building_code: '10B', service_type: '', zone: 'Government District', kind: 'Government', last_checked: '2026-11-02' },
  { slug: 'b', name_ar: 'بنك القاهرة', name_en: 'Banque du Caire', address: 'حي المال والأعمال', aliases: [], building_code: '', service_type: 'مصرفية', zone: 'Financial District', kind: 'Bank', last_checked: '2026-11-06' }
];

test('Arabic normalization handles hamza, ta marbuta, and diacritics', () => {
  assert.equal(normalize('إدَارَة'), 'اداره');
});
test('Arabic and Latin aliases both find the same approved item', () => {
  assert.equal(filterPlaces(places, { q: 'وزاره الاتصالات' })[0].slug, 'a');
  assert.equal(filterPlaces(places, { q: 'MCIT' })[0].slug, 'a');
});
test('zone and kind compose without leaking unrelated cards', () => {
  assert.deepEqual(filterPlaces(places, { kind: 'Bank', zone: 'Government District' }), []);
  assert.equal(filterPlaces(places, { kind: 'Bank', zone: 'Financial District' })[0].slug, 'b');
});
test('recent sorting uses checked date with stable Arabic fallback', () => {
  assert.deepEqual(filterPlaces(places, { sort: 'recent' }).map(p => p.slug), ['b', 'a']);
});
test('filtering does not change input order', () => {
  const original = places.map(p => p.slug);
  filterPlaces(places, { sort: 'recent' });
  assert.deepEqual(places.map(p => p.slug), original);
});
