import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { canonicalizePlaces } from './catalog.mjs';
import { BUILDING_RELATIONSHIPS, curatedBuildings, buildingGroup, buildingForPlace, BUILDING_STATUS_LABELS } from './building-relations.mjs';
const read = rel => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const raw = JSON.parse(read('../data/exploration.json'));
const approved = JSON.parse(read('../data/published.json'));
const places=canonicalizePlaces(raw.places);
test('CG-MUX-07 curated relationships map only documented buildings and real places',()=>{
  assert.equal(raw.mode,'exploration');
  assert.equal(approved.mode,'production');
  assert.equal(BUILDING_RELATIONSHIPS.length,12);
  const groups=curatedBuildings(places);
  assert.equal(groups.length,BUILDING_RELATIONSHIPS.length);
  assert.equal(groups.reduce((sum,g)=>sum+g.linked.length,0),14);
  for (const g of groups) {
    assert.equal(g.building.kind,'Building');
    assert.ok(g.building.source_url);
    assert.ok(BUILDING_STATUS_LABELS[g.status]);
    assert.ok(g.context);
    assert.equal(g.linked.length,g.placeIds.length);
    assert.ok(g.linked.every(x=>x.id!==g.buildingId&&x.kind!=='Building'&&x.kind!=='District'));
    assert.ok(g.linked.every(x=>x.source_url&&x.verification&&x.public_access));
    assert.equal(buildingGroup(places,g.buildingId)?.buildingId,g.buildingId);
    assert.ok(g.linked.every(p=>buildingForPlace(places,p.id)?.buildingId===g.buildingId));
  }
});
test('CG-MUX-07 does not equate NI-1 and N1 or assert occupancy from general building records',()=>{
  assert.deepEqual(buildingGroup(places,'NC-109').linked.map(p=>p.id),['NC-108']);
  assert.deepEqual(buildingGroup(places,'NC-131').linked.map(p=>p.id),['NC-111','NC-112']);
  assert.ok(!curatedBuildings(places).some(g=>g.linked.some(p=>['NC-120','NC-121','NC-139'].includes(p.id))), 'N1 businesses must not be assigned to NI-1');
  assert.equal(buildingForPlace(places,'NC-120'),undefined);
  assert.equal(buildingGroup(places,'NC-12').linked[0].id,'NC-64');
  assert.equal(buildingGroup(places,'NC-105').status,'restricted-access');
  assert.deepEqual(buildingGroup(places,'NC-129').linked.map(p=>p.id),['NC-50']);
  assert.deepEqual(buildingGroup(places,'NC-133').linked.map(p=>p.id),['NC-52','NC-243']);
  assert.deepEqual(buildingGroup(places,'NC-134').linked.map(p=>p.id),['NC-43']);
  assert.deepEqual(buildingGroup(places,'NC-132').linked.map(p=>p.id),['NC-14']);
});
test('CG-MUX-07 never mutates the source catalogue or upgrades visitor admission',()=>{
  const before=JSON.stringify(places);
  curatedBuildings(places);
  assert.equal(JSON.stringify(places),before);
  const groups=curatedBuildings(places);
  assert.ok(groups.some(g=>g.linked.some(x=>x.public_access==='Unknown')));
  assert.ok(!groups.some(g=>g.context.includes('مفتوح الآن')));
  assert.equal(curatedBuildings([]).length,0);
});
test('CG-MUX-07 page and build expose safe navigation without directions or fake occupancy',()=>{
  const page=read('../buildings.html');
  const script=read('./buildings-page.mjs');
  const build=read('./build.mjs');
  const app=read('./app.mjs');
  assert.match(page,/id="buildingGroups"/);
  assert.match(page,/id="buildingJump"/);
  assert.match(page,/noindex,nofollow/);
  assert.match(script,/sourceStatusLabel\(place\)/);
  assert.match(script,/visitStatusLabel\(place\)/);
  assert.match(script,/new URLSearchParams\(location.search\).get\('id'\)/);
  assert.match(build,/'buildings.html'/);
  assert.match(build,/'building-relations.mjs'/);
  assert.match(build,/'buildings-page.mjs'/);
  assert.match(app,/buildingForPlace\(places, place.id\)/);
  assert.doesNotMatch(script,/directions_url|navigationDecision|walk.in =|verified_entrance/);
});
