import test from 'node:test';
import assert from 'node:assert/strict';
import { arrivalReadiness, mapsDirectionsUrl, mapsSearchUrl, navigationDecision } from './maps.mjs';

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


test('CG-MUX-08 district-only address has no unsafe route and advises verification', () => {
  const arrival = arrivalReadiness({ ...base, verification:'Source Confirmed', address_precision:'District Only', public_access:'Unknown', role:'Administrative HQ' },{exploration:true});
  assert.equal(arrival.mode,'unavailable');
  assert.equal(arrival.readyForNavigation,false);
  assert.equal(arrival.verifiedEntrance,false);
  assert.match(arrival.location,/المنطقة فقط/);
  assert.ok(arrival.steps.some(s=>s.includes('المقر إداري') || s.includes('مقر إداري')));
});
test('CG-MUX-08 building/floor search does not promote an address to a visitor entrance', () => {
  for(const precision of ['Building Confirmed','Floor Confirmed']){
    const result=arrivalReadiness({...base, verification:'Source Confirmed',address_precision:precision, public_access:'Unknown'}, {exploration:true});
    assert.equal(result.mode,'search');
    assert.equal(result.readyForNavigation,false);
    assert.equal(result.verifiedEntrance,false);
    assert.ok(result.steps.some(s=>s.includes('بحث')&&s.includes('ليس') || s.includes('بحث')&&s.includes('لا تعتمد')));
  }
});
test('CG-MUX-08 published verified entrance yields directions but not inferred opening', () => {
  const place={...base,verification:'Published',address_precision:'Entrance Confirmed',verified_entrance:true,public_access:'Unknown',directions_url:'https://www.google.com/maps/dir/?api=1&destination=30.001%2C31.001'};
  const result=arrivalReadiness(place,{exploration:true});
  assert.equal(result.mode,'directions');
  assert.equal(result.readyForNavigation,true);
  assert.equal(result.verifiedEntrance,true);
  assert.ok(result.steps.some(s=>s.includes('استعلم عن استقبال الجمهور')));
});
test('CG-MUX-08 research-only entries never receive search or directions even if a pin is recorded', () => {
  const place={...base,verification:'Research',address_precision:'Pin Verified',verified_entrance:true,directions_url:'https://www.google.com/maps/dir/?api=1&destination=30.001%2C31.001'};
  const result=arrivalReadiness(place,{exploration:true});
  assert.equal(result.mode,'unavailable');
  assert.equal(result.readyForNavigation,false);
});
test('CG-MUX-08 a service registered at another location must not imply this address is a service destination',()=>{
  const result=arrivalReadiness({...base,service_availability:'Other Location',public_access:'Unknown'},{exploration:true});
  assert.match(result.steps[0],/مقر مختلف/);
});
