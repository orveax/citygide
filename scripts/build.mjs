import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from './validate.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dataset = JSON.parse(readFileSync(join(root, 'data/published.json'), 'utf8'));
const failures = validateDataset(dataset, 'production');
if (dataset.mode !== 'production') failures.push('mode must be production');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'data'), { recursive: true });
mkdirSync(join(dist, 'scripts'), { recursive: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
for (const name of ['place.html', 'styles.css', '404.html']) cpSync(join(root, name), join(dist, name));
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(join(root, 'scripts/app.mjs'), join(dist, 'scripts/app.mjs'));
cpSync(join(root, 'scripts/catalog.mjs'), join(dist, 'scripts/catalog.mjs'));
for (const name of ['city-skyline.svg', 'financial-architecture.svg', 'civic-architecture.svg', 'city-skyline.webp', 'financial-illustration.webp', 'civic-illustration.webp']) {
  cpSync(join(root, 'assets', name), join(dist, 'assets', name));
}
writeFileSync(join(dist, 'data/places.json'), JSON.stringify(dataset));
writeFileSync(join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log(`Built production allowlist: ${dataset.places.length} approved places; prototype and editorial data excluded.`);
