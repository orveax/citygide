// CG-PUBLISH-02: stable, path-based detail URLs for privacy-preserving per-place pageview reporting.
// Cloudflare Web Analytics does not report query strings; do not fabricate counters.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {canonicalizePlaces} from './catalog.mjs';
const safeSlug=value=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const withBase=html=>html.replace('<head>','<head><base href="/">');
export function buildDetailRoutes(dist,capital,alamein){
 const publicPlaces=canonicalizePlaces(capital.places);
 const capDir=join(dist,'places'),almDir=join(dist,'alamein');
 mkdirSync(capDir,{recursive:true});mkdirSync(almDir,{recursive:true});
 const capitalTemplate=withBase(readFileSync(join(dist,'explore-place.html'),'utf8'));
 const alameinTemplate=withBase(readFileSync(join(dist,'alamein.html'),'utf8'));
 for(const place of publicPlaces){
  if(!safeSlug(place.slug))throw Error('Invalid public place slug: '+place.id);
  writeFileSync(join(capDir,place.slug+'.html'),capitalTemplate);
 }
 const alameinIds=new Set();
 for(const place of alamein){
  if(!/^ALM-\d{3}$/.test(place.id)||alameinIds.has(place.id))throw Error('Invalid or duplicate Alamein record: '+place.id);
  if(!/^https:\/\/[^\s]+$/i.test(place.source_url||''))throw Error('Unattributed Alamein source: '+place.id);
  alameinIds.add(place.id);
  writeFileSync(join(almDir,place.id+'.html'),alameinTemplate);
 }
 return {capital:publicPlaces.length,alamein:alameinIds.size};
}
