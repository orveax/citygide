import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from './validate.mjs';
import { validatePublishedAgainstApprovals } from './notion-publisher.mjs';
import { auditBuiltUx } from './ux-audit.mjs';
import { buildDetailRoutes } from './static-detail-routes.mjs';
import { auditPublication } from './publish-qa.mjs';
import { launchReadiness } from './launch-readiness.mjs';
import { assessSEO } from './seo-release.mjs';
import { BUILDING_RELATIONSHIPS } from './building-relations.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
// Execute pure business-rule, Maps, relationship and UX-contract regressions
// on every Cloudflare production build. Do not include build.test.mjs here:
// that suite invokes build.mjs itself, which would recurse.
execFileSync(process.execPath, ['--test', '--test-concurrency=1',
  'scripts/catalog.test.mjs', 'scripts/maps.test.mjs',
  'scripts/service-pathways.test.mjs', 'scripts/building-relations.test.mjs',
  'scripts/measurement.test.mjs', 'scripts/ux-audit.test.mjs',
  'scripts/static-detail-routes.test.mjs', 'scripts/seo-release.test.mjs'
], { cwd: root, stdio: 'inherit' });
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
for (const name of ['place.html', 'alamein.html', 'directory.html', 'services.html', 'buildings.html', 'districts.html', 'about.html', 'contact.html', 'terms.html', 'privacy.html', 'styles.css', '404.html']) cpSync(join(root, name), join(dist, name));
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
// Founder-authorized exploration is now the default visitor journey on both
// home and directory. Formal publication approval remains a distinct dataset.
const directoryHtml = readFileSync(join(root, 'directory.html'), 'utf8');
writeFileSync(join(dist, 'explore.html'), directoryHtml);
const approvedHtml = directoryHtml
  .replace(' data-catalog="exploration"', '')
  .replace('دليل استكشافي — حالة التحقق موضحة لكل جهة', 'سجلات تم اعتماد نشرها بعد المراجعة')
  .replace('كل سجلات الدليل متاحة للبحث، بما فيها الجهات قيد البحث. كل بطاقة بتوضح درجة التحقق، ومفيش عنوان غير مؤكد بنقدمه كوجهة زيارة.', 'تعرض هذه الصفحة السجلات المعتمدة للنشر فقط. لعرض جميع الجهات قيد البحث، افتح الدليل الموسع.')
  .replace('href="approved.html">عرض السجلات المعتمدة فقط', 'href="directory.html">عرض جميع سجلات الدليل')
  .replace('EXPLORE ALL LISTINGS', 'APPROVED LISTINGS')
  .replace('نتيجة مع حالة التحقق', 'سجل معتمد للنشر');
writeFileSync(join(dist, 'approved.html'), approvedHtml);
let exploreDetail = readFileSync(join(root, 'place.html'), 'utf8');
exploreDetail = exploreDetail.replace('<body data-page="detail">', '<body data-catalog="exploration" data-page="detail">')
  .replace('المعلومات المعروضة من سجلات معتمدة فقط', 'نسخة استكشافية — تحقق من حالة كل سجل قبل الزيارة')
  .replace('✓ بيانات منشورة بعد مراجعة', '⚠ حالة التحقق تظهر عند تحميل السجل');
