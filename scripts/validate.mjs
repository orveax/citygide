import { readFileSync } from 'node:fs';

export const PUBLIC_KEYS = new Set(['id','slug','name_ar','name_en','aliases','kind','role','zone','address','building_code','address_precision','service_type','service_availability','public_access','visitor_hours','office_hours','phone','email','website','source_url','source_category','last_checked','verification','directions_url','verified_entrance']);
const ROLES = new Set(['Administrative HQ','Public Service Point','Facility','District']);
const VERIFICATIONS = new Set(['Research','Source Confirmed','Contact Verified','Published']);
const PRECISIONS = new Set(['District Only','Building Confirmed','Floor Confirmed','Entrance Confirmed','Pin Verified']);
const HTTPS_KEYS = ['source_url','website','directions_url'];

export function validateDataset(dataset, mode = 'production') {
  const errors = [];
  if (dataset?.schema_version !== '0.1') errors.push('schema_version must be 0.1');
  if (!Array.isArray(dataset?.places)) return ['places must be an array', ...errors];
  const slugs = new Set(), ids = new Set();
  dataset.places.forEach((p, i) => {
    const tag = `places[${i}]`;
    for (const key of Object.keys(p)) if (!PUBLIC_KEYS.has(key)) errors.push(`${tag}: private/unknown field ${key}`);
    for (const key of ['id','slug','name_ar','kind','role','zone','address','address_precision','source_url','last_checked','verification']) {
      if (typeof p[key] !== 'string' || !p[key].trim()) errors.push(`${tag}: missing ${key}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug || '')) errors.push(`${tag}: invalid slug`);
    if (slugs.has(p.slug)) errors.push(`${tag}: duplicate slug`); slugs.add(p.slug);
    if (ids.has(p.id)) errors.push(`${tag}: duplicate id`); ids.add(p.id);
    if (!ROLES.has(p.role)) errors.push(`${tag}: invalid role`);
    if (!PRECISIONS.has(p.address_precision)) errors.push(`${tag}: invalid precision`);
    if (!VERIFICATIONS.has(p.verification)) errors.push(`${tag}: invalid verification`);
    if (mode === 'production' && p.verification !== 'Published') errors.push(`${tag}: not editorially Published`);
    if (mode === 'preview' && p.verification === 'Research') errors.push(`${tag}: Research cannot appear in preview`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.last_checked || '')) errors.push(`${tag}: invalid checked date`);
    for (const key of HTTPS_KEYS) if (p[key] && !/^https:\/\/[^\s]+$/i.test(p[key])) errors.push(`${tag}: invalid ${key}`);
    if (p.directions_url && !(p.verified_entrance && ['Entrance Confirmed','Pin Verified'].includes(p.address_precision))) errors.push(`${tag}: directions require verified entrance/pin`);
    if (p.visitor_hours && p.public_access === 'Unknown') errors.push(`${tag}: visitor hours conflict with unknown public access`);
    if (p.aliases !== undefined && (!Array.isArray(p.aliases) || !p.aliases.every(a => typeof a === 'string'))) errors.push(`${tag}: aliases must be strings`);
  });
  return errors;
}

if (process.argv[1]?.endsWith('validate.mjs')) {
  const file = process.argv[2];
  const mode = process.argv[3] || 'production';
  if (!file) { console.error('Usage: node validate.mjs <json-file> [preview|production]'); process.exit(2); }
  const errors = validateDataset(JSON.parse(readFileSync(file, 'utf8')), mode);
  if (errors.length) { errors.forEach(e => console.error(e)); process.exitCode = 1; }
  else console.log(`Validated ${JSON.parse(readFileSync(file, 'utf8')).places.length} ${mode} records`);
}
