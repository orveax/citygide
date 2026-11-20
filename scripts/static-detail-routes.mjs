// CG-PUBLISH-02: stable, path-based detail URLs for privacy-preserving per-place pageview reporting.
// Cloudflare Web Analytics does not report query strings; do not fabricate counters.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {canonicalizePlaces} from './catalog.mjs';
const safeSlug=value=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const withBase=html=>html.replace('<head>','<head><base href="/">');
const escapeHTML=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const metaDetail=(html,{name,city,description,headingId})=>{
 const title=escapeHTML(name)+' | '+escapeHTML(city)+' | City Guide';
 const desc=escapeHTML(String(description||'معلومات موثقة بالمصادر؛ راجع حالة التشغيل والزيارة قبل التحرك.').slice(0,180));
 let output=html.replace(/<title>[^<]*<\/title>/,'<title>'+title+'</title>');
 output=output.replace('</head>','<meta name="description" content="'+desc+'"></head>');
 if(name){
   const marker='<h1 id="'+headingId+'">';
   const start=output.indexOf(marker);
   if(start>=0){const end=output.indexOf('</h1>',start);if(end>=0)output=output.slice(0,start)+marker+escapeHTML(name)+output.slice(end);}
 }
 return output;
};
export function buildDetailRoutes(dist,capital,alamein){
 const publicPlaces=canonicalizePlaces(capital.places);
 const capDir=join(dist,'places'),almDir=join(dist,'alamein');
 mkdirSync(capDir,{recursive:true});mkdirSync(almDir,{recursive:true});
 const capitalTemplate=withBase(readFileSync(join(dist,'explore-place.html'),'utf8'));
 const alameinTemplate=withBase(readFileSync(join(dist,'alamein.html'),'utf8'));
 for(const place of publicPlaces){
  if(!safeSlug(place.slug))throw Error('Invalid public place slug: '+place.id);
  writeFileSync(join(capDir,place.slug+'.html'),metaDetail(capitalTemplate,{name:place.name_ar,city:'العاصمة الإدارية الجديدة',description:place.address+' — حالة السجل: '+(place.verification||'بحثي')+'؛ دخول الزوار حسب المعلومات الموضحة في الصفحة.',headingId:'title'}));
 }
 const alameinIds=new Set();
 for(const place of alamein){
  if(!/^ALM-\d{3}$/.test(place.id)||alameinIds.has(place.id))throw Error('Invalid or duplicate Alamein record: '+place.id);
  if(!/^https:\/\/[^\s]+$/i.test(place.source_url||''))throw Error('Unattributed Alamein source: '+place.id);
  alameinIds.add(place.id);
  writeFileSync(join(almDir,place.id+'.html'),metaDetail(alameinTemplate,{name:place.name,city:'العلمين الجديدة',description:place.address+' — سجل استكشافي، راجع المصدر وشروط الزيارة.',headingId:'alameinPageTitle'}));
 }
 return {capital:publicPlaces.length,alamein:alameinIds.size};
}
