// CG-MUX-10: privacy-first, client-local event CONTRACT.
// No network calls, cookies, localStorage, sessionStorage, IDs, URLs, queries or names.
// Consumers may listen for "cityguide:measurement"; none is shipped by default.
// Do not silently send these events to an analytics provider.
export const MEASUREMENT_EVENT = 'cityguide:measurement';
export const MEASUREMENT_TYPES = Object.freeze([
  'search_submitted', 'filter_changed', 'no_results', 'place_opened',
  'service_opened', 'district_opened', 'building_opened', 'maps_action'
]);

const allowedTypes = new Set(MEASUREMENT_TYPES);
const allowedContexts = new Set(['home','directory','approved','place','services','buildings','districts']);
const allowedActions = new Set(['search','directions','none']);
export function resultBucket(value) {
  const n=Number(value);
  if (!Number.isSafeInteger(n)||n<=0)return '0';
  if(n===1)return '1';
  if(n<=5)return '2-5';
  if(n<=20)return '6-20';
  return '21+';
}
export function measurementPayload(type,{context='directory',resultCount,filterCount,action='none'}={}){
  if(!allowedTypes.has(type))return null;
  const payload={schema:1,event:type,context:allowedContexts.has(context)?context:'directory'};
  if(Number.isSafeInteger(resultCount)&&resultCount>=0)payload.result_bucket=resultBucket(resultCount);
  if(Number.isSafeInteger(filterCount)&&filterCount>=0)payload.filter_bucket=resultBucket(filterCount);
  if(type==='maps_action')payload.action=allowedActions.has(action)?action:'none';
  return Object.freeze(payload);
}
export function emitMeasurement(type,options={}){
  const payload=measurementPayload(type,options);
  if(!payload||typeof document==='undefined'||typeof CustomEvent==='undefined')return false;
  // Client-local DOM event only; no implied analytics collection or success claim.
  document.dispatchEvent(new CustomEvent(MEASUREMENT_EVENT,{detail:payload}));
  return true;
}
