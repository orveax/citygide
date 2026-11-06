// Separate internal review output. Never publish this directory to production.
import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from './validate.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dataset = JSON.parse(readFileSync(join(root, 'data/preview.json'), 'utf8'));
const failures = validateDataset(dataset, 'preview');
if (dataset.mode !== 'preview') failures.push('mode must be preview');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }

const output = join(root, 'review-dist');
rmSync(output, { recursive: true, force: true });
mkdirSync(join(output, 'data'), { recursive: true });
mkdirSync(join(output, 'scripts'), { recursive: true });
mkdirSync(join(output, 'assets'), { recursive: true });
for (const file of ['styles.css', '404.html']) cpSync(join(root, file), join(output, file));
for (const file of ['index.html', 'place.html']) {
  const html = readFileSync(join(root, file), 'utf8').replace('<body data-page=', '<body data-preview="true" data-page=');
  writeFileSync(join(output, file), html);
}
for (const file of ['app.mjs', 'catalog.mjs']) cpSync(join(root, 'scripts', file), join(output, 'scripts', file));
for (const file of ['city-skyline.svg', 'financial-architecture.svg', 'civic-architecture.svg']) cpSync(join(root, 'assets', file), join(output, 'assets', file));
writeFileSync(join(output, 'data/places.json'), JSON.stringify(dataset));
writeFileSync(join(output, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n');
console.log(`Built LOCAL review output: ${dataset.places.length} unapproved preview records. Never deploy review-dist.`);
