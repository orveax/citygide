// CG-PUBLISH-03: deterministic release inventory. Do not infer visitor approvals from source status.
import {canonicalizePlaces} from './catalog.mjs';
export function launchReadiness(capital,details,alamein){
 const entries=capital.places||[],visible=canonicalizePlaces(entries);
 const status=Object.fromEntries(['Published','Source Confirmed','Contact Verified','Research'].map(k=>[k,entries.filter(p=>p.verification===k).length]));
 const alameinStates={};for(const p of alamein)alameinStates[p.state||'Unspecified']=(alameinStates[p.state||'Unspecified']||0)+1;
 const ids=new Set(entries.map(p=>p.id));const detailIds=Object.keys(details.records||{});
 const missingSource=entries.filter(p=>!p.source_url).map(p=>p.id);
 const unsafeDirections=entries.filter(p=>p.directions_url&&!p.verified_entrance).map(p=>p.id);
 const brokenDetails=detailIds.filter(id=>!ids.has(id));
 const unapprovedDirections=alamein.filter(p=>p.access==='Unknown'&&p.directions_url).map(p=>p.id);
 const releaseBlocks=[];
 if(missingSource.length)releaseBlocks.push('Source URLs missing');
 if(unsafeDirections.length||unapprovedDirections.length)releaseBlocks.push('Unverified directions detected');
 if(brokenDetails.length)releaseBlocks.push('Orphaned Notion evidence records');
 releaseBlocks.push('Public search-index release requires explicit editorial approval and per-page quality review');
 releaseBlocks.push('Visitor entrance and service availability remain independently gated');
 return {
  schema_version:'1.0',checked_at:details.checked_at||capital.checked_at,
  indexing_status:'HOLD — noindex',indexing_enabled:false,
  inventory:{capital_total:entries.length,capital_discoverable:visible.length,capital_excluded:entries.length-visible.length,alamein_total:alamein.length,capital_verification_status:status,alamein_research_status:alameinStates},
  sync:{notion_master_rows:entries.length,matched_detail_rows:detailIds.filter(id=>ids.has(id)).length,missing_detail_rows:entries.filter(p=>!details.records?.[p.id]).map(p=>p.id)},
  validation:{missing_source_ids:missingSource,unsafe_direction_ids:unsafeDirections,orphan_detail_ids:brokenDetails},
  indexing_release_blocks:releaseBlocks,
  notes:'Source Confirmed means documentation of specified fields, not current operation, service eligibility or visitor access. No verification approval or visitor route has been invented.'
 };
}
