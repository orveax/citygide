import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, normalize, paginatePlaces, sourceStatusLabel, visitStatusLabel } from './catalog.mjs';

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

test('relevance puts exact names before weak address matches without claiming popularity', () => {
  const candidates = [
    { ...places[0], slug: 'address', name_ar: 'شركة الخدمات', address: 'بنك القاهرة حي المال والأعمال', verification: 'Published' },
    { ...places[1], slug: 'exact', verification: 'Research' }
  ];
  assert.deepEqual(filterPlaces(candidates, { q: 'بنك القاهرة', sort: 'relevance' }).map(p => p.slug), ['exact', 'address']);
});

test('relevance browsing prioritizes source maturity and government/banking categories', () => {
  const candidates = [
    { ...places[1], slug: 'research', verification: 'Research' },
    { ...places[0], slug: 'published', verification: 'Published' },
    { ...places[1], slug: 'sourced', verification: 'Source Confirmed' }
  ];
  assert.deepEqual(filterPlaces(candidates, { sort: 'relevance' }).map(p => p.slug), ['published', 'sourced', 'research']);
});

test('pagination clamps invalid pages and never loses or duplicates records', () => {
  const all = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
  assert.deepEqual(paginatePlaces(all, 1).items.map(p => p.id), Array.from({length: 12}, (_, i) => i + 1));
  assert.deepEqual(paginatePlaces(all, 2).items.map(p => p.id), Array.from({length: 12}, (_, i) => i + 13));
  assert.deepEqual(paginatePlaces(all, 99), { items: [{id: 25}], page: 3, pages: 3, total: 25, from: 25, to: 25 });
  assert.equal(paginatePlaces(all, 'invalid').page, 1);
  assert.deepEqual(paginatePlaces([]), { items: [], page: 1, pages: 1, total: 0, from: 0, to: 0 });
});

test('source approval and visitor admission are distinct labels', () => {
  const sourced = { verification: 'Source Confirmed', public_access: 'Unknown' };
  assert.equal(sourceStatusLabel(sourced), 'المصدر موثّق');
  assert.equal(visitStatusLabel(sourced), 'دخول الزوار غير مؤكد');
  assert.equal(sourceStatusLabel({ ...sourced, verification: 'Published' }), 'معتمد للنشر');
  assert.equal(visitStatusLabel({ ...sourced, public_access: 'By Appointment' }), 'الزيارة بموعد مسبق');
});
