import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as base, expect, SKIP_INTRO } from './fixtures.js'
import { NIGHT } from './expected.js'

export { expect }
export const ROOT = resolve(fileURLToPath(import.meta.url), '../../..')
export const BASELINE_DIR = join(ROOT, 'tests/qualification/__baseline__')

const SIMPLE_ICONS = /^https:\/\/cdn\.simpleicons\.org\//
export const FIXTURE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#888"/></svg>'

/** P0: fonts blocked (fixtures.js), Simple Icons served from a local fixture SVG. */
export async function routeSimpleIcons(target) {
  await target.route(SIMPLE_ICONS, (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: FIXTURE_SVG }),
  )
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await routeSimpleIcons(page)
    await use(page)
  },
})

export const isDesktop = (testInfo) => testInfo.project.name === 'desktop-chromium'
export const isMobile = (testInfo) => testInfo.project.name === 'mobile-chromium'

/** Viewport gating: 'D' desktop only, 'M' mobile only, 'DM' both, 'S' static (run once, desktop project). */
export function only(testInfo, kind) {
  const d = isDesktop(testInfo)
  const m = isMobile(testInfo)
  const skip = (kind === 'D' && !d) || (kind === 'M' && !m) || (kind === 'S' && !d)
  base.skip(skip, `viewport ${kind} only`)
}

/** Fresh context + page using the project's device options (for multi-context tests). */
export async function freshPage(browser, testInfo, extra = {}) {
  const { viewport, isMobile: mob, hasTouch, deviceScaleFactor, userAgent } = testInfo.project.use
  const context = await browser.newContext({
    viewport,
    isMobile: mob,
    hasTouch,
    deviceScaleFactor,
    userAgent,
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',
    baseURL: testInfo.project.use.baseURL,
    ...extra,
  })
  await context.route(/^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//, (r) => r.abort())
  await routeSimpleIcons(context)
  await context.addInitScript(SKIP_INTRO)
  const page = await context.newPage()
  return { context, page }
}

/** Install the clock (flowing from `iso`) or paused at `iso`. Must be called before goto. */
export async function setClock(page, iso = NIGHT, { pause = false } = {}) {
  const t = new Date(iso)
  await page.clock.install({ time: t })
  if (pause) await page.clock.pauseAt(t)
}

export async function waitSections(page) {
  await page.waitForSelector('#hero')
  await expect(page.locator('[data-section-placeholder]')).toHaveCount(0, { timeout: 20_000 })
  await expect(page.locator('[data-section]')).toHaveCount(10)
}

/**
 * Navigate to the app. opts.at: ISO instant for the fake clock (default NIGHT); opts.at === null disables the clock.
 * opts.pause: pause the clock at that instant. opts.sections (default true): wait for all lazy sections.
 */
export async function gotoHome(page, opts = {}) {
  const { at = NIGHT, pause = false, sections = true, path = '/' } = opts
  if (at !== null) await setClock(page, at, { pause })
  await page.goto(path)
  if (sections) await waitSections(page)
  else await page.waitForSelector('#hero')
}

export async function scrollToY(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(80)
}

export async function scrollToSection(page, id, delta = 0) {
  await page.evaluate(
    ([sid, d]) => {
      const el = document.getElementById(sid)
      window.scrollTo({ top: el.offsetTop + d, behavior: 'instant' })
    },
    [id, delta],
  )
  await page.waitForTimeout(80)
}

export async function scrollBottom(page) {
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(80)
}

/** Wait until scrollY (a) has left `from` (when given) and (b) stays equal for three reads 100 ms apart. */
export async function settleScroll(page, { from } = {}) {
  const reads = []
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => Math.round(window.scrollY))
        reads.push(y)
        if (from !== undefined && y === from) return false
        return reads.length >= 3 && reads.slice(-3).every((v) => v === y)
      },
      { intervals: [100], timeout: 10_000 },
    )
    .toBe(true)
}

/**
 * Click/tap an element. With Google Fonts blocked the Material Symbols ligature names render as text, so the
 * nav overflows the viewport (DEF-QT-001/002): controls may then lie outside the visible area. In that case a
 * synthetic click is used so the behaviour under test can still be verified, and the test is annotated.
 */
