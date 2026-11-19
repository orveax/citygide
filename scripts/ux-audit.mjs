// CG-MUX-10 static UX acceptance gate. Runs during Cloudflare build.
// Checks structure only; not a substitute for browser/assistive-tech testing.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const UX_PAGES = Object.freeze([
 'index.html','directory.html','services.html','buildings.html','districts.html',
 'place.html','explore-place.html','approved.html','about.html','contact.html','terms.html','privacy.html'
]);

export function auditPage(html,file) {
 const findings=[];
 if(!/<html\b[^>]*\blang="ar"[^>]*\bdir="rtl"/i.test(html))findings.push('missing Arabic RTL document language');
 if(!/<meta\b[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"/i.test(html))findings.push('missing responsive viewport');
 if(!/<main\b/i.test(html))findings.push('missing main landmark');
 if((html.match(/<h1(?:\s|>)/gi)||[]).length!==1)findings.push('expected exactly one page h1');
 const skip=html.match(/class="skip-link"[^>]*href="#([^"]+)"/);
 if(!skip)findings.push('missing keyboard skip link');
 else if(!html.includes('id="'+skip[1]+'"'))findings.push('skip link destination missing');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
 if(duplicates.length)findings.push('duplicate DOM ids: '+duplicates.join(', '));
 if(!/noindex,nofollow/.test(html))findings.push('pre-launch noindex policy missing');
 if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(html))findings.push('image missing accessible alt');
 if(file==='districts.html'&& /href="[^"]*new-alamein/.test(html))findings.push('research-only city must not have visitor links');
 return findings;
}
export function auditBuiltUx(dist) {
 const errors=[];
 for(const file of UX_PAGES) {
  const html=readFileSync(join(dist,file),'utf8');
  for(const finding of auditPage(html,file))errors.push(file+': '+finding);
 }
 return errors;
}
