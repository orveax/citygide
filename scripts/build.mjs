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
for (const name of ['place.html', 'styles.css']) cpSync(join(root, name), join(dist, name));
const landing = readFileSync(join(root, 'index.html'), 'utf8')
  .replace('نتيجة في عينة الاختبار', 'مكان معتمد للنشر')
  .replace('جارٍ تحميل عينة الاختبار…', 'جارٍ تحميل الأماكن المعتمدة…');
writeFileSync(join(dist, 'index.html'), landing);
cpSync(join(root, 'scripts/app.mjs'), join(dist, 'scripts/app.mjs'));
writeFileSync(join(dist, 'data/places.json'), JSON.stringify(dataset));
writeFileSync(join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log(`Built production allowlist: ${dataset.places.length} approved places; prototype and editorial data excluded.`);
