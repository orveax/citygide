import { emitMeasurement } from './measurement.mjs';
import { canonicalizePlaces, sourceStatusLabel, visitStatusLabel } from './catalog.mjs';
import { SERVICE_PATHWAYS, serviceEntries } from './service-pathways.mjs';
const $ = id => document.getElementById(id);
const create = (tag, css, value) => {const el=document.createElement(tag); if(css)el.className=css;if(value!==undefined)el.textContent=value;return el;};
const anchor=(text,href,css='')=>{const el=create('a',css,text);el.href=href;return el;};
try {
  const response=await fetch('data/exploration.json',{cache:'no-store'});
  if(!response.ok)throw new Error('catalogue unavailable');
  const data=await response.json();
  if(data.mode!=='exploration'||!Array.isArray(data.places))throw new Error('invalid catalogue');
  const places=canonicalizePlaces(data.places);
  const permitted=new Set(['Research','Source Confirmed','Contact Verified','Published']);
  if(!places.every(p=>permitted.has(p.verification)))throw new Error('unapproved status');
  for(const group of SERVICE_PATHWAYS){
    const entries=serviceEntries(places,group);
    if(!entries.length)continue;
    $('serviceNav').append(anchor(group.label+' ('+entries.length+')','#service-'+group.id,'service-jump'));
    const section=create('section','service-group');
    section.id='service-'+group.id;
    const head=create('div','service-group__head');
    const title=create('h2','',group.label);
    head.append(title,create('p','',group.description),create('span','service-channel',group.channel));
    section.append(head);
    const list=create('div','service-entities');
    for(const place of entries){
      const article=create('article','service-entity');
      const main=create('div','service-entity__main');
      main.append(create('span','service-entity__location',place.zone==='Government District'?'الحي الحكومي':place.zone==='Financial District'?'حي المال والأعمال':'المنطقة قيد المراجعة'));
      const h=create('h3');h.append(anchor(place.name_ar,'explore-place.html?slug='+encodeURIComponent(place.slug)));main.append(h);
      main.append(create('p','service-entity__scope',place.service_type||'نطاق الخدمة قيد التحديد بالمصدر'));
      const stamps=create('div','service-entity__status');
      stamps.append(create('span','source-status '+(place.verification==='Research'?'source-status--research':'source-status--source'),sourceStatusLabel(place)));
      stamps.append(create('span','visit-status visit-status--'+(place.public_access==='Walk-in Confirmed'?'walkin':place.public_access==='By Appointment'?'appointment':'unknown'),visitStatusLabel(place)));
      main.append(stamps);
      const actions=create('div','service-entity__actions');
      actions.append(anchor('تفاصيل الجهة وشروط الزيارة ←','explore-place.html?slug='+encodeURIComponent(place.slug),'service-entity__action'));
      if(place.source_url?.startsWith('https://')){const src=anchor('مصدر المعلومات',place.source_url,'service-entity__source');src.target='_blank';src.rel='noopener noreferrer';actions.append(src);}
      article.append(main,actions);list.append(article);
    }
    section.append(list);$('serviceGroups').append(section);
  }
  const first=$('serviceGroups').firstElementChild;
  if(first?.tagName==='P')first.remove();
  if(!$('serviceGroups').children.length)$('serviceGroups').append(create('p','','لا توجد خدمات قابلة للعرض حاليًا.'));
}catch(error){
  $('serviceGroups').replaceChildren(create('p','services-error','تعذر تحميل دليل الخدمات. راجع دليل الجهات أو حاول لاحقًا.'));
}
document.getElementById('serviceGroups')?.addEventListener('click', event => {
  if (event.target.closest('a')) emitMeasurement('service_opened', {context:'services'});
});
