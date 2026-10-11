#!/usr/bin/env node
/**
 * Visual + DOM baseline capture for the portfolio site.
 *
 * Usage:
 *   node tests/qualification/baseline/capture-baseline.mjs [baseUrl] [outDir] [commit]
 *
 *   baseUrl  default http://localhost:4174   (a `vite preview` of the build under test)
 *   outDir   default tests/qualification/__baseline__
 *   commit   free-text label recorded in meta.json (default: env CAPTURE_COMMIT or "unknown")
 *
 * Env: PLAYWRIGHT_BROWSERS_PATH (e.g. /opt/pw-browsers). Never runs `playwright install`.
 *
 * Determinism measures (all recorded in meta.json):
 *   - Google Fonts hosts are aborted (fallback fonts, Material Symbols render as ligature text).
 *   - reducedMotion: 'reduce' (the app's CSS collapses animations/transitions to 0.01ms and
 *     hides .particle/.cursor-glow).
 *   - timezoneId Asia/Kolkata + locale en-IN (nav clock string and the IST sun-phase theme).
 *   - page.clock installed and PAUSED at a fixed instant, so Date, setTimeout/setInterval and
 *     requestAnimationFrame are frozen (typewriter stays empty, speedometer stays at 0).
 *   - every `.reveal` gets `.visible`.
 *   - nondeterministic layers are hidden via injected CSS (HIDE_CSS) and excluded from the DOM dump.
 *   - for section screenshots the fixed nav is hidden so it does not overlap the section.
 */
/* global process, console, document, window, Event, getComputedStyle */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const BASE_URL = process.argv[2] || 'http://localhost:4174'
const OUT_DIR = resolve(process.argv[3] || 'tests/qualification/__baseline__')
const COMMIT = process.argv[4] || process.env.CAPTURE_COMMIT || 'unknown'

export const BLOCKED_HOSTS = /^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//

// Selectors adapted to the real class names in src/App.jsx (dd9a86d):
//   gradient orbs  -> .orbs-wrap (not .gradient-orbs)
//   speedometer    -> .gauge-widget svg (rAF-driven needle/numbers)
export const HIDDEN_SELECTORS = [
  '.particle',
  '.cursor-glow',
  '.orbs-wrap',
  '.hero-typewriter',
  '.gauge-widget svg',
]
export const HIDE_CSS = `${HIDDEN_SELECTORS.join(', ')} { visibility: hidden !important; }`
const HIDE_NAV_CSS = 'nav.nav { visibility: hidden !important; }'

export const CLOCKS = {
  day: '2026-06-21T12:00:00+05:30',
  night: '2026-06-21T23:00:00+05:30',
}

export const VIEWPORTS = {
  desktop: { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  // deviceScaleFactor 2 matches the mobile-chromium project in playwright.config.js
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

export const CONTEXT_OPTIONS = {
  reducedMotion: 'reduce',
  timezoneId: 'Asia/Kolkata',
  locale: 'en-IN',
  colorScheme: 'dark',
}

export const SECTION_IDS = [
  'hero', 'about', 'experience', 'skills', 'projects', 'design',
  'education', 'certifications', 'resume', 'contact',
]
// nav and footer have no id; captured by selector.
export const EXTRA_TARGETS = { nav: 'nav.nav', footer: 'footer' }

export const STYLE_PROPS = [
  'color', 'background-color', 'font-size', 'font-family', 'padding', 'margin',
  'display', 'grid-template-columns', 'border-radius',
]

async function preparePage(browser, vpName, theme) {
  const context = await browser.newContext({ ...VIEWPORTS[vpName], ...CONTEXT_OPTIONS })
  await context.route(BLOCKED_HOSTS, (route) => route.abort())
  const page = await context.newPage()
  const instant = new Date(CLOCKS[theme])
  await page.clock.install({ time: instant })
  await page.clock.pauseAt(instant)
  await page.goto(BASE_URL, { waitUntil: 'load' })
  await page.waitForSelector('#hero')
  await page.addStyleTag({ content: HIDE_CSS })
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
  })
  // CSS transitions are not driven by page.clock; reduced motion makes them 0.01ms.
  await page.waitForTimeout(400)
  await page.evaluate(() => document.fonts && document.fonts.ready)
  const actualTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (actualTheme !== theme) {
    throw new Error(`Expected data-theme="${theme}" at ${CLOCKS[theme]}, got "${actualTheme}"`)
  }
  return { context, page }
}

