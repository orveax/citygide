import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPage } from './ux-audit.mjs';

const base = '<!doctype html><html lang="ar" dir="rtl"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"></head><body><a class="skip-link" href="#main">skip</a><main id="main"><h1>Title</h1></main></body></html>';
test('CG-MUX-10 identifies structural navigation and accessibility mistakes',()=>{
 assert.deepEqual(auditPage(base,'index.html'),[]);
 assert.ok(auditPage(base.replace('id="main"','id="wrong"'),'index.html').some(x=>x.includes('destination')));
 assert.ok(auditPage(base.replace('</main>','<div id="main"></div></main>'),'index.html').some(x=>x.includes('duplicate')));
 assert.ok(auditPage(base.replace('<h1>Title</h1>',''),'index.html').some(x=>x.includes('h1')));
 assert.ok(auditPage(base.replace('<h1>','<img src="x.png"><h1>'),'index.html').some(x=>x.includes('alt')));
});
test('CG-MUX-10 prevents linking to unavailable New Alamein listings',()=>{
 assert.ok(auditPage(base+'<a href="directory.html?city=new-alamein">open</a>','districts.html').some(x=>x.includes('research-only')));
});
