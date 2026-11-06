import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDataset } from './validate.mjs';
const dataset = JSON.parse(readFileSync(new URL('../data/preview.json', import.meta.url)));
const copy = () => structuredClone(dataset);

test('source-confirmed sample works only in preview', () => {
  assert.deepEqual(validateDataset(dataset, 'preview'), []);
  assert.match(validateDataset(dataset, 'production').join(' '), /not editorially Published/);
});
test('duplicate slugs fail', () => { const d=copy();d.places[1].slug=d.places[0].slug;assert.match(validateDataset(d,'preview').join(' '),/duplicate slug/); });
test('private editorial fields fail', () => { const d=copy();d.places[0].Notes='internal';assert.match(validateDataset(d,'preview').join(' '),/private\/unknown/); });
test('unverified directions fail', () => { const d=copy();d.places[0].directions_url='https://maps.example/route';assert.match(validateDataset(d,'preview').join(' '),/directions require verified/); });
test('verified directions must resolve to a Google Maps destination', () => { const d=copy();d.places[0].address_precision='Pin Verified';d.places[0].verified_entrance=true;d.places[0].directions_url='https://example.org/maps/dir/?api=1&destination=test';assert.match(validateDataset(d,'preview').join(' '),/valid Google Maps URL/); });
test('research records fail in preview', () => { const d=copy();d.places[0].verification='Research';assert.match(validateDataset(d,'preview').join(' '),/Research cannot appear/); });
