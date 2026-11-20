import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDetailRoutes} from './static-detail-routes.mjs';

test('CG-PUBLISH-02 creates distinct page paths without promoting visitor permissions',()=>{
 const dist=mkdtempSync(join(tmpdir(),'city-guide-routes-'));
 try{
  writeFileSync(join(dist,'explore-place.html'),'<html><head><title>Detail</title></head><body data-catalog="exploration"><h1 id="title">Loading</h1>Visitor access unverified</body></html>');
  writeFileSync(join(dist,'alamein.html'),'<html><head><title>Alamein</title></head><body><h1 id="alameinPageTitle">Loading</h1>Research only</body></html>');
  const records={places:[{id:'NC-43',slug:'nc-43-explore',name_ar:'مركز <خاص>',address:'منطقة العاصمة الإدارية',verification:'Source Confirmed'},{id:'NC-203',slug:'nc-203-explore',name_ar:'جهة رسمية',address:'الحي الحكومي',verification:'Research'}]};
  const cities=[{id:'ALM-001',name:'خدمة العلمين',address:'العلمين الجديدة',source_url:'https://example.org/source'}];
  const counts=buildDetailRoutes(dist,records,cities);
  assert.deepEqual(counts,{capital:2,alamein:1});
  for(const rel of ['places/nc-43-explore.html','places/nc-203-explore.html','alamein/ALM-001.html']){
   assert.ok(existsSync(join(dist,rel)),rel);
   assert.match(readFileSync(join(dist,rel),'utf8'),/<base href="\/"/);
  }
  assert.match(readFileSync(join(dist,'places/nc-43-explore.html'),'utf8'),/Visitor access unverified/);
  const capitalHtml=readFileSync(join(dist,'places/nc-43-explore.html'),'utf8');
  assert.match(capitalHtml,/<title>مركز &lt;خاص&gt; \| العاصمة الإدارية الجديدة/);
  assert.match(capitalHtml,/<meta name="description"/);
  assert.match(capitalHtml,/<h1 id="title">مركز &lt;خاص&gt;<\/h1>/);
  assert.doesNotMatch(capitalHtml,/<h1 id="title">مركز <خاص>/);
  const alameinHtml=readFileSync(join(dist,'alamein/ALM-001.html'),'utf8');
  assert.match(alameinHtml,/<h1 id="alameinPageTitle">خدمة العلمين<\/h1>/);
  assert.throws(()=>buildDetailRoutes(dist,records,[...cities,...cities]),/duplicate/);
 }finally{rmSync(dist,{recursive:true,force:true});}
});
