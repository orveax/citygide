// CG-PUBLISH-04 — editorial SEO quality gate (preview only; does NOT authorize search indexing).
import {canonicalizePlaces} from './catalog.mjs';
const clean=value=>typeof value==='string'?value.trim():'';
const secureSource=url=>{try{const u=new URL(url);return u.protocol==='https:'&&Boolean(u.hostname)}catch{return false}};
const conflicting = v => /conflict|hold/i.test(clean(v));
export function assessSEO(capital,details,alamein){
 const all=capital.places||[],visible=canonicalizePlaces(all);
 const results=visible.map(p=>{
  const evidence=details.records?.[p.id]||{},reasons=[];
  if(!secureSource(p.source_url)) reasons.push('Missing HTTPS evidence source');
  if(!clean(p.name_ar)||!clean(p.address))reasons.push('Incomplete public identity/address');
  if(p.verification==='Research')reasons.push('Research-only identity');
  if(!['Published','Source Confirmed','Contact Verified'].includes(p.verification))reasons.push('No public source status');
  if(clean(evidence.evidence_scope).length<35)reasons.push('Insufficient field-specific evidence description');
  if(conflicting(evidence.audit_state)||conflicting(evidence.visitor_release_gate))reasons.push('Evidence conflict or release hold');
  if(p.directions_url&&!p.verified_entrance)reasons.push('Unverified visitor directions');
  return {id:p.id,path:'/places/'+p.slug+'.html',eligible_for_editorial_review:reasons.length===0,reasons};
 });
 const newAlamein=alamein.map(p=>({id:p.id,path:'/alamein/'+p.id+'.html',eligible_for_editorial_review:false,reasons:['New Alamein staging is source-intake research, not approved for public search indexing',...(conflicting(p.state)?['Conflict hold']:[])]}));
 const nominated=results.filter(p=>p.eligible_for_editorial_review);
 return {schema_version:'1.0',generated_at:'2026-11-20',publication_mode:'PRELAUNCH_HOLD',public_indexing_enabled:false,
  domain_status:'Custom domain not connected; Cloudflare Pages development host only',
  policy:'Eligible means editorial review candidate, not permission to index, operation confirmation or directions approval.',
  totals:{capital_records:all.length,capital_public_unique:visible.length,capital_review_candidates:nominated.length,capital_hold:results.length-nominated.length,alamein_hold:newAlamein.length},
  candidates:nominated.map(({id,path})=>({id,path})),
  holds:[...results.filter(p=>!p.eligible_for_editorial_review),...newAlamein],
  conditions_to_launch:['Connect and validate permanent branded domain','Complete editorial review of selected pages','Confirm domain-wide canonical URLs and redirects','Replace noindex/X-Robots-Tag hold and robots disallow on approved URLs only','Publish production sitemap and verify ownership in Google Search Console']};
}
