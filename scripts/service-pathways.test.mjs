import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SERVICE_PATHWAYS, serviceEntries, serviceGroup } from './service-pathways.mjs';
import { canonicalizePlaces } from './catalog.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const data = JSON.parse(readFileSync(fileURLToPath(new URL('../data/exploration.json', import.meta.url)), 'utf8'));
const published = JSON.parse(readFileSync(fileURLToPath(new URL('../data/published.json', import.meta.url)), 'utf8'));
const places = canonicalizePlaces(data.places);

test('CG-MUX-06 service pathways are finite, supported and only resolve real records', () => {
  const groups = new Set();
  for (const group of SERVICE_PATHWAYS) {
    assert.ok(group.id && group.label && group.description && group.channel);
    assert.ok(!groups.has(group.id), 'unique service id');
    groups.add(group.id);
    assert.ok(group.placeIds.length > 0);
    assert.equal(new Set(group.placeIds).size, group.placeIds.length);
    const entries = serviceEntries(places, group);
    assert.equal(entries.length, group.placeIds.length, 'every manually reviewed ID must be present');
    assert.ok(entries.every(p => !['District','Building'].includes(p.kind)), 'service results are not building-only claims');
    assert.ok(entries.every(p => p.source_url && p.verification), 'each candidate has evidence and visible verification status');
    assert.ok(entries.every(p => places.some(r => r.id === p.id)), 'candidates originate from the authorized data snapshot');
    assert.equal(serviceGroup(group.id)?.id, group.id);
  }
  assert.equal(SERVICE_PATHWAYS.length, 6);
});

test('CG-MUX-06 specific authority and bank service identities are not conflated', () => {
  const notary = serviceEntries(places, serviceGroup('notary'));
  const signature = serviceEntries(places, serviceGroup('e-signature'));
  const attestation = serviceEntries(places, serviceGroup('attestation'));
  const banking = serviceEntries(places, serviceGroup('banking'));
  assert.deepEqual(notary.map(p=>p.id), ['NC-108','NC-256']);
  assert.deepEqual(signature.map(p=>p.id), ['NC-120','NC-121']);
  assert.deepEqual(attestation.map(p=>p.id), ['NC-15']);
  assert.ok(banking.every(p=>p.kind==='Bank'));
  assert.ok(banking.every(p=>p.role==='Public Service Point'));
  assert.ok(!banking.some(p=>p.name_ar.includes('البنك المركزي')));
});

test('CG-MUX-06 is a discovery presentation, not editorial publication or access approval', () => {
  const all = SERVICE_PATHWAYS.flatMap(g=>serviceEntries(places,g));
  assert.ok(all.some(p=>p.public_access==='Unknown'), 'unverified visitor access is retained');
  assert.ok(all.some(p=>p.verification!=='Published'), 'research remains marked as research');
  assert.ok(all.every(p=>p.public_access!=='Walk-in Confirmed'), 'no invented walk-in claim');
  assert.equal(data.mode, 'exploration');
  assert.equal(published.mode, 'production');
  assert.equal(serviceEntries([],SERVICE_PATHWAYS[0]).length,0);
});
