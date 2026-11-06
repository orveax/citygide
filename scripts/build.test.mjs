import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('production build cannot publish D04 preview records or preview mode', () => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')]);
  const publicJson = JSON.parse(readFileSync(join(root, 'dist/data/places.json'), 'utf8'));
  const published = JSON.parse(readFileSync(join(root, 'data/published.json'), 'utf8'));
  assert.equal(publicJson.mode, 'production');
  assert.deepEqual(publicJson.places, published.places);
  assert.ok(publicJson.places.every(place => place.verification === 'Published'));
  assert.ok(!readFileSync(join(root, 'dist/index.html'), 'utf8').includes('data-preview="true"'));
  assert.deepEqual(readdirSync(join(root, 'dist/data')), ['places.json']);
  assert.ok(!readdirSync(join(root, 'dist')).includes('prototype'));
  for (const asset of ['city-skyline.webp', 'civic-illustration.webp', 'financial-illustration.webp']) {
    assert.ok(readdirSync(join(root, 'dist/assets')).includes(asset), `${asset} is needed by the public homepage`);
  }
  const publicHome = readFileSync(join(root, 'dist/index.html'), 'utf8');
  assert.match(publicHome, /صور معمارية توضيحية وليست صورًا موثقة/);
});
