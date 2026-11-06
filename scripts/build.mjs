import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from './validate.mjs';
import { validatePublishedAgainstApprovals } from './notion-publisher.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dataset = JSON.parse(readFileSync(join(root, 'data/published.json'), 'utf8'));
const exploration = JSON.parse(readFileSync(join(root, 'data/exploration.json'), 'utf8'));
const approvalManifest = JSON.parse(readFileSync(join(root, 'data/publication-approvals.json'), 'utf8'));
const failures = [...validateDataset(dataset, 'production'), ...validatePublishedAgainstApprovals(dataset, approvalManifest), ...validateDataset(exploration, 'exploration')];
if (dataset.mode !== 'production') failures.push('mode must be production');
if (exploration.mode !== 'exploration') failures.push('exploration must have its own mode');
if (exploration.places.length < dataset.places.length) failures.push('exploration cannot omit approved public records');
for (const record of dataset.places) {
  const candidate = exploration.places.find(p => p.id === record.id);
  if (!candidate || JSON.stringify(candidate) !== JSON.stringify(record)) failures.push(`exploration changed approved record ${record.id}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'data'), { recursive: true });
mkdirSync(join(dist, 'scripts'), { recursive: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
for (const name of ['place.html', 'directory.html', 'about.html', 'contact.html', 'terms.html', 'privacy.html', 'styles.css', '404.html']) cpSync(join(root, name), join(dist, name));
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
// Deliberately separate, founder-authorized exploratory pages. These never replace
// the approval-gated public dataset and always show a visible data-quality warning.
let exploreHtml = readFileSync(join(root, 'directory.html'), 'utf8');
exploreHtml = exploreHtml.replace('<body data-page="directory">', '<body data-catalog="exploration" data-page="directory">')
  .replace('بيانات معتمدة مع تنبيهات واضحة قبل الزيارة', 'نسخة استكشافية — تشمل سجلات غير معتمدة')
  .replace('كل نتيجة هنا معتمدة للنشر، لكن توافر الخدمات ودخول الجمهور قد يحتاجان تأكيدًا مباشرًا.', 'هذه نسخة استكشافية من قاعدة البيانات: بعضها معتمد وبعضها بحث مبدئي. لا تعتمد على عنوان أو موعد قبل التحقق من الجهة.')
  .replace('VERIFIED LISTINGS', 'EXPLORATORY LISTINGS')
  .replace('مكان معتمد للنشر', 'نتائج استكشافية')
  .replace('<option value="Financial District">حي المال والأعمال</option>', '<option value="Financial District">حي المال والأعمال</option><option value="Other">الموقع قيد التحقق</option>')
  .replace('<option value="Company">شركات</option>', '<option value="Company">شركات</option><option value="Building">مبانٍ</option><option value="District">أحياء</option>');
writeFileSync(join(dist, 'explore.html'), exploreHtml);
let exploreDetail = readFileSync(join(root, 'place.html'), 'utf8');
exploreDetail = exploreDetail.replace('<body data-page="detail">', '<body data-catalog="exploration" data-page="detail">')
  .replace('المعلومات المعروضة من سجلات معتمدة فقط', 'نسخة استكشافية — تحقق من حالة كل سجل قبل الزيارة')
  .replace('✓ بيانات منشورة بعد مراجعة', '⚠ حالة التحقق تظهر عند تحميل السجل');
writeFileSync(join(dist, 'explore-place.html'), exploreDetail);
cpSync(join(root, 'scripts/app.mjs'), join(dist, 'scripts/app.mjs'));
cpSync(join(root, 'scripts/catalog.mjs'), join(dist, 'scripts/catalog.mjs'));
cpSync(join(root, 'scripts/maps.mjs'), join(dist, 'scripts/maps.mjs'));
for (const name of ['city-skyline.svg', 'financial-architecture.svg', 'civic-architecture.svg', 'city-skyline.webp', 'financial-illustration.webp', 'civic-illustration.webp']) {
  cpSync(join(root, 'assets', name), join(dist, 'assets', name));
}
writeFileSync(join(dist, 'data/places.json'), JSON.stringify(dataset));
writeFileSync(join(dist, 'data/exploration.json'), JSON.stringify(exploration));
writeFileSync(join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log(`Built public allowlist: ${dataset.places.length} founder-approved records. Separate labeled exploratory catalogue: ${exploration.places.length} source records; internal preview and editorial notes excluded.`);
