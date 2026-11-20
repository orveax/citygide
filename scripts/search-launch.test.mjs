import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,existsSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createSearchPlan,applySearchPlan} from './search-launch.mjs';

const seo={candidates:[{id:'NC-43',path:'/places/nc-43-explore.html'}]};
const approval={id:'NC-43',reviewer:'Editorial QA',approved_on:'2026-11-20',decision:'index'};
const base={schema_version:'1.0',primary_origin:null,domain_verified:false,
 pages_dev_redirect_verified:false,search_console_verified:false,indexing_enabled:false,editorial_approvals:[]};
const setup=()=>{
 const dir=mkdtempSync(join(tmpdir(),'cityguide-search-'));
 mkdirSync(join(dir,'data'));mkdirSync(join(dir,'places'));
 writeFileSync(join(dir,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n');
 writeFileSync(join(dir,'places/nc-43-explore.html'),'<html><head><meta name="robots" content="noindex,nofollow"><title>Place</title></head><body>Verified info; access unknown</body></html>');
 writeFileSync(join(dir,'places/nc-44-explore.html'),'<html><head><meta name="robots" content="noindex,nofollow"></head></html>');
 return dir;
};
test('CG-PUBLISH-05 keeps indexing on hold without permanent domain and review',()=>{
 const dir=setup();
 try{
  const plan=createSearchPlan(base,seo);assert.equal(plan.release_enabled,false);
  const report=applySearchPlan(dir,plan);assert.equal(report.approved_count,0);
  assert.equal(existsSync(join(dir,'sitemap.xml')),false);
  assert.match(readFileSync(join(dir,'_headers'),'utf8'),/noindex/);
  assert.match(readFileSync(join(dir,'places/nc-43-explore.html'),'utf8'),/noindex,nofollow/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('CG-PUBLISH-05 rejects pages.dev even if other flags are true',()=>{
 const p=createSearchPlan({...base,indexing_enabled:true,primary_origin:'https://citygide.pages.dev',
  domain_verified:true,pages_dev_redirect_verified:true,search_console_verified:true,editorial_approvals:[approval]},seo);
 assert.equal(p.release_enabled,false);assert.match(p.errors.join(' '),/permanent HTTPS domain/);
});
test('CG-PUBLISH-05 permits only explicitly approved, eligible record under permanent domain',()=>{
 const dir=setup();
 try{
  const plan=createSearchPlan({...base,indexing_enabled:true,primary_origin:'https://cityguide.example',
   domain_verified:true,pages_dev_redirect_verified:true,search_console_verified:true,editorial_approvals:[approval]},seo);
  assert.equal(plan.errors.length,0);
  assert.equal(plan.release_enabled,true);
  const report=applySearchPlan(dir,plan);
  assert.equal(report.approved_count,1);
  assert.match(readFileSync(join(dir,'sitemap.xml'),'utf8'),/https:\/\/cityguide.example\/places\/nc-43-explore.html/);
  assert.match(readFileSync(join(dir,'places/nc-43-explore.html'),'utf8'),/rel="canonical"/);
  assert.match(readFileSync(join(dir,'places/nc-44-explore.html'),'utf8'),/noindex,nofollow/);
  assert.doesNotMatch(readFileSync(join(dir,'_headers'),'utf8'),/\/\*\n  X-Robots-Tag: noindex/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('CG-PUBLISH-05 does not accept indexing approval for a held record',()=>{
 const p=createSearchPlan({...base,indexing_enabled:true,primary_origin:'https://cityguide.example',
  domain_verified:true,pages_dev_redirect_verified:true,search_console_verified:true,
  editorial_approvals:[{...approval,id:'NC-263'}]},seo);
 assert.equal(p.release_enabled,false);assert.match(p.errors.join(' '),/Approval not in/);
});
