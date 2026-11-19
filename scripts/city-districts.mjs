import { canonicalizePlaces, filterPlaces, directoryReturnUrl } from './catalog.mjs';

const target = document.getElementById('districtResults');
const districts = Object.freeze([
 {zone:'Government District',title:'الحي الحكومي',description:'الوزارات والهيئات والمباني ونقاط الخدمات المسجلة ضمن الحي الحكومي.'},
 {zone:'Financial District',title:'حي المال والأعمال',description:'البنوك والفروع والشركات والمباني في نطاق الحي المالي والأعمال.'},
 {zone:'Other',title:'المنطقة قيد التحقق',description:'سجلات داخل نطاق دليل العاصمة لم يثبت تصنيفها إلى أحد الحيين بعد.'}
]);
try {
 const response=await fetch('data/exploration.json',{cache:'no-store'});
 if(!response.ok)throw new Error('unavailable');
 const data=await response.json();
 if(data.mode!=='exploration'||!Array.isArray(data.places))throw new Error('invalid dataset');
 const permitted=new Set(['Research','Source Confirmed','Contact Verified','Published']);
 if(!data.places.every(place=>permitted.has(place.verification)))throw new Error('invalid verification');
 const places=canonicalizePlaces(data.places);
 target.replaceChildren();
 for(const district of districts) {
  const count=filterPlaces(places,{city:'new-capital',zone:district.zone}).length;
  const card=document.createElement('article');card.className='city-district-card';
  const heading=document.createElement('h3');heading.textContent=district.title;
  const info=document.createElement('p');info.textContent=district.description;
  const number=document.createElement('strong');number.className='city-district-count';number.textContent=count+' سجل استكشافي';
  const link=document.createElement('a');link.className='city-district-link';
  link.href=directoryReturnUrl({filters:{city:'new-capital',zone:district.zone}});
  link.textContent='استكشف الحي ←';
  card.append(heading,info,number,link);target.append(card);
 }
}catch(err) {
 target.replaceChildren();
 const message=document.createElement('p');message.className='city-discovery-error';
 message.textContent='تعذر تحميل تغطية الأحياء حاليًا. يمكنك العودة إلى دليل الجهات.';
 target.append(message);
}