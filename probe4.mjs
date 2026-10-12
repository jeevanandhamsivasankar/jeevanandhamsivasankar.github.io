import { chromium } from '@playwright/test'
const b = await chromium.launch()
const c = await b.newContext({ viewport:{width:320,height:800} })
const p = await c.newPage()
await p.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort()); await p.route(/simpleicons/, r=>r.abort())
await p.goto('http://localhost:4180/'); await p.waitForTimeout(800)
console.log(await p.evaluate(()=>[...document.querySelectorAll('.hero *')].filter(e=>e.getBoundingClientRect().right>321&&!/orb|ring/.test(e.className)).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().left)+'-'+Math.round(e.getBoundingClientRect().right)+' w'+e.scrollWidth+' '+e.textContent.slice(0,25)).join('\n')))
await b.close()
