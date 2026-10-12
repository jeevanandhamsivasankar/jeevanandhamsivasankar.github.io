import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test, expect, gotoHome, freshPage, loadAllSections, isMobile } from './helpers.js'
import { THEME_KEY } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const nums = (s) => s.match(/[\d.]+/g).map(Number)

async function themed(browser, testInfo, theme, extra = {}) {
  const { page, context } = await freshPage(browser, testInfo, extra)
  await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [THEME_KEY, theme])
  await gotoHome(page, { at: null })
  return { page, context }
}

for (const theme of ['night', 'day']) {
  test(`QT-134 focus ring visible with >= 3:1 contrast (${theme})`, async ({ browser }, testInfo) => {
    const { page, context } = await themed(browser, testInfo, theme)
    await page.keyboard.press('Tab') // skip link
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const el = document.activeElement
      const cs = getComputedStyle(el)
      return { w: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor, bg: getComputedStyle(document.documentElement.querySelector('body')).backgroundColor, tag: el.tagName }
    })
    expect(r.style).toBe('solid')
    expect(parseFloat(r.w)).toBeGreaterThanOrEqual(2)
    expect(ratio(nums(r.color).slice(0, 40), nums(r.bg).slice(0, 3))).toBeGreaterThanOrEqual(3)
    await context.close()
  })

  test(`QT-136 axe: 0 serious/critical violations (${theme})`, async ({ browser }, testInfo) => {
    const { page, context } = await themed(browser, testInfo, theme, { bypassCSP: true })
    await loadAllSections(page)
    await page.addScriptTag({ content: AXE })
    const res = await page.evaluate(async () => {
      const r = await window.axe.run({ exclude: [['.project-card']] }, { resultTypes: ['violations'] }) // project cards: per-project hues move to --sig-* tokens in US-211 (Dev-4); TE to drop this exclude after merge
      return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.slice(0, 40).map((n) => n.target.join(' ')).join(' | ')}`)
    })
    expect(res).toEqual([])
    await context.close()
  })
}

test('QT-135 skip link appears on first Tab and activates #main; targets >= 44px', async ({ page }, testInfo) => {
  await gotoHome(page)
  await page.keyboard.press('Tab')
  const skip = page.locator('.skip-link')
  await expect(skip).toBeFocused()
  expect((await skip.boundingBox()).y).toBeGreaterThanOrEqual(0)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  const sizes = await page.evaluate((mobile) => {
    const sel = mobile ? '.hamburger' : '.nav-links .nav-link, .nav-right .theme-btn'
    return [...document.querySelectorAll(sel)].map((e) => Math.round(e.getBoundingClientRect().height))
  }, isMobile(testInfo))
  expect(sizes.length).toBeGreaterThan(0)
  for (const h of sizes) expect(h).toBeGreaterThanOrEqual(44)
})

test('QT-135 mobile menu items and theme button are >= 44px tall', async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo), 'mobile only')
  await gotoHome(page)
  await page.locator('.hamburger').click()
  const hs = await page.evaluate(() => [...document.querySelectorAll('.mobile-menu a, .mobile-menu button')].map((e) => Math.round(e.getBoundingClientRect().height)))
  expect(hs.length).toBeGreaterThan(0)
  for (const h of hs) expect(h).toBeGreaterThanOrEqual(44)
})

test('QT-134 Escape closes the mobile menu, returns focus to the hamburger; Tab cycles within the menu', async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo), 'mobile only')
  await gotoHome(page)
  const burger = page.locator('.hamburger')
  await burger.click()
  await expect(page.locator('.mobile-menu.open')).toBeVisible()
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => !!document.activeElement.closest('#mobile-menu') || document.activeElement.classList.contains('hamburger'))
    expect(inside).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.locator('.mobile-menu.open')).toHaveCount(0)
  await expect(burger).toBeFocused()
})
