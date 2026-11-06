import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApprovedDataset, contentHash, queryNotionPublished, toPublicRecord, validatePublishedAgainstApprovals, NOTION_VERSION } from './notion-publisher.mjs';

const rt = value => ({ rich_text: [{ plain_text: value }] });
const pick = value => ({ select: { name: value } });
const fakePage = (verification = 'Published') => ({
  object: 'page', id: 'cce9c4cb-3da1-40a3-aad5-43d72d11b645', archived: false,
  properties: {
    'Place ID': { unique_id: { prefix: 'NC', number: 32 } },
    'Name': { title: [{ plain_text: 'وزارة الاتصالات' }] },
    'Name EN': rt('Communications Ministry'),
    'Search Aliases': rt('MCIT، وزارة الاتصالات'),
    'Page Slug': rt('ministry-of-communications-new-capital'),
    'Kind': pick('Government'),
    'Location Role': pick('Administrative HQ'),
    'Zone': pick('Government District'),
    'Address': rt('مبنى 10B-L2M، الحي الحكومي'),
    'Building Code': rt('10B-L2M'),
    'Address Precision': pick('Building Confirmed'),
    'Service Type': rt(''),
    'Service Availability': pick('Unknown'),
    'Public Access': pick('Unknown'),
    'Visitor Hours': rt(''),
    'Public Hours': rt('الأحد–الخميس 09:00–17:00'),
    'Phone': { phone_number: '+20235341300' },
    'Email': { email: '' },
    'Website': { url: 'https://mcit.gov.eg/' },
    'Official Source': { url: 'https://mcit.gov.eg/ar/contact_us' },
    'Source Category': pick('Official Authority'),
    'Last Checked': { date: { start: '2026-11-06' } },
    'Verification': { status: { name: verification } },
    'Directions URL': { url: null },
    'Visitor Entrance': rt(''),
    'Notes': rt('INTERNAL NEVER EXPORT'),
    'Verified By': rt('Private editorial note')
  }
});

const approvalFor = page => {
  const record = toPublicRecord(page);
  return { page_id: page.id, place_id: record.id, approved_by: 'Mohamed Adel', approved_at: '2026-11-06', content_sha256: contentHash(record) };
};

test('Notion mapping allows public fields only and never repurposes office hours', () => {
  const record = toPublicRecord(fakePage());
  assert.equal(record.id, 'NC-32');
  assert.deepEqual(record.aliases, ['MCIT', 'وزارة الاتصالات']);
  assert.equal(record.visitor_hours, '');
  assert.equal(record.office_hours, '');
  assert.equal(record.verified_entrance, false);
  assert.ok(!JSON.stringify(record).includes('INTERNAL NEVER EXPORT'));
  assert.ok(!('Notes' in record));
});

test('Published status PLUS exact founder signoff builds a safe dataset', () => {
  const page = fakePage();
  const manifest = { schema_version: '0.1', approvals: [approvalFor(page)] };
  const dataset = buildApprovedDataset([page], manifest, '2026-11-06');
  assert.equal(dataset.places.length, 1);
  assert.deepEqual(validatePublishedAgainstApprovals(dataset, manifest), []);
  assert.equal(dataset.places[0].verification, 'Published');
});

test('No founder approval means fail closed, even if Notion says Published', () => {
  assert.throws(() => buildApprovedDataset([fakePage()], { schema_version: '0.1', approvals: [] }, '2026-11-06'), /Founder approval missing/);
});

test('Source Confirmed is never emitted through the publishing path', () => {
  const page = fakePage('Source Confirmed');
  assert.throws(() => buildApprovedDataset([page], { schema_version: '0.1', approvals: [approvalFor(page)] }, '2026-11-06'), /Non-Published/);
});

test('Changed public content invalidates prior founder approval', () => {
  const page = fakePage();
  const manifest = { schema_version: '0.1', approvals: [approvalFor(page)] };
  page.properties.Phone.phone_number = '+20000000000';
  assert.throws(() => buildApprovedDataset([page], manifest, '2026-11-06'), /does not match/);
});

test('Unverified direction cannot be exported even with a matching approval', () => {
  const page = fakePage();
  page.properties['Directions URL'].url = 'https://maps.google.com/?q=example';
  assert.throws(() => buildApprovedDataset([page], { schema_version: '0.1', approvals: [approvalFor(page)] }, '2026-11-06'), /directions require verified entrance/);
});

test('Production build rejects manually injected Published rows without approved hash', () => {
  const dataset = { places: [toPublicRecord(fakePage())] };
  assert.match(validatePublishedAgainstApprovals(dataset, { schema_version: '0.1', approvals: [] }).join(' '), /founder-approved/);
});

test('Notion API query filters Published records and paginates with private bearer token', async () => {
  const seen = [];
  const request = async (url, options) => {
    seen.push({ url, options });
    const body = JSON.parse(options.body);
    assert.equal(body.filter.status.equals, 'Published');
    return { ok: true, json: async () => ({ results: [{ id: seen.length === 1 ? 'a' : 'b' }], has_more: seen.length === 1, next_cursor: seen.length === 1 ? 'cursor-1' : null }) };
  };
  const pages = await queryNotionPublished('private-test-token', 'known-source-id', request);
  assert.deepEqual(pages.map(p => p.id), ['a', 'b']);
  assert.equal(seen[1].options.headers['Notion-Version'], NOTION_VERSION);
  assert.equal(JSON.parse(seen[1].options.body).start_cursor, 'cursor-1');
  assert.ok(seen[0].url.endsWith('/data_sources/known-source-id/query'));
});

test('Empty Notion feed and no approvals yields a safe zero-record candidate', () => {
  assert.deepEqual(buildApprovedDataset([], { schema_version: '0.1', approvals: [] }, '2026-11-06').places, []);
});
