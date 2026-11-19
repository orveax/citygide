import { canonicalizePlaces, sourceStatusLabel, visitStatusLabel } from './catalog.mjs';
import { curatedBuildings, BUILDING_STATUS_LABELS } from './building-relations.mjs';
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const link=(text,url,cls='')=>{const el=make('a',cls,text);el.href=url;return el;};
try {
  const res=await fetch('data/exploration.json',{cache:'no-store'});
  if(!res.ok)throw Error('catalogue unavailable');
  const payload=await res.json();
  if(payload.mode!=='exploration'||!Array.isArray(payload.places))throw Error('invalid mode');
  const allowed=new Set(['Published','Contact Verified','Source Confirmed','Research']);
  if(!payload.places.every(p=>allowed.has(p.verification)))throw Error('invalid status');
  const groups=curatedBuildings(canonicalizePlaces(payload.places));
  const id=new URLSearchParams(location.search).get('id');
  const selected=id?groups.filter(group=>group.buildingId===id):groups;
  if(id&&!selected.length)$('buildingGroups').replaceChildren(make('p','building-empty','المبنى غير موجود ضمن العلاقات الموثقة حاليًا. '));
  else {
    $('buildingGroups').replaceChildren();
    if(id)$('buildingJump').append(link('← عرض كل المباني','buildings.html','building-jump'));
    for(const group of selected){
      if(!id)$('buildingJump').append(link(group.building.name_ar+' ('+group.linked.length+')','#building-'+group.buildingId,'building-jump'));
      const section=make('section','building-group');
      section.id='building-'+group.buildingId;
      const title=make('h2');title.append(link(group.building.name_ar,'explore-place.html?slug='+encodeURIComponent(group.building.slug)));
      const intro=make('div','building-group__intro');
      intro.append(title,make('p','building-group__address',group.building.address));
      intro.append(make('span','building-group__precision','دقة العنوان: '+(group.building.address_precision==='Building Confirmed'?'المبنى محدد والمدخل غير مؤكد':group.building.address_precision==='Floor Confirmed'?'الطابق مسجل، لكن المدخل غير مؤكد':'المنطقة معروفة، المدخل غير مثبت')));
      intro.append(make('span','building-group__status',BUILDING_STATUS_LABELS[group.status]));
      intro.append(make('p','building-group__scope',group.context));
      const source=link('مصدر بيانات المبنى',group.building.source_url,'building-source');source.target='_blank';source.rel='noopener noreferrer';intro.append(source);
      section.append(intro);
      const list=make('div','building-associated');
      for(const place of group.linked){
        const item=make('article','building-associated__item');
        const head=make('div','building-associated__head');
        head.append(make('span','building-associated__kind',place.kind==='Bank'?'جهة مصرفية':place.kind==='Authority'?'هيئة أو جهة':place.kind==='Company'?'شركة أو منفذ':'جهة'));
        const h=make('h3');h.append(link(place.name_ar,'explore-place.html?slug='+encodeURIComponent(place.slug)));head.append(h);
        head.append(make('p','building-associated__address',place.address));
        const states=make('div','building-associated__states');
        states.append(make('span','source-status '+(place.verification==='Research'?'source-status--research':'source-status--source'),sourceStatusLabel(place)));
        states.append(make('span','visit-status visit-status--'+(place.public_access==='Walk-in Confirmed'?'walkin':place.public_access==='By Appointment'?'appointment':'unknown'),visitStatusLabel(place)));
        head.append(states);
        const actions=make('div','building-associated__actions');
        actions.append(link('البيانات وشروط الزيارة ←','explore-place.html?slug='+encodeURIComponent(place.slug),'building-associated__action'));
        if(place.source_url?.startsWith('https://')){const src=link('مصدر عنوان الجهة',place.source_url,'building-source');src.target='_blank';src.rel='noopener noreferrer';actions.append(src);}
        item.append(head,actions);list.append(item);
      }
      section.append(list);$('buildingGroups').append(section);
    }
  }
}catch(e){$('buildingGroups').replaceChildren(make('p','building-empty','تعذر تحميل معلومات المباني. جرّب دليل الجهات لاحقًا.'));}
