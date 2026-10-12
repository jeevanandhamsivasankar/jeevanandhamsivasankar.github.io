import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test, expect, gotoHome, freshPage, loadAllSections } from './helpers.js'
import { THEME_KEY } from './expected.js'

const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const rowLabels = (card) => card.locator('.cs-row dt').allTextContents()

test('QT-160 each card: Problem, Role, Solution, Impact in order (present rows), with domain, period, tags and colour retained', async ({ page }) => {
  await gotoHome(page)
  await loadAllSections(page)
  const cards = page.locator('.project-card')
  await expect(cards).toHaveCount(6)
  const order = ['Problem', 'Role', 'Solution', 'Impact']
  for (let i = 0; i < 6; i++) {
    const card = cards.nth(i)
    const labels = await rowLabels(card)
    expect(labels.length).toBeGreaterThan(0)
    expect(labels).toEqual(order.filter((l) => labels.includes(l)))
    await expect(card.locator('.project-period')).not.toBeEmpty()
    await expect(card.locator('.project-domain')).not.toBeEmpty()
    expect(await card.locator('.ptag2').count()).toBeGreaterThan(0)
    expect(await card.evaluate((e) => e.style.getPropertyValue('--pc'))).toMatch(/^#[0-9a-f]{6}$/i)
    await expect(card.locator('.media-slot')).toHaveCount(1)
  }
})

test('QT-161 rows without a supported fact are omitted: no Impact row, no TBD, for projects 1, 4, 5', async ({ page }) => {
  await gotoHome(page)
  await loadAllSections(page)
  const cards = page.locator('.project-card')
  for (const i of [0, 3, 4]) expect(await rowLabels(cards.nth(i))).not.toContain('Impact')
  expect(await rowLabels(cards.nth(1))).toContain('Impact')
  expect(await page.locator('#projects').innerText()).not.toMatch(/TBD|lorem|coming soon/i)
})

test('QT-161 NDA project 5 shows no OEM name, logo, screenshot or placeholder', async ({ page }) => {
  await page.goto('/?placeholders=1')
  await loadAllSections(page)
  const nda = page.locator('.project-card').nth(4)
  await expect(nda.locator('img')).toHaveCount(0)
  await expect(nda.locator('.media-slot')).not.toContainText('PLACEHOLDER')
  // other cards do show the labelled placeholder in preview mode
  await expect(page.locator('.project-card').first().locator('.media-slot')).toContainText('PLACEHOLDER - OWNER MEDIA')
  const text = await nda.innerText()
  expect(text).toContain('leading two-wheeler OEM')
})

test('QT-162 layout: no horizontal scroll; wide cards span the grid on desktop, single column on mobile', async ({ page }, testInfo) => {
  await gotoHome(page)
  await loadAllSections(page)
  const noScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noScroll).toBe(true)
  const wide = page.locator('.project-card.wide').first()
  const [cardW, gridW] = await Promise.all([
    wide.evaluate((e) => e.getBoundingClientRect().width),
    page.locator('.projects-grid').evaluate((e) => e.getBoundingClientRect().width),
  ])
  if (testInfo.project.name === 'desktop-chromium') expect(Math.abs(cardW - gridW)).toBeLessThan(2)
  else expect(cardW).toBeLessThanOrEqual(390)
})

for (const theme of ['night', 'day']) {
  test(`QT-162 axe: project cards have 0 serious/critical violations (${theme})`, async ({ browser }, testInfo) => {
    const { page, context } = await freshPage(browser, testInfo, { bypassCSP: true })
    await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [THEME_KEY, theme])
    await gotoHome(page, { at: null })
    await loadAllSections(page)
    await page.addScriptTag({ content: AXE })
    const res = await page.evaluate(async () => {
      const r = await window.axe.run({ include: [['#projects']] }, { resultTypes: ['violations'] })
      return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.slice(0, 5).map((n) => n.target.join(' ')).join(' | ')}`)
    })
    expect(res).toEqual([])
    await context.close()
  })
}