writeFileSync(join(dist, 'explore-place.html'), exploreDetail);
cpSync(join(root, 'scripts/app.mjs'), join(dist, 'scripts/app.mjs'));
cpSync(join(root, 'scripts/alamein.mjs'), join(dist, 'scripts/alamein.mjs'));
for (const name of ['alamein-01.json','alamein-02.json','place-details.json']) cpSync(join(root, 'data', name), join(dist, 'data', name));
cpSync(join(root, 'scripts/catalog.mjs'), join(dist, 'scripts/catalog.mjs'));
cpSync(join(root, 'scripts/maps.mjs'), join(dist, 'scripts/maps.mjs'));
for (const name of ['service-pathways.mjs','services-page.mjs','building-relations.mjs','buildings-page.mjs','city-districts.mjs','measurement.mjs']) cpSync(join(root, 'scripts', name), join(dist, 'scripts', name));
for (const name of ['city-skyline.svg', 'financial-architecture.svg', 'civic-architecture.svg', 'city-skyline.webp', 'financial-illustration.webp', 'civic-illustration.webp']) {
  cpSync(join(root, 'assets', name), join(dist, 'assets', name));
}
writeFileSync(join(dist, 'data/places.json'), JSON.stringify(dataset));
writeFileSync(join(dist, 'data/exploration.json'), JSON.stringify(exploration));
writeFileSync(join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
// Cloudflare Web Analytics: page-level views without cookies or fabricated counters.
// Applied to all generated HTML routes, including exploratory listings and Alamein.
const analyticsSnippet = "<script type=\"module\" src=\"https://static.cloudflareinsights.com/beacon.min.js\" data-cf-beacon='{\"token\":\"31d69c5f418f426fae8541a59565a619\"}'></script>";
for (const filename of ['index.html','place.html','explore-place.html','directory.html','explore.html','approved.html','alamein.html','services.html','buildings.html','districts.html','about.html','contact.html','terms.html','privacy.html','404.html']) {
  const file = join(dist, filename);
  const html = readFileSync(file, 'utf8');
  if (!html.includes('static.cloudflareinsights.com/beacon.min.js')) writeFileSync(file, html.replace('</head>', analyticsSnippet + '</head>'));
}

const alameinRecords = ['alamein-01.json','alamein-02.json'].flatMap(name => JSON.parse(readFileSync(join(root,'data',name),'utf8')));
const evidenceDetails = JSON.parse(readFileSync(join(root,'data/place-details.json'),'utf8'));
if (evidenceDetails.schema_version !== '0.1' || !evidenceDetails.records || Array.isArray(evidenceDetails.records)) throw Error('Invalid place details schema');
const allowedDetails = new Set(['entity_subtype','floor_suite','unit_code','neighborhood','po_box','postal_code','contact_attribution','operational_status','audit_state','visitor_release_gate','evidence_scope','hotline_hours','entity_code','tenant_evidence_class','next_review','map_evidence_class','source_license','verification_method','relation_evidence']);
for(const [id, details] of Object.entries(evidenceDetails.records)){
 if(!exploration.places.some(p=>p.id===id)) throw Error('Orphan research detail '+id);
 if(Object.keys(details).some(key=>!allowedDetails.has(key))) throw Error('Unsafe research detail '+id);
 if(Object.values(details).some(v=>typeof v!=='string'||v.length>5000)) throw Error('Invalid research detail '+id);
}
const launchReport=launchReadiness(exploration,evidenceDetails,alameinRecords);
if(launchReport.validation.missing_source_ids.length || launchReport.validation.unsafe_direction_ids.length || launchReport.validation.orphan_detail_ids.length || launchReport.sync.missing_detail_rows.length) {
 console.error('CG-PUBLISH-03 data integrity gate failed',launchReport.validation,launchReport.sync.missing_detail_rows);
 process.exit(1);
}
writeFileSync(join(dist,'data','launch-readiness.json'),JSON.stringify(launchReport,null,2));
const seoReport=assessSEO(exploration,evidenceDetails,alameinRecords);
const relationshipAudit={
 schema_version:'1.0',generated_at:'2026-11-20',notion_master_rows:350,
 curated_building_groups:BUILDING_RELATIONSHIPS.length,
 curated_place_links:BUILDING_RELATIONSHIPS.reduce((n,group)=>n+group.placeIds.length,0),
 manual_evidence_only:true,notion_relational_full_sync:false,
 notion_query_block:'Notion SQL allowance reached before all relation properties could be reconciled; do not claim full relations synchronization.',
 source_boundaries:'Links assert that a published source mentions a place associated with a building, not that it is operating, accepting visitors or has an approved entrance.',
 outstanding_review_ids:Object.entries(evidenceDetails.records).filter(([id,detail])=>detail.relation_evidence&&!BUILDING_RELATIONSHIPS.some(g=>g.buildingId===id||g.placeIds.includes(id))).map(([id])=>id)
};
writeFileSync(join(dist,'data','seo-review.json'),JSON.stringify(seoReport,null,2));
writeFileSync(join(dist,'data','relationship-audit.json'),JSON.stringify(relationshipAudit,null,2));
const sitemapPreview=['<?xml version="1.0" encoding="UTF-8"?>',
 '<!-- CG-PUBLISH-04 PREVIEW ONLY: all pages retain noindex; do not submit this file to Search Console until a permanent domain and editorial approvals exist. -->',
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
 ...seoReport.candidates.map(p=>'  <url><loc>https://citygide.pages.dev'+p.path+'</loc></url>'),
 '</urlset>'].join('\\n')+'\\n';
writeFileSync(join(dist,'sitemap-preview.xml'),sitemapPreview);
console.log('CG-PUBLISH-04 SEO review candidates:',seoReport.candidates.length,'; Notion relation audit groups:',relationshipAudit.curated_building_groups,'; indexing is HOLD.');
writeFileSync(join(dist,'robots.txt'),'User-agent: *\\nAllow: /\\n# Pre-launch: all HTML pages and response headers carry noindex; crawling must remain allowed so crawlers can see that directive.\\n');
console.log('CG-PUBLISH-03 Notion sync and indexing hold verified:',launchReport.sync.matched_detail_rows,'of',launchReport.sync.notion_master_rows);
const detailCounts = buildDetailRoutes(dist, exploration, alameinRecords);
console.log('Record-specific analytics routes:', detailCounts);
const publicationAudit = auditPublication(dist,exploration,alameinRecords);
if(publicationAudit.errors.length){console.error('CG-PUBLISH-02 acceptance gate failed:\\n'+publicationAudit.errors.join('\\n'));process.exit(1);}
console.log('CG-PUBLISH-02 route and privacy gate passed:',publicationAudit.capital,'capital details,',publicationAudit.alamein,'Alamein details.');
const uxProblems = auditBuiltUx(dist);
if (uxProblems.length) {
  console.error('UX acceptance gate failed:\n'+uxProblems.join('\n'));
  process.exit(1);
}
console.log('UX structural acceptance gate passed for 12 public pages.');
console.log(`Built default public exploratory directory: ${exploration.places.length} source records; approved-only view: ${dataset.places.length} founder-approved records; internal notes excluded.`);
