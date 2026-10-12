import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  test, expect, only, gotoHome, freshPage, press, ownTexts, collectErrors, revealAll,
  settleScroll, distAssets, ROOT, waitSections,
} from './helpers.js'
import { SECTION_IDS, SECTION_LABELS } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-072 Section order, ids and dividers', async ({ page }) => {
  await gotoHome(page)
  const r = await page.evaluate(() => ({
    ids: Array.from(document.querySelectorAll('[data-section]')).map((e) => [e.id, e.dataset.section]),
    dividers: document.querySelectorAll('main .divider').length,
    allDividers: document.querySelectorAll('.divider').length,
  }))
  expect(r.ids.map((x) => x[1])).toEqual(SECTION_IDS)
  for (const [id, ds] of r.ids) expect(id).toBe(ds)
  expect(new Set(r.ids.map((x) => x[0])).size).toBe(10)
  expect(r.dividers).toBe(9)
  expect(r.allDividers).toBe(9)
})

test('QT-074 Section labels and headings', async ({ page }) => {
  await gotoHome(page)
  const labels = page.locator('.section-label')
  await expect(labels).toHaveCount(9)
  expect(await ownTexts(page, '.section-label')).toEqual(SECTION_LABELS)
  const sizes = await labels.evaluateAll((els) => els.map((e) => getComputedStyle(e.querySelector('span')).fontSize))
  expect(sizes).toEqual(Array(9).fill('13px'))
  await expect(page.locator('h2.section-title')).toHaveCount(8)
  await expect(page.locator('#resume .section-title')).toHaveCount(0)
  await expect(page.locator('#resume h3')).toHaveText('Download My Resume')
  await expect(page.locator('#hero .section-label')).toHaveCount(0)
})

test('QT-075 Footer text', async ({ page }) => {
  await gotoHome(page)
  const f = page.locator('footer')
  const parts = await f.evaluate((e) => ({
    text: Array.from(e.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim(),
    icons: Array.from(e.children).map((c) => c.textContent),
    first: e.firstElementChild === e.firstChild,
    last: e.lastElementChild === e.lastChild,
  }))
  expect(parts.text).toBe('© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION')
  expect(parts.icons).toEqual(['developer_board', 'developer_board'])
  expect(parts.first && parts.last).toBe(true)
})

test('QT-076 Lazy sections still navigable; deep link to a lazy section', async ({ page, browser }, testInfo) => {
  const files = distAssets().filter((f) => f.endsWith('.js'))
  const chunk = (n) => files.filter((f) => f.startsWith(`${n}-`))
  for (const n of ['About', 'Experience', 'Skills', 'Projects', 'Design', 'Education', 'Certifications', 'Resume', 'Contact']) {
    expect(chunk(n).length, `chunk for ${n}`).toBe(1)
  }
  expect(files.filter((f) => /^(Hero|Nav)-/.test(f))).toEqual([])
  // fresh load, immediately navigate to Contact
  await gotoHome(page, { sections: false })
  if (testInfo.project.name === 'mobile-chromium') {
    await press(page.locator('.hamburger'))
    await press(page.locator('.mobile-menu a[href="#contact"]'))
  } else {
    await press(page.locator('.nav-links a[href="#contact"]'))
  }
  await waitSections(page)
  await expect(page.locator('#contact .section-label')).toBeVisible()
  await expect(page.locator('#contact .section-label')).toBeInViewport({ timeout: 15_000 })
  await settleScroll(page, { from: 0 })
  // Contact is the last section: the page bottom limits the scroll, so only require the label below the fixed nav
  const labelTop = await page.evaluate(() => document.querySelector('#contact .section-label').getBoundingClientRect().top)
  expect(labelTop).toBeGreaterThanOrEqual(54)
  expect(labelTop).toBeLessThan(400)
  // deep link
  const c = await freshPage(browser, testInfo)
  await c.page.goto('/#resume')
  await waitSections(c.page)
  await expect(c.page.locator('#resume .section-label')).toBeInViewport({ timeout: 15_000 })
  await c.context.close()
})

test('QT-077 Validated, frozen content ships without load-time errors', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  const errors = collectErrors(page)
  await gotoHome(page)
  await revealAll(page)
  expect(errors.pageErrors).toEqual([])
  await expect(page.locator('[data-section]')).toHaveCount(10)
  await expect(page.locator('[data-section-placeholder]')).toHaveCount(0)
  const dir = join(ROOT, 'src/data')
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const src = readFileSync(join(dir, f), 'utf8')
    expect(src, `${f} imports models`).toMatch(/from\s+["'][./]*\/?models\/[^"']*["']/)
    expect(src, `${f} uses create* factories`).toMatch(/\bcreate[A-Z]\w*/)
  }
})