async function scrollTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0)
    window.dispatchEvent(new Event('scroll'))
  })
  await page.waitForTimeout(150)
}

function collectDom({ selector, hidden, props }) {
  const root = document.querySelector(selector)
  if (!root) return null
  const hiddenSel = hidden.join(', ')
  const isHidden = (el) => el.matches(hiddenSel) || !!el.parentElement?.closest(hiddenSel)
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const ownText = (el) =>
    norm(Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' '))
  const styleOf = (el) => {
    const cs = getComputedStyle(el)
    const o = {}
    for (const p of props) o[p] = cs.getPropertyValue(p)
    return o
  }
  const descendants = Array.from(root.querySelectorAll('*')).filter((el) => !isHidden(el))
  const describe = (el) => ({
    tag: el.tagName.toLowerCase(),
    className: el.getAttribute('class') || '',
    text: ownText(el),
  })
  const rect = root.getBoundingClientRect()
  return {
    selector,
    root: { ...describe(root), fullText: norm(root.textContent), box: { width: Math.round(rect.width), height: Math.round(rect.height) } },
    elementCount: descendants.length,
    elements: descendants.map(describe),
    styles: [root, ...descendants.slice(0, 50)].map((el) => ({ ...describe(el), style: styleOf(el) })),
  }
}

async function captureCombo(browser, vpName, theme) {
  const { context, page } = await preparePage(browser, vpName, theme)
  const tag = `${vpName}-${theme}`
  const files = []

  await scrollTop(page)
  const full = `full-${tag}.png`
  await page.screenshot({ path: resolve(OUT_DIR, full), fullPage: true })
  files.push(full)

  const dom = {}
  const targets = [
    ...SECTION_IDS.map((id) => [id, `#${id}`]),
    ...Object.entries(EXTRA_TARGETS),
  ]
  for (const [id, selector] of targets) {
    dom[id] = await page.evaluate(collectDom, { selector, hidden: HIDDEN_SELECTORS, props: STYLE_PROPS })
  }

  // nav: captured at scroll top (un-"scrolled" state).
  await scrollTop(page)
  const navFile = `section-nav-${tag}.png`
  await page.locator(EXTRA_TARGETS.nav).screenshot({ path: resolve(OUT_DIR, navFile) })
  files.push(navFile)

  const navHider = await page.addStyleTag({ content: HIDE_NAV_CSS })
  for (const [id, selector] of targets) {
    if (id === 'nav') continue
    const loc = page.locator(selector).first()
    await loc.scrollIntoViewIfNeeded()
    await page.waitForTimeout(100)
    const f = `section-${id}-${tag}.png`
    await loc.screenshot({ path: resolve(OUT_DIR, f) })
    files.push(f)
  }
  await navHider.evaluate((el) => el.remove())

  const domFile = `dom-${tag}.json`
  writeFileSync(resolve(OUT_DIR, domFile), JSON.stringify(dom, null, 2))
  files.push(domFile)

  await context.close()
  return files
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const startedAt = new Date().toISOString()
  const files = []
  try {
    for (const vpName of Object.keys(VIEWPORTS)) {
      for (const theme of Object.keys(CLOCKS)) {
        files.push(...(await captureCombo(browser, vpName, theme)))
        console.log(`captured ${vpName}/${theme}`)
      }
    }
  } finally {
    await browser.close()
  }
  const meta = {
    commit: COMMIT,
    baseUrl: BASE_URL,
    startedAt,
    finishedAt: new Date().toISOString(),
    browser: 'chromium (@playwright/test)',
    viewports: VIEWPORTS,
    contextOptions: CONTEXT_OPTIONS,
    clockInstants: CLOCKS,
    clockMode: 'page.clock.install({time}) + page.clock.pauseAt(time)',
    blockedHosts: BLOCKED_HOSTS.source,
    injectedCss: HIDE_CSS,
    sectionScreenshotCss: HIDE_NAV_CSS,
    hiddenSelectors: HIDDEN_SELECTORS,
    sections: SECTION_IDS,
    extraTargets: EXTRA_TARGETS,
    styleProps: STYLE_PROPS,
    domTextNote: 'elements[].text = element own (direct) text nodes, whitespace-collapsed; root.fullText = full textContent',
    files,
    captureScript: readFileSync(fileURLToPath(import.meta.url), 'utf8'),
  }
  writeFileSync(resolve(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log(`wrote ${files.length + 1} files to ${OUT_DIR}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
