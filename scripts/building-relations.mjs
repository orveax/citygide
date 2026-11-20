// CG-MUX-07: curated building-to-location evidence relationships.
// This means "source mentions a location in this building", NOT verified
// tenant occupancy, opening hours, walk-in accessibility or a public entrance.
export const BUILDING_RELATIONSHIPS = Object.freeze([
  {buildingId:'NC-129', placeIds:['NC-50'], status:'source-listed', context:'صفحة الجهاز الرسمية تحدد الدورين الثاني والثالث داخل مبنى وزارة الإسكان؛ لا تثبت مدخل الجمهور.'},
  {buildingId:'NC-133', placeIds:['NC-52','NC-243'], status:'source-listed', context:'مصدر هيئة الموانئ البرية والجافة يحدد الدور الثالث؛ بوابة تيسير التجارة تحدد جهاز النقل البري بالدور الثاني. لكل جهة خدمة وساعات مستقلة ومدخل غير مؤكد.'},
  {buildingId:'NC-134', placeIds:['NC-43'], status:'source-listed', context:'صفحة تواصل جهاز تنمية التجارة الداخلية تذكر الدور الأول داخل مبنى وزارة التموين؛ الاستقبال ومدخل الزوار غير معتمدين.'},
  {buildingId:'NC-132', placeIds:['NC-14'], status:'source-listed', context:'معلومات الجهاز الرسمية تحدد الدور الأول بمبنى وزارة البيئة؛ الخدمات الإلكترونية لا تعني وجود شباك استقبال للجمهور.'},
  {buildingId:'NC-109', placeIds:['NC-108'], status:'source-listed', context:'قرار منشور يذكر فرع التوثيق بالمحل 4أ؛ استمرار التشغيل والدخول غير مؤكدين.'},
  {buildingId:'NC-131', placeIds:['NC-111','NC-112'], status:'source-listed', context:'صفحات رسمية لوزارة المالية تذكر إدارتين منفصلتين في برج LC، الدور السادس.'},
  {buildingId:'NC-95', placeIds:['NC-46'], status:'address-correlated', context:'الفرع والمبنى مرتبطان بالقطعة 23-A2/A2-23؛ الوصول إلى الفرع غير مؤكد.'},
  {buildingId:'NC-12', placeIds:['NC-64'], status:'source-listed', context:'صفحة تواصل الشركة تذكر برج INIZIO؛ لا تثبت حضورًا يوميًا أو مدخلًا متاحًا.'},
  {buildingId:'NC-105', placeIds:['NC-55'], status:'restricted-access', context:'فرع مصرفي مذكور داخل مجلس النواب؛ دخول الجمهور إلى المبنى غير مثبت.'},
  {buildingId:'NC-166', placeIds:['NC-114'], status:'historical-registration', context:'عنوان تسجيل محل GR-03 ضمن Sixty Walk One في ديسمبر 2024؛ لا يثبت استمرار النشاط.'},
  {buildingId:'NC-165', placeIds:['NC-66'], status:'source-listed', context:'مركز ريجس يحمل اسم Financial Hub في عنوان موقعه؛ التشغيل الحالي والمدخل يحتاجان مراجعة.'},
  {buildingId:'NC-177', placeIds:['NC-162'], status:'source-listed', context:'بيان وزارة العمل يحدد وحدة المستثمرين بالدور الثالث؛ استقبال الجمهور الحالي يحتاج تأكيدًا.'}
]);
export const BUILDING_STATUS_LABELS = Object.freeze({
  'source-listed':'عنوان مذكور بالمصدر',
  'address-correlated':'مطابقة عنوان بين مصدرين',
  'restricted-access':'داخل مبنى ذي دخول مقيد',
  'historical-registration':'عنوان تسجيل تاريخي'
});
export function curatedBuildings(places) {
  const byId=new Map(places.map(place=>[place.id,place]));
  return BUILDING_RELATIONSHIPS.flatMap(rel => {
    const building=byId.get(rel.buildingId);
    if(!building || building.kind!=='Building')return [];
    const linked=rel.placeIds.map(id=>byId.get(id)).filter(place=>place && !['Building','District'].includes(place.kind));
    return linked.length?[{...rel,building,linked}]:[];
  });
}
export function buildingGroup(places,id) { return curatedBuildings(places).find(group=>group.buildingId===id); }
export function buildingForPlace(places,id) {return curatedBuildings(places).find(group=>group.linked.some(place=>place.id===id));}
