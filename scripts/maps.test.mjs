import test from 'node:test';
import assert from 'node:assert/strict';
import { mapsDirectionsUrl, mapsSearchUrl, navigationDecision } from './maps.mjs';

const base = {
  name_ar: 'وزارة الاتصالات',
  address: 'مبنى 10B-L2M، العاصمة الإدارية الجديدة',
  address_precision: 'Building Confirmed',
  verified_entrance: false,
  directions_url: ''
};

test('a confirmed building opens Maps search without claiming navigation to an entrance', () => {
  const query = new URL(mapsSearchUrl(base));
  assert.equal(query.hostname, 'www.google.com');
  assert.equal(query.pathname, '/maps/search/');
  assert.equal(query.searchParams.get('api'), '1');
  assert.match(query.searchParams.get('query'), /10B-L2M/);
  assert.equal(mapsDirectionsUrl(base), '');
});

test('district-only location has no misleading maps button', () => {
  assert.equal(mapsSearchUrl({ ...base, address_precision: 'District Only' }), '');
});

test('a verified entrance allows Google Maps navigation from visitor location', () => {
  const url = mapsDirectionsUrl({
    ...base, address_precision: 'Pin Verified', verified_entrance: true,
    directions_url: 'https://www.google.com/maps/dir/?api=1&origin=Old+Location&destination=30.001%2C31.001'
  });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('origin'), null);
  assert.equal(parsed.searchParams.get('dir_action'), 'navigate');
  assert.equal(parsed.searchParams.get('destination'), '30.001,31.001');
});

test('rejects unverified or non-Google navigation URLs', () => {
  const bad = { ...base, address_precision: 'Pin Verified', verified_entrance: true };
  assert.equal(mapsDirectionsUrl({ ...bad, directions_url: 'https://other.example/maps/dir/?api=1&destination=Office' }), '');
  assert.equal(mapsDirectionsUrl({ ...bad, directions_url: 'https://www.google.com/maps/search/?api=1&query=Office' }), '');
  assert.equal(mapsDirectionsUrl({ ...bad, directions_url: 'https://www.google.com/maps/dir/?api=1' }), '');
  assert.equal(mapsDirectionsUrl({ ...bad, directions_url: 'https://www.google.com/maps/dir/?api=1&destination=' }), '');
  assert.equal(mapsDirectionsUrl({ ...bad, directions_url: 'https://www.google.com/maps/directions/?api=1&destination=Office' }), '');
});

test('profile navigation decision never promotes a building search into directions', () => {
  const decision = navigationDecision({ ...base, verification: 'Source Confirmed' }, { exploration: true });
  assert.equal(decision.mode, 'search');
  assert.match(decision.href, /\/maps\/search\//);
  assert.match(decision.status, /ليس اتجاهات/);
  assert.doesNotMatch(decision.label, /الملاحة/);
});

test('unapproved Research records receive no Maps shortcut even with a building address', () => {
  const decision = navigationDecision({ ...base, verification: 'Research' }, { exploration: true });
  assert.equal(decision.mode, 'unavailable');
  assert.equal(decision.reason, 'research');
  assert.equal(decision.href, '');
  assert.match(decision.notice, /عنوان المبنى/);
});

test('only a verified entrance on a Published profile can be navigated to', () => {
  const candidate = {
    ...base, verification: 'Published', address_precision: 'Pin Verified', verified_entrance: true,
    directions_url: 'https://www.google.com/maps/dir/?api=1&origin=Stale&destination=30.001%2C31.001'
  };
  const approved = navigationDecision(candidate, { exploration: true });
  assert.equal(approved.mode, 'directions');
  assert.match(approved.label, /الملاحة/);
  assert.equal(new URL(approved.href).searchParams.has('origin'), false);
  assert.equal(navigationDecision({ ...candidate, verification: 'Source Confirmed' }, { exploration: true }).mode, 'search');
  assert.equal(navigationDecision({ ...candidate, verified_entrance: false }, { exploration: true }).mode, 'search');
});

test('district-only profiles do not expose a Maps link or pretend to know an entrance', () => {
  const decision = navigationDecision({ ...base, verification: 'Published', address_precision: 'District Only' });
  assert.equal(decision.mode, 'unavailable');
  assert.equal(decision.href, '');
});
