import { chromium } from '@playwright/test'
const b = await chromium.launch()
for (const w of [320]) {
  const c = await b.newContext({ viewport:{width:w,height:800} })
  const p = await c.newPage()
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort()); await p.route(/simpleicons/, r=>r.abort())
  await p.goto('http://localhost:4180/'); await p.waitForTimeout(500)
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}})
  await p.waitForTimeout(800)
  console.log(w, await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth), await p.evaluate(()=>document.documentElement.scrollWidth), await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='fixed').filter(e=>!/orb|hring|hero-rings/.test(e.className)).slice(0,8).map(e=>e.className+' '+Math.round(e.getBoundingClientRect().right))))
  await c.close()
}
await b.close()
