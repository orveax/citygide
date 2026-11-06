import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
test('research records fail in preview', () => { const d=copy();d.places[0].verification='Research';assert.match(validateDataset(d,'preview').join(' '),/Research cannot appear/); });

test('production build excludes preview assets and preview copy', () => {
  execFileSync(process.execPath, [new URL('./build.mjs', import.meta.url).pathname]);
  const read = path => readFileSync(new URL('../dist/' + path, import.meta.url), 'utf8');
  const home = read('index.html');
  const detail = read('place.html');
  const app = read('scripts/app.mjs');
  const data = JSON.parse(read('data/places.json'));
  assert.equal(data.mode, 'production');
  assert.deepEqual(data.places, []);
  assert.match(home, /noindex,nofollow/);
  assert.match(detail, /لا يُعرض إلا المحتوى المعتمد/);
  assert.doesNotMatch(detail + app, /معاينة داخلية|عينة المعاينة|PREVIEW|دليل العاصمة \(معاينة\)/);
  for (const path of ['data/preview.json', 'prototype/wireframe.html', 'scripts/validate.mjs']) {
    assert.equal(existsSync(new URL('../dist/' + path, import.meta.url)), false, path + ' leaked');
  }
});
