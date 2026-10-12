import { chromium } from '@playwright/test'
const b = await chromium.launch()
for (const [w,h] of [[390,844],[320,700],[1366,800]]) {
  const c = await b.newContext({ viewport:{width:w,height:h} })
  const p = await c.newPage()
  const viol=[]
  p.on('console', m=>{ if(/Content Security|CSP/i.test(m.text())) viol.push(m.text()) })
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort())
  await p.route(/simpleicons/, r=>r.abort())
  await p.goto('http://localhost:4180/'); await p.waitForTimeout(800)
  const r = await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,
    ham:document.querySelector('.hamburger').getBoundingClientRect().toJSON(),
    tb:document.querySelector('.theme-btn').getBoundingClientRect().toJSON(),
    nav:document.querySelector('.nav').getBoundingClientRect().width}))
  const o=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='fixed').slice(0,8).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right)+' '+(e.textContent||'').slice(0,30)))
  console.log(o)
  console.log(w, JSON.stringify(r), viol)
  await c.close()
}
await b.close()
