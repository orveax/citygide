// CG-PUBLISH-05. Search indexing is an explicit editorial release independent of data and visit approval.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

export function createSearchPlan(config,seoReport){
 const errors=[];
 if(config?.schema_version!=='1.0')errors.push('Invalid launch configuration');
 const origin=config?.primary_origin;
 let validOrigin=false;
 try {
  const u=new URL(origin);
  validOrigin=u.protocol==='https:'&&u.pathname==='/'&&!u.search&&!u.hash&&
    !u.hostname.endsWith('.pages.dev')&&u.hostname!=='pages.dev'&&u.origin===origin;
 }catch{}
 if(config?.indexing_enabled&&!validOrigin)errors.push('Production indexing requires a permanent HTTPS domain, not pages.dev');
 if(config?.indexing_enabled&&!config.domain_verified)errors.push('Permanent domain must be connected and verified');
 if(config?.indexing_enabled&&!config.pages_dev_redirect_verified)errors.push('Pages development host redirect must be verified');
 if(config?.indexing_enabled&&!config.search_console_verified)errors.push('Google Search Console domain ownership must be verified');
 const candidates=new Map((seoReport?.candidates||[]).map(x=>[x.id,x]));
 const approvals=config?.editorial_approvals||[];
 if(!Array.isArray(approvals))errors.push('Editorial approvals must be an array');
 else{
  if(new Set(approvals.map(x=>x.id)).size!==approvals.length)errors.push('Duplicate approval ID');
  for(const item of approvals){
   if(!item||typeof item.id!=='string'||typeof item.reviewer!=='string'||!item.reviewer.trim()||
      !/^20\d{2}-\d{2}-\d{2}$/.test(item.approved_on||'')||item.decision!=='index')
     errors.push('Approval must have ID, reviewer, approved_on and explicit index decision');
   else if(!candidates.has(item.id))errors.push('Approval not in currently qualified candidate set: '+item.id);
  }
 }
 if(config?.indexing_enabled&&!(approvals?.length>0))errors.push('No individually approved pages to index');
 const approved=errors.length?[]:approvals.map(a=>candidates.get(a.id)).filter(Boolean);
 return {release_enabled:Boolean(config?.indexing_enabled)&&errors.length===0,errors,
  origin:validOrigin?origin:null,approved,approved_count:approved.length,
  indexing_policy:'No page indexes without explicit qualifying evidence, editor approval, domain/redirect and Search Console verification.'};
}
const xmlEscape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function applySearchPlan(dist,plan){
 if(plan.errors.length)throw Error('CG-PUBLISH-05 Search Launch gate: '+plan.errors.join('; '));
 const files=plan.approved.map(p=>({path:p.path.replace(/^\//,''),url:plan.origin+p.path}));
 if(plan.release_enabled){
  for(const {path,url} of files){
   if(!/^places\/[a-z0-9-]+\.html$/.test(path)||!existsSync(join(dist,path)))throw Error('Missing or unsafe approved route '+path);
   let html=readFileSync(join(dist,path),'utf8');
   if(!/<meta name="robots" content="noindex,nofollow">/.test(html))throw Error('Approved page lacks explicit index gate '+path);
   html=html.replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow">');
   html=html.replace('</head>','<link rel="canonical" href="'+xmlEscape(url)+'"></head>');
   writeFileSync(join(dist,path),html);
  }
  // Restrictive meta robots stay on every excluded HTML page. Do not apply a global
  // noindex header that would override individually approved pages.
  writeFileSync(join(dist,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/data/*\n  X-Robots-Tag: noindex\n');
  const xml=['<?xml version="1.0" encoding="UTF-8"?>',
   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
   ...files.map(x=>'  <url><loc>'+xmlEscape(x.url)+'</loc></url>'),
   '</urlset>',''].join('\n');
  writeFileSync(join(dist,'sitemap.xml'),xml);
  writeFileSync(join(dist,'robots.txt'),['User-agent: *','Allow: /','Sitemap: '+plan.origin+'/sitemap.xml',''].join('\n'));
 }else{
  // Production remains noindex; NEVER create a production sitemap without approvals.
  if(existsSync(join(dist,'sitemap.xml')))throw Error('Unexpected production sitemap while indexing is on hold');
  const headers=readFileSync(join(dist,'_headers'),'utf8');
  if(!headers.includes('X-Robots-Tag: noindex'))throw Error('Noindex header missing during launch hold');
 }
 const report={schema_version:'1.0',public_indexing_enabled:plan.release_enabled,
   permanent_origin:plan.origin,approved_count:plan.release_enabled?files.length:0,
   status:plan.release_enabled?'CONTROLLED_RELEASE':'HOLD_NO_DOMAIN_OR_APPROVAL',
   sitemap_production:plan.release_enabled?'sitemap.xml':null,
   notes:'Sitemap-preview.xml is a research artifact and must never be submitted to Search Console.'};
 writeFileSync(join(dist,'data','search-launch-report.json'),JSON.stringify(report,null,2));
 return report;
}