export async function press(locator) {
  const inView = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return r.left >= 0 && r.right <= document.documentElement.clientWidth
  })
  if (inView) {
    if (base.info().project.name === 'mobile-chromium') await locator.tap()
    else await locator.click()
  } else {
    base.info().annotations.push({ type: 'defect-workaround', description: 'control outside the viewport; synthetic click used' })
    await locator.dispatchEvent('click')
  }
}
export const tapOrClick = press

/** Scroll through the whole page in half-viewport steps so every reveal-on-scroll element intersects, then back to top. */
export async function revealAll(page) {
  const { height, vh } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, vh: window.innerHeight }))
  for (let y = 0; y <= height; y += Math.floor(vh / 2)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(40)
  }
  await scrollBottom(page)
  await page.waitForTimeout(300)
  await scrollToY(page, 0)
}

/** Scroll an element to the viewport centre instantly (the page uses scroll-behavior: smooth). */
export async function centre(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await locator.page().waitForTimeout(900) // let the 0.7 s reveal transition finish
}

/** loadAllSections: all lazy chunks resolved, every section scrolled through. */
export async function loadAllSections(page) {
  await waitSections(page)
  await revealAll(page)
}

export function collectErrors(page, { ignoreFonts = true } = {}) {
  const out = { pageErrors: [], consoleErrors: [], consoleWarnings: [] }
  page.on('pageerror', (e) => out.pageErrors.push(String(e)))
  page.on('console', (m) => {
    const loc = m.location()?.url || ''
    const text = m.text()
    if (ignoreFonts && /fonts\.(googleapis|gstatic)\.com/.test(loc + text)) return
    if (/Failed to load resource: net::ERR_FAILED/.test(text) && ignoreFonts) return
    if (m.type() === 'error') out.consoleErrors.push(text)
    if (m.type() === 'warning') out.consoleWarnings.push(text)
  })
  return out
}

export const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`

export async function style(locator, props) {
  return locator.evaluate(
    (el, ps) => {
      const cs = getComputedStyle(el)
      const o = {}
      for (const p of ps) o[p] = cs.getPropertyValue(p)
      return o
    },
    Array.isArray(props) ? props : [props],
  )
}
export async function css(locator, prop) {
  return (await style(locator, prop))[prop]
}
export const trackCount = (v) => (v && v !== 'none' ? v.trim().split(/\s+/).length : 0)

/** Own-text extraction identical to the baseline capture script. */
export async function ownTexts(page, selector) {
  return page.evaluate((sel) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
    return Array.from(document.querySelectorAll(sel)).map((el) =>
      norm(
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(' '),
      ),
    )
  }, selector)
}

const baselineCache = new Map()
export function baselineDom(vp = 'desktop', theme = 'night') {
  const key = `${vp}-${theme}`
  if (!baselineCache.has(key)) {
    baselineCache.set(key, JSON.parse(readFileSync(join(BASELINE_DIR, `dom-${key}.json`), 'utf8')))
  }
  return baselineCache.get(key)
}
/** Baseline own texts for elements in `section` with the given tag and class (exact class match when cls is a string). */
export function baselineTexts(section, { tag, cls }, vp = 'desktop') {
  return baselineDom(vp)[section].elements
    .filter((e) => (tag ? e.tag === tag : true) && (cls === undefined ? true : e.className === cls))
    .map((e) => e.text)
}
export const baselineFullText = (section, vp = 'desktop') => baselineDom(vp)[section].root.fullText

export const distAssets = () => {
  const dir = join(ROOT, 'dist/assets')
  return existsSync(dir) ? readdirSync(dir) : []
}
export const fileSize = (p) => statSync(p).size
export const readSrc = (rel) => readFileSync(join(ROOT, rel), 'utf8')

/** Resolve a CSS custom property that holds a colour to an rgb() string. */
export async function resolvedColor(page, varName) {
  return page.evaluate((n) => {
    const d = document.createElement('div')
    d.style.color = `var(${n})`
    document.body.appendChild(d)
    const c = getComputedStyle(d).color
    d.remove()
    return c
  }, varName)
}
export async function rootVar(page, varName) {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), varName)
}

/** Centre the element, then move the pointer onto it in several steps so :hover and React mouse events settle. */
export async function hoverAt(locator) {
  await centre(locator)
  const box = await locator.boundingBox()
  const page = locator.page()
  await page.mouse.move(box.x + box.width / 2 - 8, box.y + box.height / 2, { steps: 3 })
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 })
}
