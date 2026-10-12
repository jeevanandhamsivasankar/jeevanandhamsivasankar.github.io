/**
 * Visual parity vs baseline dd9a86d. Capture conditions come from baseline/capture-baseline.mjs (same constants).
 * Comparison: PNGs are decoded in pure JS (png.js) and diffed with a pixelmatch-style YIQ metric (threshold 0.2);
 * allowed ratio: 0.001 per element, 0.002 full page. Dynamic layers (particles, orbs, typewriter, gauge svg) are
 * hidden in both capture and baseline (HIDE_CSS).
 * Differences permitted by SRS NFR-MAINT-008 that do not render: skip link (off-screen until focused), aria
 * attributes, id="main"/tabindex, theme set before first paint, unified resume download filename.
 */
import { writeFileSync } from 'node:fs'
import { test, expect, baselineDom } from './helpers.js'
import {
  preparePage, scrollTop, compare, collectDom, TARGETS, HIDDEN_SELECTORS, HIDE_NAV_CSS,
} from './visual-helpers.js'

const vpOf = (testInfo) => (testInfo.project.name === 'mobile-chromium' ? 'mobile' : 'desktop')

async function visualRun(browser, testInfo, theme) {
  test.setTimeout(240_000)
  const vp = vpOf(testInfo)
  const { context, page } = await preparePage(browser, testInfo.project.use.baseURL, vp, theme)
  const results = []
  // blurred (backdrop-filter) layers can rasterise with sub-pixel jitter: re-capture up to twice before judging
  const record = async (name, shoot, limit, baselineName) => {
    let buf = await shoot()
    let r = compare(buf, baselineName)
    for (let attempt = 0; attempt < 2 && r.ratio > limit && !r.sizeMismatch; attempt++) {
      await page.waitForTimeout(300)
      const b2 = await shoot()
      const r2 = compare(b2, baselineName)
      if (r2.ratio < r.ratio) { buf = b2; r = r2 }
    }
    results.push({ name, ...r, limit })
    if (r.ratio > limit) writeFileSync(testInfo.outputPath(`${name}-actual.png`), buf)
  }
  await scrollTop(page)
  await record('full', () => page.screenshot({ fullPage: true }), 0.002, `full-${vp}-${theme}.png`)
  await scrollTop(page)
  await record('nav', () => page.locator('nav.nav').screenshot(), 0.001, `section-nav-${vp}-${theme}.png`)
  const hider = await page.addStyleTag({ content: HIDE_NAV_CSS })
  for (const [id, selector] of TARGETS) {
    if (id === 'nav') continue
    const loc = page.locator(selector).first()
    await loc.scrollIntoViewIfNeeded()
    await page.waitForTimeout(100)
    await page.evaluate(() => {
      for (const a of document.getAnimations()) {
        const t = a.effect && a.effect.getComputedTiming()
        if (t && Number.isFinite(t.endTime)) a.finish()
      }
    })
    await record(id, () => loc.screenshot(), 0.001, `section-${id}-${vp}-${theme}.png`)
  }
  await hider.evaluate((el) => el.remove())
  await context.close()
  testInfo.annotations.push({
    type: 'visual-ratios',
    description: results.map((r) => `${r.name}=${(r.ratio * 100).toFixed(3)}%${r.sizeMismatch ? ` SIZE ${r.sizeMismatch}` : ''}`).join(' '),
  })
  for (const r of results) {
    expect.soft(r.ratio, `${r.name}: ${r.mismatched}/${r.total} px differ${r.sizeMismatch ? ` (size ${r.sizeMismatch})` : ''}`).toBeLessThanOrEqual(r.limit)
  }
}

test('QT-109 Visual regression vs baseline dd9a86d (night theme)', async ({ browser }, testInfo) => {
  await visualRun(browser, testInfo, 'night')
})

test('QT-110 Visual regression vs baseline dd9a86d (day theme)', async ({ browser }, testInfo) => {
  await visualRun(browser, testInfo, 'day')
})

test('QT-111 Text-content and class-name parity snapshot', async ({ browser }, testInfo) => {
  const vp = vpOf(testInfo)
  for (const theme of ['night', 'day']) {
    const { context, page } = await preparePage(browser, testInfo.project.use.baseURL, vp, theme)
    const base = baselineDom(vp, theme)
    for (const [id, selector] of TARGETS) {
      const live = await page.evaluate(collectDom, { selector, hidden: HIDDEN_SELECTORS })
      const exp = base[id]
      expect.soft({ tag: live.root.tag, className: live.root.className, text: live.root.text }, `${theme} ${id} root`).toEqual({
        tag: exp.root.tag, className: exp.root.className, text: exp.root.text,
      })
      // dynamic gauge/typewriter text is masked (reduced motion shows the static t=0 frame and first role)
      const dyn = (t) => t.replace(/\d+km\/hHMI CLUSTER DEMO\d+ RPM/, 'GAUGE').replace(/B\.ECE(Qt \/ QML Developer)?\|/, 'B.ECE|')
      expect.soft(dyn(live.root.fullText), `${theme} ${id} fullText`).toBe(dyn(exp.root.fullText))
      expect.soft(live.elementCount, `${theme} ${id} element count`).toBe(exp.elementCount)
      expect.soft(live.elements, `${theme} ${id} elements`).toEqual(exp.elements)
    }
    await context.close()
  }
})
