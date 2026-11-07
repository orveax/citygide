// Governed, append-only expansion of the exploratory snapshot from a source register.
// The Notion database must be updated and checked independently before --write.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { validateDataset } from './validate.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const registerPath = process.argv[2] ? resolve(process.argv[2]) : '';
const writing = process.argv.includes('--write');
if (!registerPath) {
  console.error('Usage: node scripts/append-source-register.mjs docs/D24-source-register.json [--write]');
  process.exit(2);
}

const snapshotPath = join(root, 'data/exploration.json');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const batch = JSON.parse(readFileSync(registerPath, 'utf8'));
const incoming = batch.records ?? [];
if (!Array.isArray(incoming) || !incoming.length || !/^\d{4}-\d{2}-\d{2}$/.test(batch.checked_at)) {
  throw new Error('Batch records and checked_at date are required');
}

const existingIds = new Set(snapshot.places.map(place => place.id));
const existingSlugs = new Set(snapshot.places.map(place => place.slug));
const previousMax = Math.max(...snapshot.places.map(place => Number(place.id.match(/^NC-(\d+)$/)?.[1] ?? 0)));
const next = incoming.map((record, index) => {
  if (record.id !== `NC-${previousMax + index + 1}` || existingIds.has(record.id) || existingSlugs.has(record.slug)) {
    throw new Error(`Nonsequential or duplicate ID/slug: ${record.id} / ${record.slug}`);
  }
  if (record.verification === 'Published' || record.directions_url || record.verified_entrance || record.visitor_hours) {
    throw new Error(`${record.id}: approval/visitor fields are forbidden in an expansion batch`);
  }
  existingIds.add(record.id);
  existingSlugs.add(record.slug);
  return {
    id: record.id, slug: record.slug, name_ar: record.name_ar, name_en: record.name_en || '',
    aliases: record.aliases || [], kind: record.kind, role: record.role, zone: record.zone,
    address: record.address, building_code: record.building_code || '',
    address_precision: record.address_precision, service_type: record.service_type || '',
    service_availability: 'Unknown', public_access: 'Unknown', visitor_hours: '', office_hours: '',
    phone: record.phone || '', email: record.email || '', website: record.website || '',
    source_url: record.source_url, source_category: record.source_category || '',
    last_checked: batch.checked_at, verification: record.verification,
    directions_url: '', verified_entrance: false
  };
});

const result = {...snapshot, checked_at: batch.checked_at, places: [...snapshot.places, ...next]};
const errors = validateDataset(result, 'exploration');
if (errors.length) throw new Error(`Dataset failed validation:\n${errors.join('\n')}`);
if (writing) writeFileSync(snapshotPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`${writing ? 'Appended' : 'Dry run:'} ${next.length} research records; total ${result.places.length}. Published unchanged.`);
