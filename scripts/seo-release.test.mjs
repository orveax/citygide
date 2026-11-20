import test from 'node:test';
import assert from 'node:assert/strict';
import {assessSEO} from './seo-release.mjs';
test('CG-PUBLISH-04 nominates only sufficiently evidenced public records; never auto-indexes',()=>{
 const capital={places:[
  {id:'NC-1',slug:'nc-1-explore',name_ar:'جهة موثقة',address:'الحي الحكومي',source_url:'https://example.org/authority',verification:'Source Confirmed',directions_url:'',verified_entrance:false},
  {id:'NC-2',slug:'nc-2-explore',name_ar:'سجل أولي',address:'حي المال',source_url:'https://example.org/research',verification:'Research'},
  {id:'NC-3',slug:'nc-3-explore',name_ar:'عنوان متعارض',address:'عنوان',source_url:'https://example.org/contact',verification:'Source Confirmed'}
 ]};
 const details={records:{'NC-1':{evidence_scope:'A primary-source page explicitly establishes the listed administrative address; entrance unknown.'},'NC-2':{},'NC-3':{evidence_scope:'A primary-source page explicitly establishes a general registered address.',audit_state:'Conflict hold'}}};
 const result=assessSEO(capital,details,[{id:'ALM-005',state:'Conflict hold'}]);
 assert.equal(result.public_indexing_enabled,false);
 assert.equal(result.totals.capital_review_candidates,1);
 assert.deepEqual(result.candidates.map(p=>p.id),['NC-1']);
 assert.equal(result.totals.alamein_hold,1);
 assert.ok(result.holds.some(p=>p.id==='NC-3'&&p.reasons.some(r=>r.includes('conflict'))));
});