test('QT-078 A failing lazy section is contained by its ErrorBoundary', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await page.route('**/assets/Projects-*.js', (r) => r.abort())
  await page.goto('/')
  await page.waitForSelector('#hero')
  await expect(page.locator('#projects')).toContainText(/section failed to load/i, { timeout: 20_000 })
  await expect(page.locator('#projects button')).toContainText(/reload/i)
  await expect(page.locator('#projects[data-section-placeholder]')).toHaveCount(0)
  await revealAll(page)
  const others = ['hero', 'about', 'experience', 'skills', 'design', 'education', 'certifications', 'resume', 'contact']
  for (const id of others) {
    await expect(page.locator(`#${id}`)).toBeVisible()
    await expect(page.locator(`#${id}[data-section-placeholder]`)).toHaveCount(0)
    await expect(page.locator(`#${id} .section-label, #${id}.hero`).first()).toBeVisible()
  }
  await expect(page.locator('nav.nav')).toBeVisible()
  await expect(page.locator('footer')).toBeVisible()
})

test('QT-079 Responsive grid column counts at both breakpoints', async ({ page }, testInfo) => {
  await gotoHome(page)
  const grids = { hero: '.hero', about: '.about-grid', projects: '.projects-grid', design: '.behance-grid', education: '.edu-grid', resume: '.resume-inner', certs: '.certs-grid' }
  // STP names .resume-grid/.skills-grid/.cert-grid; the markup uses .resume-inner/.certs-grid and has no .skills-grid element
  expect(await page.locator('.skills-grid').count()).toBe(0)
  testInfo.annotations.push({ type: 'note', description: 'no .skills-grid element exists in markup or baseline; skills column rule untestable' })
  const read = () =>
    page.evaluate((g) => {
      const o = {}
      for (const [k, sel] of Object.entries(g)) o[k] = getComputedStyle(document.querySelector(sel)).gridTemplateColumns.split(' ').length
      const pad = getComputedStyle(document.querySelector('.section-wrap'))
      o.padL = pad.paddingLeft
      o.padR = pad.paddingRight
      const wide = Array.from(document.querySelectorAll('.btn')).map((b) => {
        const p = b.parentElement
        const cs = getComputedStyle(p)
        return Math.abs(b.getBoundingClientRect().width - (p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)))
      })
      o.btnFull = wide.every((d) => d <= 1.5)
      return o
    }, grids)
  for (const w of [1366, 901, 900, 541, 540, 390, 320]) {
    await page.setViewportSize({ width: w, height: 800 })
    const r = await read()
    if (w > 900) {
      expect.soft(r, `width ${w}`).toMatchObject({ hero: 3, about: 2, projects: 2, design: 2, education: 2, resume: 2, certs: 3, padL: '44px', padR: '44px' })
    } else {
      expect.soft(r, `width ${w}`).toMatchObject({ hero: 1, about: 1, projects: 1, design: 1, education: 1, resume: 1, certs: w > 540 ? 2 : 1, padL: '24px', padR: '24px' })
    }
    if (w <= 540) expect.soft(r.btnFull, `buttons full width at ${w}`).toBe(true)
  }
})

test('QT-080 noscript message without JavaScript', async ({ browser }, testInfo) => {
  only(testInfo, 'D')
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto(`${testInfo.project.use.baseURL}/`)
  expect(await page.locator('noscript').textContent()).toBe('This portfolio needs JavaScript enabled to display.')
  expect(await page.locator('noscript').isVisible()).toBe(true)
  await context.close()
})

test('QT-113 No horizontal scroll from 320 to 2560 px', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  test.setTimeout(120_000)
  const widths = [320, 390, 540, 541, 900, 901, 1366, 2560]
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 800 })
    await page.goto('/')
    await waitSections(page)
    await revealAll(page)
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
    expect.soft(m.sw, `scrollWidth ${m.sw} > innerWidth ${m.iw} at ${w}px`).toBeLessThanOrEqual(m.iw)
  }
})
