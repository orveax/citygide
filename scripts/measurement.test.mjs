import test from 'node:test';
import assert from 'node:assert/strict';
import { measurementPayload, resultBucket, MEASUREMENT_TYPES, emitMeasurement } from './measurement.mjs';

test('CG-MUX-10 anonymous measurement buckets do not encode raw queries or place identities',()=>{
 assert.equal(resultBucket(0),'0');assert.equal(resultBucket(1),'1');assert.equal(resultBucket(4),'2-5');
 assert.equal(resultBucket(18),'6-20');assert.equal(resultBucket(300),'21+');
 const event=measurementPayload('search_submitted',{context:'directory',resultCount:117,filterCount:2,query:'personal secret',placeId:'NC-55',url:'https://example.com'});
 assert.deepEqual(event,{schema:1,event:'search_submitted',context:'directory',result_bucket:'21+',filter_bucket:'2-5'});
 assert.ok(!JSON.stringify(event).includes('personal secret'));
 assert.equal(measurementPayload('unknown',{}),null);
 assert.equal(MEASUREMENT_TYPES.includes('maps_action'),true);
});
test('CG-MUX-10 map event differentiates safe search from verified directions',()=>{
 assert.deepEqual(measurementPayload('maps_action',{context:'place',action:'search'}),{schema:1,event:'maps_action',context:'place',action:'search'});
 assert.equal(measurementPayload('maps_action',{context:'place',action:'directions'}).action,'directions');
 assert.equal(measurementPayload('maps_action',{context:'place',action:'untrusted'}).action,'none');
});
test('CG-MUX-10 instrumentation stays inert without a client listener',()=>{
 assert.equal(emitMeasurement('search_submitted',{context:'home'}),false);
});
