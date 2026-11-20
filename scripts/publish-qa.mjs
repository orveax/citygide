// CG-PUBLISH-02: production route & measurement acceptance. Never invent counters.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalizePlaces } from './catalog.mjs';
const analytics='static.cloudflareinsights.com/beacon.min.js';
export function auditPublication(dist,capital,alamein){
  const errors=[];
  const routes=[];
  for(const place of canonicalizePlaces(capital.places)){
    if(!place.slug||!place.id)errors.push('Missing capital identity');
    else routes.push({id:place.id,path:'places/'+place.slug+'.html',kind:'capital'});
  }
  for(const place of alamein)routes.push({id:place.id,path:'alamein/'+place.id+'.html',kind:'alamein'});
  const paths=new Set(),ids=new Set();
  for(const {id,path,kind} of routes){
    if(ids.has(id))errors.push('Duplicate public record id '+id);
    ids.add(id);
    if(paths.has(path))errors.push('Duplicate public route '+path);
    paths.add(path);
    const filepath=join(dist,path);
    if(!existsSync(filepath)){errors.push('Missing detail route '+path);continue;}
    const html=readFileSync(filepath,'utf8');
    if(!html.includes('<base href="/">'))errors.push('Missing correct relative-path base '+path);
    if(!html.includes(analytics))errors.push('Missing analytics beacon '+path);
    if(!html.includes('noindex,nofollow'))errors.push('Missing index release gate '+path);
    if(kind==='capital'&&!html.includes('data-catalog="exploration"'))errors.push('Wrong capital detail catalogue '+path);
    if(kind==='alamein'&&!html.includes('scripts/alamein.mjs'))errors.push('Wrong Alamein detail handler '+path);
  }
  for(const scriptName of ['buildings-page.mjs','services-page.mjs']){
    const source=readFileSync(join(dist,'scripts',scriptName),'utf8');
    if(source.includes('explore-place.html?slug='))errors.push('Legacy duplicate detail URLs in '+scriptName);
    if(!source.includes("'places/'"))errors.push('Missing stable detail routes in '+scriptName);
  }
  const alameinPage=readFileSync(join(dist,'alamein.html'),'utf8');
  if(!alameinPage.includes('class="mobile-nav"')||!alameinPage.includes('aria-label="التنقل للموبايل"'))errors.push('Alamein mobile navigation missing');
  const privacy=readFileSync(join(dist,'privacy.html'),'utf8');
  if(!privacy.includes('Cloudflare Web Analytics'))errors.push('Outdated privacy: analytics not disclosed');
  for(const name of ['index.html','directory.html','alamein.html','explore-place.html']){
    const html=readFileSync(join(dist,name),'utf8');
    if(!html.includes(analytics))errors.push('Missing analytics on '+name);
  }
  return {errors,capital:routes.filter(r=>r.kind==='capital').length,alamein:routes.filter(r=>r.kind==='alamein').length};
}
