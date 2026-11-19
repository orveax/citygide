// CG-MUX-06: evidence-scoped service discovery; not a live availability directory.
// Manually mapped IDs are vetted against source-controlled exploration records.
export const SERVICE_PATHWAYS = Object.freeze([
  { id:'notary', label:'التوثيق والشهر العقاري', description:'مكاتب التوثيق المنشأة أو المدرجة بالمصادر، مع توضيح حالة تشغيل كل مكتب.', placeIds:['NC-108','NC-256'], channel:'زيارة محتملة — التشغيل والدخول يحتاجان تأكيدًا' },
  { id:'attestation', label:'تصديقات الخارجية', description:'مكاتب التصديقات المرتبطة بوزارة الخارجية، ولا تُفترض ساعات الاستقبال.', placeIds:['NC-15'], channel:'مكتب محدد بالمصدر — استقبال الجمهور يحتاج تأكيدًا' },
  { id:'e-signature', label:'التوقيع الإلكتروني', description:'منافذ ذُكرت ضمن منظومة التوقيع الإلكتروني؛ إصدار الشهادات واستلامها ليسا مضمونين في كل منفذ.', placeIds:['NC-120','NC-121'], channel:'راجع نوع الخدمة لدى المنفذ قبل التوجه' },
  { id:'investors', label:'خدمة المستثمرين', description:'وحدات مختصة بدعم المستثمرين في جهات مختلفة؛ لا يعني ذلك أنها تقدم الخدمات نفسها.', placeIds:['NC-111','NC-249'], channel:'جهات مختلفة — الخدمة حسب اختصاص كل جهة' },
  { id:'citizens', label:'خدمة المواطنين والشكاوى', description:'وحدات خدمة المواطنين المعروفة بمصادرها؛ اتصل بالجهة لتحديد قناة الطلب.', placeIds:['NC-112'], channel:'استعلام/تواصل — الاستقبال الحضوري غير مؤكد' },
  { id:'banking', label:'الفروع المصرفية', description:'أمثلة لفروع مصرفية باسمها، وليست كل الماكينات أو المقار الإدارية؛ تحقق من خدمة الفرع والدخول.', placeIds:['NC-36','NC-46','NC-49','NC-60'], channel:'فرع مذكور بمصدر — مواعيد ومدخل العملاء غير مؤكدة' }
]);
export function serviceEntries(places, group) {
  const byId = new Map(places.map(p=>[p.id,p]));
  return group.placeIds.map(id=>byId.get(id)).filter(p=>p && !['District','Building'].includes(p.kind));
}
export function serviceGroup(id) { return SERVICE_PATHWAYS.find(g=>g.id===id); }
