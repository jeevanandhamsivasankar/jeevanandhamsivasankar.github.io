import { chromium } from '@playwright/test'
const b = await chromium.launch()
const c = await b.newContext({ viewport:{width:390,height:844} })
const p = await c.newPage()
await p.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort())
await p.route(/simpleicons/, r=>r.abort())
await p.goto('http://localhost:4180/#experience'); await p.waitForTimeout(1500)
console.log(await p.evaluate(()=>{const q=s=>{const r=document.querySelector(s).getBoundingClientRect();return s+' '+Math.round(r.left)+'-'+Math.round(r.right)}
return ['.exp-timeline','.exp-item','.exp-header','.exp-left','.exp-role','.exp-company-name','.exp-right','.exp-icon','.exp-band .inner'].map(q).join('\n')+'\n'+document.documentElement.scrollWidth}))
await b.close()
