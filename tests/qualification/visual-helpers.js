// Reproduces the capture conditions of baseline/capture-baseline.mjs (same constants, same steps) against the build under test.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  BLOCKED_HOSTS, HIDDEN_SELECTORS, HIDE_CSS, FREEZE_CSS, CLOCKS, VIEWPORTS, CONTEXT_OPTIONS, SECTION_IDS, EXTRA_TARGETS,
} from './baseline/capture-baseline.mjs'
import { BASELINE_DIR } from './helpers.js'
import { decodePng, diffPng } from './png.js'

export { HIDDEN_SELECTORS, CLOCKS, VIEWPORTS, SECTION_IDS, EXTRA_TARGETS, CONTEXT_OPTIONS }
// Allowed visual differences vs baseline (NFR-MAINT-008): DEF-021 darker/lighter text token on the location lines for
// 4.5:1 contrast (NFR-A11Y-006). DEF-012 (-webkit-backdrop-filter pairs) renders identically in Chromium.
// Candidate-only: restore the baseline colour so the pixel diff keeps checking everything else.
export const ALLOWED_DIFF_CSS = '.exp-company-loc, .contact-loc { color: var(--text2) !important; }'
export const HIDE_NAV_CSS = 'nav.nav { visibility: hidden !important; }'
export const TARGETS = [...SECTION_IDS.map((id) => [id, `#${id}`]), ...Object.entries(EXTRA_TARGETS)]
export const baseUrlFor = (testInfo) => testInfo.project.use.baseURL

async function finishAnimations(page) {
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.getComputedTiming()
      if (t && Number.isFinite(t.endTime)) a.finish()
    }
  })
}

export async function scrollTop(page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.dispatchEvent(new Event('scroll'))
  })
  await page.waitForTimeout(150)
  await finishAnimations(page)
}

/**
 * Scroll the page through and wait until every img[loading=lazy] has settled (loaded or errored into its fallback),
 * matching the baseline, whose full-page screenshot forced all lazy images to resolve before the DOM was dumped.
 */
export async function settleLazyImages(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = Math.max(200, Math.floor((page.viewportSize()?.height ?? 800) / 2))
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(30)
  }
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('img[loading="lazy"]')).every((img) => img.complete),
    null,
    { timeout: 15_000 },
  )
  await scrollTop(page)
}

/** Open the page under the baseline's conditions, with all lazy sections loaded and revealed. */
export async function preparePage(browser, baseURL, vpName, theme) {
  const context = await browser.newContext({ ...VIEWPORTS[vpName], ...CONTEXT_OPTIONS, baseURL })
  await context.route(BLOCKED_HOSTS, (route) => route.abort())
  // the baseline was captured with the Simple Icons CDN unreachable (fallback "code" icons), so abort it here too
  await context.route(/^https:\/\/cdn\.simpleicons\.org\//, (route) => route.abort('failed'))
  const page = await context.newPage()
  const instant = new Date(CLOCKS[theme])
  await page.clock.install({ time: instant })
  await page.clock.pauseAt(instant)
  await page.goto('/', { waitUntil: 'load' })
  await page.waitForSelector('#hero')
  // lazy sections: React throttles revealing Suspense content with a 300 ms timer, which the paused clock holds back
  for (let i = 0; i < 60; i++) {
    if ((await page.locator('[data-section-placeholder]').count()) === 0 && (await page.locator('[data-section]').count()) === 10) break
    await page.clock.runFor(100)
    await page.waitForTimeout(40)
  }
  await page.addStyleTag({ content: FREEZE_CSS })
  await page.addStyleTag({ content: HIDE_CSS })
  await page.addStyleTag({ content: ALLOWED_DIFF_CSS })
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible')))
  await page.waitForTimeout(400)
  await finishAnimations(page)
  await page.evaluate(() => document.fonts && document.fonts.ready)
  const actual = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (actual !== theme) throw new Error(`Expected data-theme="${theme}" at ${CLOCKS[theme]}, got "${actual}"`)
  return { context, page }
}

export const baselinePng = (name) => decodePng(readFileSync(join(BASELINE_DIR, name)))

// Baselines are authoritative only for the environment they were captured in (CI runner). Set
// UPDATE_VISUAL_BASELINES=1 to (re)capture them there — see .github/workflows/visual-baselines.yml.
export const UPDATING_BASELINES = process.env.UPDATE_VISUAL_BASELINES === '1'

export function compare(actualBuf, baselineName, threshold = 0.2) {
  if (UPDATING_BASELINES) {
    writeFileSync(join(BASELINE_DIR, baselineName), actualBuf)
    return { ratio: 0, mismatched: 0, total: 0 }
  }
  return diffPng(decodePng(actualBuf), baselinePng(baselineName), threshold)
}

export async function compareHeroToBaseline(browser, baseURL, vpName, theme) {
  const { context, page } = await preparePage(browser, baseURL, vpName, theme)
  await scrollTop(page)
  await page.addStyleTag({ content: HIDE_NAV_CSS })
  const loc = page.locator('#hero').first()
  await loc.scrollIntoViewIfNeeded()
  await page.waitForTimeout(100)
  await finishAnimations(page)
  const buf = await loc.screenshot()
  await context.close()
  return compare(buf, `section-hero-${vpName}-${theme}.png`)
}

/** Same extraction as the baseline's collectDom (elements only). */
export function collectDom({ selector, hidden }) {
  const root = document.querySelector(selector)
  if (!root) return null
  const hiddenSel = hidden.join(', ')
  const isHidden = (el) => el.matches(hiddenSel) || !!el.parentElement?.closest(hiddenSel)
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const ownText = (el) => norm(Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' '))
  const describe = (el) => ({ tag: el.tagName.toLowerCase(), className: el.getAttribute('class') || '', text: ownText(el) })
  const descendants = Array.from(root.querySelectorAll('*')).filter((el) => !isHidden(el))
  return { root: { ...describe(root), fullText: norm(root.textContent) }, elementCount: descendants.length, elements: descendants.map(describe) }
}

