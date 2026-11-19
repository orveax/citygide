import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDetailRoutes} from './static-detail-routes.mjs';

test('CG-PUBLISH-02 creates distinct page paths without promoting visitor permissions',()=>{
 const dist=mkdtempSync(join(tmpdir(),'city-guide-routes-'));
 try{
  writeFileSync(join(dist,'explore-place.html'),'<html><head><title>Detail</title></head><body data-catalog="exploration">Visitor access unverified</body></html>');
  writeFileSync(join(dist,'alamein.html'),'<html><head><title>Alamein</title></head><body>Research only</body></html>');
  const records={places:[{id:'NC-43',slug:'nc-43-explore'},{id:'NC-203',slug:'nc-203-explore'}]};
  const cities=[{id:'ALM-001',source_url:'https://example.org/source'}];
  const counts=buildDetailRoutes(dist,records,cities);
  assert.deepEqual(counts,{capital:2,alamein:1});
  for(const rel of ['places/nc-43-explore.html','places/nc-203-explore.html','alamein/ALM-001.html']){
   assert.ok(existsSync(join(dist,rel)),rel);
   assert.match(readFileSync(join(dist,rel),'utf8'),/<base href="\/"/);
  }
  assert.match(readFileSync(join(dist,'places/nc-43-explore.html'),'utf8'),/Visitor access unverified/);
  assert.throws(()=>buildDetailRoutes(dist,records,[...cities,...cities]),/duplicate/);
 }finally{rmSync(dist,{recursive:true,force:true});}
});
