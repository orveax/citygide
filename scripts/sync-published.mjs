import { readFileSync, mkdirSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentHash, buildApprovedDataset, queryNotionPublished } from './notion-publisher.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = name => args.includes(name);
const value = name => { const at = args.indexOf(name); return at === -1 ? undefined : args[at + 1]; };

async function main() {
  const source = value('--input');
  const pages = source
    ? JSON.parse(readFileSync(resolve(source), 'utf8'))
    : await queryNotionPublished(process.env.NOTION_API_TOKEN);
  const manifest = JSON.parse(readFileSync(join(root, 'data/publication-approvals.json'), 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  const dataset = buildApprovedDataset(pages, manifest, today);

  const publishedPath = join(root, 'data/published.json');
  const previous = JSON.parse(readFileSync(publishedPath, 'utf8'));
  const oldIds = new Set(previous.places.map(p => p.id));
  const newIds = new Set(dataset.places.map(p => p.id));
  const removals = [...oldIds].filter(id => !newIds.has(id));
  if (removals.length && !option('--allow-removal')) throw new Error(`Release removes ${removals.join(', ')}; explicit --allow-removal required`);
  if (dataset.places.length === 0 && !option('--allow-empty')) {
    if (option('--write')) throw new Error('Empty publish requires explicit --allow-empty');
  }

  console.log(`Ready: ${dataset.places.length} individually approved Published records; ${removals.length} removals; ${option('--write') ? 'write requested' : 'dry-run only'}.`);
  if (!option('--write')) return;

  const fingerprint = contentHash(dataset).slice(0, 12);
  const history = join(root, 'data/releases');
  mkdirSync(history, { recursive: true });
  const archivePath = join(history, `${today}-${fingerprint}.json`);
  if (!existsSync(archivePath)) writeFileSync(archivePath, JSON.stringify(dataset, null, 2) + '\n', { flag: 'wx' });
  const pending = join(root, 'data/.published.pending.json');
  writeFileSync(pending, JSON.stringify(dataset, null, 2) + '\n');
  renameSync(pending, publishedPath);
  console.log(`Saved public-only release snapshot ${today}-${fingerprint}.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
