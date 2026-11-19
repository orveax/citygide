import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateCityResearch } from './city-research.mjs';

const datasetPath = fileURLToPath(new URL('../data/research/new-alamein.json', import.meta.url));
const publishedPath = fileURLToPath(new URL('../data/published.json', import.meta.url));
const explorationPath = fileURLToPath(new URL('../data/exploration.json', import.meta.url));
const read = path => JSON.parse(readFileSync(path, 'utf8'));

test('New Alamein registry is valid and stays research only', () => {
  const d = read(datasetPath);
  assert.equal(d.city.id, 'new-alamein');
  assert.equal(d.places.length, 10);
  assert.deepEqual(validateCityResearch(d), []);
  assert.ok(d.places.every(p => p.release_approved === false && p.directions_url === null));
});

test('research approval and navigation cannot be smuggled into the research registry', () => {
  const d = read(datasetPath);
  const changed = structuredClone(d);
  changed.places[0].directions_url = 'https://www.google.com/maps/dir/?api=1&destination=New+Alamein';
  changed.places[0].release_approved = true;
  assert.ok(validateCityResearch(changed).some(e => e.includes('routing')));
});

test('source-less candidates and duplicate IDs fail validation', () => {
  const changed = structuredClone(read(datasetPath));
  changed.places[1].id = changed.places[0].id;
  changed.places[1].source.url = '';
  assert.ok(validateCityResearch(changed).some(e => e.includes('duplicate')));
  assert.ok(validateCityResearch(changed).some(e => e.includes('source')));
});

test('Alamein candidates are absent from public and exploratory data', () => {
  for (const path of [publishedPath, explorationPath]) {
    const d = read(path);
    assert.ok(d.places.every(p => !p.id.startsWith('ALM-')));
  }
});
