import { createHash } from 'node:crypto';
import { validateDataset } from './validate.mjs';

// Exact source from the City Guide Places & Organizations database in Notion.
export const NOTION_DATA_SOURCE_ID = '8903b5e7-eca2-448b-9004-7b565eda97d5';
export const NOTION_VERSION = '2026-03-11';

const property = (page, name) => page.properties?.[name] || {};
const plain = segments => Array.isArray(segments) ? segments.map(s => s.plain_text ?? s.text?.content ?? '').join('').trim() : '';
const label = (page, name) => property(page, name).select?.name || property(page, name).status?.name || '';
const text = (page, name) => plain(property(page, name).title || property(page, name).rich_text);
const direct = (page, name, type) => property(page, name)[type] || '';

export function toPublicRecord(page) {
  if (page?.object !== 'page' || page.archived === true || page.in_trash === true) throw new Error('Invalid or archived Notion place');
  const number = property(page, 'Place ID').unique_id;
  if (!number || !Number.isSafeInteger(number.number)) throw new Error('Notion Place ID is missing');
  const id = `${number.prefix || 'NC'}-${number.number}`;
  const precision = label(page, 'Address Precision') || 'District Only';
  const entrance = text(page, 'Visitor Entrance');
  const aliases = text(page, 'Search Aliases').split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);
  return {
    id,
    slug: text(page, 'Page Slug'),
    name_ar: text(page, 'Name'),
    name_en: text(page, 'Name EN'),
    aliases,
    kind: label(page, 'Kind'),
    role: label(page, 'Location Role'),
    zone: label(page, 'Zone'),
    address: text(page, 'Address'),
    building_code: text(page, 'Building Code'),
    address_precision: precision,
    service_type: text(page, 'Service Type'),
    service_availability: label(page, 'Service Availability') || 'Unknown',
    public_access: label(page, 'Public Access') || 'Unknown',
    visitor_hours: text(page, 'Visitor Hours'),
    // The legacy "Public Hours" field is ambiguous and must not become visitor hours.
    office_hours: '',
    phone: direct(page, 'Phone', 'phone_number'),
    email: direct(page, 'Email', 'email'),
    website: direct(page, 'Website', 'url'),
    source_url: direct(page, 'Official Source', 'url'),
    source_category: label(page, 'Source Category'),
    last_checked: direct(page, 'Last Checked', 'date')?.start?.slice(0, 10) || '',
    verification: label(page, 'Verification'),
    directions_url: direct(page, 'Directions URL', 'url'),
    verified_entrance: Boolean(entrance && ['Entrance Confirmed', 'Pin Verified'].includes(precision))
  };
}

// Content-locked approval: a changed telephone, title or disclaimer invalidates sign-off.
export function contentHash(record) {
  return createHash('sha256').update(JSON.stringify(record)).digest('hex');
}

export function validatePublishedAgainstApprovals(dataset, manifest) {
  const errors = [];
  if (manifest?.schema_version !== '0.1' || !Array.isArray(manifest.approvals)) return ['Invalid approval manifest'];
  const byPlaceId = new Map();
  for (const item of manifest.approvals) {
    if (!item.place_id || byPlaceId.has(item.place_id)) errors.push('Missing or duplicate approval place ID');
    byPlaceId.set(item.place_id, item);
  }
  for (const place of dataset.places || []) {
    const approval = byPlaceId.get(place.id);
    if (!approval || approval.approved_by !== 'Mohamed Adel' || !/^\d{4}-\d{2}-\d{2}$/.test(approval.approved_at || '') || approval.content_sha256 !== contentHash(place)) {
      errors.push(`Record ${place.id} lacks exact founder-approved public content`);
    }
  }
  return errors;
}

export function buildApprovedDataset(pages, manifest, checkedAt) {
  if (!Array.isArray(pages)) throw new Error('Notion pages must be an array');
  if (manifest?.schema_version !== '0.1' || !Array.isArray(manifest.approvals)) throw new Error('Invalid approval manifest');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) throw new Error('Invalid export date');

  const seen = new Set();
  const approved = new Map();
  for (const entry of manifest.approvals) {
    if (!entry.page_id || seen.has(entry.page_id)) throw new Error('Duplicate or missing page approval');
    if (entry.approved_by !== 'Mohamed Adel' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.approved_at || '')) throw new Error('Founder sign-off metadata is required');
    if (!/^[a-f0-9]{64}$/.test(entry.content_sha256 || '')) throw new Error('Invalid approved content hash');
    seen.add(entry.page_id);
    approved.set(entry.page_id, entry);
  }

  const publicPlaces = [];
  for (const page of pages) {
    if (page?.object !== 'page' || !page.id) throw new Error('Notion page ID is missing');
    const state = label(page, 'Verification');
    if (state !== 'Published') throw new Error(`Non-Published source row in publishing export: ${page.id}`);
    const item = approved.get(page.id);
    if (!item) throw new Error(`Founder approval missing for Published page ${page.id}`);
    const record = toPublicRecord(page);
    if (item.place_id !== record.id || item.content_sha256 !== contentHash(record)) {
      throw new Error(`Approval does not match current public content for ${record.id}`);
    }
    publicPlaces.push(record);
    approved.delete(page.id);
  }
  if (approved.size) throw new Error(`Stale approval(s) found for ${[...approved.keys()].join(', ')}`);
  publicPlaces.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));

  const dataset = { schema_version: '0.1', mode: 'production', checked_at: checkedAt, places: publicPlaces };
  const errors = validateDataset(dataset, 'production');
  if (errors.length) throw new Error(`Public export rejected:\n${errors.join('\n')}`);
  return dataset;
}

export async function queryNotionPublished(token, dataSourceId = NOTION_DATA_SOURCE_ID, request = fetch) {
  if (!token) throw new Error('NOTION_API_TOKEN is required for private Notion sync');
  const results = [];
  const cursors = new Set();
  let cursor;
  do {
    const body = { page_size: 100, filter: { property: 'Verification', status: { equals: 'Published' } } };
    if (cursor) body.start_cursor = cursor;
    const response = await request(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Notion query failed (HTTP ${response.status})`);
    const payload = await response.json();
    if (!Array.isArray(payload.results) || typeof payload.has_more !== 'boolean') throw new Error('Invalid Notion response');
    results.push(...payload.results);
    if (results.length > 10000) throw new Error('Refusing unexpectedly large Notion result set');
    cursor = payload.has_more ? payload.next_cursor : undefined;
    if (payload.has_more && (!cursor || cursors.has(cursor))) throw new Error('Invalid Notion pagination');
    if (cursor) cursors.add(cursor);
  } while (cursor);
  return results;
}
