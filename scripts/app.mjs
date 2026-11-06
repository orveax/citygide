const $ = id => document.getElementById(id);
const zoneLabel = zone => ({'Government District':'الحي الحكومي','Financial District':'حي المال والأعمال'})[zone] || 'منطقة أخرى';
const roleLabel = role => ({'Administrative HQ':'مقر إداري','Public Service Point':'نقطة خدمة للجمهور','Facility':'مبنى أو منشأة','District':'حي'})[role] || role;
const precisionLabel = p => ({'District Only':'المنطقة فقط — لا يوجد مدخل دقيق مؤكد','Building Confirmed':'المبنى مؤكد، لكن المدخل غير مثبت','Floor Confirmed':'الطابق مؤكد','Entrance Confirmed':'المدخل مؤكد','Pin Verified':'نقطة الوصول مؤكدة'})[p] || 'غير محدد';
const text = (id, value) => { if ($(id)) $(id).textContent = value || 'غير مؤكد'; };

async function load() {
  const response = await fetch('data/places.json', {cache:'no-store'});
  if (!response.ok) throw Error('تعذر تحميل البيانات');
  const payload = await response.json();
  if (payload.mode !== 'production') throw Error('مصدر بيانات غير معتمد');
  if (!payload.places.every(p => p.verification === 'Published')) throw Error('سجلات غير معتمدة');
  return payload.places;
}

function renderCards(places) {
  const q = ($('q')?.value || '').trim().toLocaleLowerCase('ar');
  const zone = $('zone')?.value || '';
  const filtered = places.filter(p => (!zone || p.zone === zone) && [p.name_ar,p.name_en,p.address,...(p.aliases||[])].join(' ').toLocaleLowerCase('ar').includes(q));
  text('count', String(filtered.length));
  const cards = $('cards'); cards.replaceChildren();
  if (!filtered.length) { const p=document.createElement('p');p.className='empty';p.textContent=places.length?'ملقيناش مكان مطابق. جرّب اسم تاني أو غيّر المنطقة.':'الدليل قيد الإعداد. هنبدأ عرض الأماكن بعد اكتمال مراجعة واعتماد بياناتها.';cards.append(p);return; }
  for (const place of filtered) {
    const item=document.createElement('article');item.className='card-place';
    const tags=document.createElement('div');tags.className='row-meta';
    for(const label of [zoneLabel(place.zone),roleLabel(place.role),'عنوان موثّق من مصدر']){const s=document.createElement('span');s.className='badge-lite';s.textContent=label;tags.append(s);}
    const heading=document.createElement('h3');heading.textContent=place.name_ar;
    const desc=document.createElement('p');desc.textContent=place.address;
    const note=document.createElement('p');note.textContent=place.public_access==='Unknown'?'معلومات دخول الزوار غير مؤكدة — اتصل قبل الزيارة.':'راجع تفاصيل شروط الزيارة.';
    const a=document.createElement('a');a.href='place.html?slug='+encodeURIComponent(place.slug);a.textContent='عرض تفاصيل المكان ←';
    item.append(tags,heading,desc,note,a);cards.append(item);
  }
}

function renderDetail(places) {
  const slug=new URLSearchParams(location.search).get('slug');
  const p=places.find(p=>p.slug===slug);
  if(!p){text('title','المكان غير موجود في عينة المعاينة');return;}
  document.title=p.name_ar+' — دليل العاصمة (معاينة)';
  text('title',p.name_ar);text('crumbName',p.name_ar);text('crumbZone',zoneLabel(p.zone));
  text('subtitle',zoneLabel(p.zone)+' • '+roleLabel(p.role));text('address',p.address);
  text('precision',precisionLabel(p.address_precision));text('role',roleLabel(p.role));
  text('service',p.service_type || 'لا توجد خدمة حضورية محددة مثبتة');
  text('visitorHours',p.visitor_hours || 'غير مؤكدة — لا تعتمد على ساعات العمل الإداري');
  text('officeHours',p.office_hours || 'غير منشورة بمصدر واضح');text('checked',p.last_checked);
  text('accessNotice',p.public_access==='Unknown'?'شروط دخول الجمهور ومدخل الزوار لم يتم التحقق منهما. تواصل مع الجهة قبل المشوار.':'راجع شروط الدخول قبل الزيارة.');
  const contact=$('contact');
  const addLink=(root, label, href, primary=false)=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(primary)a.className='primary';if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}root.append(a);};
  if(p.phone)addLink(contact,'اتصل بالجهة', 'tel:'+p.phone.replace(/[^\d+]/g,''),true);
  if(p.email)addLink(contact,'البريد الإلكتروني','mailto:'+p.email);
  if(p.website)addLink(contact,'الموقع الرسمي',p.website);
  if(!contact.children.length)contact.textContent='لا توجد وسيلة اتصال مؤكدة في السجل.';
  addLink($('source'),'افتح مصدر البيانات',p.source_url);
  if(p.directions_url && p.verified_entrance)addLink(contact,'الاتجاهات المؤكدة',p.directions_url);
}

try {
  const places=await load();
  if($('cards')) {$('searchForm').addEventListener('submit',e=>{e.preventDefault();renderCards(places);$('places').scrollIntoView({behavior:'smooth'});});$('q').addEventListener('input',()=>renderCards(places));$('zone').addEventListener('change',()=>renderCards(places));renderCards(places);}
  if($('title'))renderDetail(places);
} catch(err) { if($('cards'))$('cards').textContent='تعذر تحميل بيانات المعاينة.';else text('title','تعذر تحميل بيانات المعاينة'); }
