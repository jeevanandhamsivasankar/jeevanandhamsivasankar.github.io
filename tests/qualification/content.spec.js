import {
  test, expect, only, gotoHome, freshPage, press, css, style, trackCount, resolvedColor, ownTexts,
  baselineTexts, baselineDom,
} from './helpers.js'
import { RESUME_DOWNLOAD, BEHANCE } from './expected.js'
import { statSync } from 'node:fs'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const norm = (s) => (s || '').replace(/[\s\u00a0]+/g, ' ').trim()

async function identity(page, id, { icon, label, title, cls }) {
  const sec = page.locator(`#${id}`)
  await expect(sec).toHaveAttribute('data-section', id)
  if (cls) for (const c of cls) await expect(sec).toHaveClass(new RegExp(`(^|\\s)${c}(\\s|$)`))
  const lab = sec.locator('.section-label')
  await expect(lab).toHaveCount(1)
  expect(norm(await lab.textContent())).toBe(`${icon} ${label}`.replace(/^(\S+) /, '$1'))
  await expect(lab.locator('span').first()).toHaveText(icon)
  expect(await css(lab.locator('span').first(), 'font-size')).toBe('13px')
  if (title) await expect(sec.locator('h2.section-title')).toHaveText(title)
  return sec
}
const colors = { amber: 'rgb(245, 158, 11)', cyan: 'rgb(34, 211, 238)', green: 'rgb(52, 211, 153)', violet: 'rgb(167, 139, 250)' }

test('QT-027 About section identity', async ({ page }) => {
  await gotoHome(page)
  const sec = await identity(page, 'about', { icon: 'person', label: '01 — About', title: 'Who I Am' })
  expect(await sec.evaluate((e) => e.tagName)).toBe('SECTION')
})

test('QT-028 About paragraphs and highlights', async ({ page }) => {
  await gotoHome(page)
  const paras = page.locator('.about-text p')
  await expect(paras).toHaveCount(4)
  expect(await ownTexts(page, '.about-text p')).toEqual(baselineTexts('about', { tag: 'p', cls: '' }))
  await expect(page.locator('.about-text .hl')).toHaveText([
    'Senior Software Engineer',
    'automotive and medical device industries',
    'Qt/QML and Embedded C++',
    'engineering rigour and UX design sensibility',
    'A-SPICE aligned development',
  ])
})

test('QT-029 About stat cards and colours', async ({ page }, testInfo) => {
  await gotoHome(page)
  const cards = page.locator('.stat-card')
  await expect(cards).toHaveCount(4)
  const exp = [
    ['4.9+', 'Years Experience', 'schedule', colors.amber],
    ['8+', 'Projects Shipped', 'rocket_launch', colors.cyan],
    ['2', 'Domains — Auto & Med', 'devices', colors.green],
    ['C++', 'Primary Language', 'code', colors.violet],
  ]
  for (let i = 0; i < 4; i++) {
    const c = cards.nth(i)
    await expect(c.locator('.stat-num')).toHaveText(exp[i][0])
    await expect(c.locator('.stat-label')).toHaveText(exp[i][1])
    await expect(c.locator('span').first()).toHaveText(exp[i][2])
    expect(await css(c.locator('.stat-num'), 'color')).toBe(exp[i][3])
  }
  if (testInfo.project.name === 'desktop-chromium') {
    expect(trackCount(await css(page.locator('.stats'), 'grid-template-columns'))).toBe(2)
    const boxes = await cards.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2)
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y + 10)
  }
})

test('QT-030 About grid single column at <= 900 px', async ({ page }, testInfo) => {
  await gotoHome(page)
  const grid = page.locator('.about-grid')
  if (testInfo.project.name === 'mobile-chromium') {
    expect(trackCount(await css(grid, 'grid-template-columns'))).toBe(1)
    expect(await css(grid, 'row-gap')).toBe('40px')
  } else {
    expect(trackCount(await css(grid, 'grid-template-columns'))).toBe(2)
  }
})

test('QT-031 Experience band identity', async ({ page }) => {
  await gotoHome(page)
  await identity(page, 'experience', { icon: 'work', label: '02 — Experience', title: 'Career', cls: ['exp-band', 'full-band'] })
})

test('QT-032 Experience timeline entries', async ({ page }) => {
  await gotoHome(page)
  const items = page.locator('.exp-item')
  await expect(items).toHaveCount(4)
  for (let i = 0; i < 4; i++) {
    await expect(items.nth(i).locator('.exp-dot')).toHaveCount(1)
    expect(await css(items.nth(i).locator('.exp-icon span').first(), 'color')).toBe(colors.amber)
  }
  const first = items.first()
  await expect(first.locator('.exp-role')).toHaveText('Senior Software Engineer')
  await expect(first.locator('.exp-company-name')).toHaveText('PixelExpert Technology & Services Pvt. Ltd.')
  await expect(first.locator('.exp-period')).toHaveText('SEP 2024 — JAN 2026')
  await expect(first.locator('.exp-company-loc')).toHaveText('Chennai, Tamil Nadu')
  await expect(items.nth(3).locator('.exp-role')).toHaveText('Graphics Designer Trainee')
  await expect(items.nth(3).locator('.exp-company-name')).toHaveText('Lapiz Digital Services Pvt. Ltd.')
  expect(await ownTexts(page, '.exp-desc')).toEqual(baselineTexts('experience', { cls: 'exp-desc' }))
})

test('QT-033 Skills section identity', async ({ page }) => {
  await gotoHome(page)
  await identity(page, 'skills', { icon: 'build', label: '03 — Skills', title: 'Toolbox' })
})

test('QT-034 Nine skill categories with 58 chips', async ({ page }) => {
  await gotoHome(page)
  const cats = page.locator('.skill-cat')
  await expect(cats).toHaveCount(9)
  expect(await ownTexts(page, '.cat-badge')).toEqual(baselineTexts('skills', { cls: 'cat-badge' }))
  const counts = await cats.evaluateAll((els) => els.map((e) => e.querySelectorAll('.skill-chip').length))
  expect(counts).toEqual([9, 10, 7, 5, 10, 5, 1, 8, 3])
  await expect(page.locator('.skill-chip')).toHaveCount(58)
  const info = await cats.evaluateAll((els) =>
    els.map((e) => {
      const b = getComputedStyle(e.querySelector('.cat-badge'))
      const line = getComputedStyle(e.querySelector('.cat-line'))
      const rgbOf = (c) => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).join(',')
      return {
        colorEqBorder: rgbOf(b.color) === rgbOf(b.borderTopColor),
        hasBg: b.backgroundColor !== 'rgba(0, 0, 0, 0)',
        line: line.backgroundImage.includes('linear-gradient'),
      }
    }),
  )
  for (const i of info) expect(i).toEqual({ colorEqBorder: true, hasBg: true, line: true })
})

test('QT-035 Skill chip icons resolve per strategy', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const chip = (name) => page.locator('.skill-chip').filter({ has: page.locator('.chip-label', { hasText: new RegExp(`^${name}$`) }) })
  const boxes = await page.locator('.chip-icon-wrap').evaluateAll((els) =>
    els.map((e) => [Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)]),
  )
  expect(boxes).toHaveLength(58)
  for (const b of boxes) expect(b).toEqual([22, 22])
  const git = chip('Git')
  await expect(git.locator('img[alt="git"][src="https://cdn.simpleicons.org/git"]')).toHaveCount(1)
  await expect(chip('LVGL').locator('svg')).toHaveCount(1)
  const ec = chip('Embedded C').locator('span').first()
  await expect(ec).toHaveText('code')
  expect(await css(ec, 'color')).toBe(colors.amber)
})

test('QT-036 Tech icon fallback when the CDN fails', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const siNames = await page.locator('.skill-chip').evaluateAll((els) =>
    els.filter((e) => e.querySelector('img')).map((e) => e.querySelector('.chip-label').textContent),
  )
  // 24 chips resolve through "si:" slugs; they use 19 distinct slugs (qt x5, stmicroelectronics x2)
  const slugs = await page.locator('.skill-chip img').evaluateAll((els) => new Set(els.map((i) => i.alt)).size)
  expect(slugs).toBe(19)
  expect(siNames).toHaveLength(24)
  const { page: bp, context } = await freshPage(browser, testInfo)
  await bp.route(/^https:\/\/cdn\.simpleicons\.org\//, (r) => r.abort('failed'))
  await gotoHome(bp)
  await expect(bp.locator('.skill-chip')).toHaveCount(58)
  // DEF-006: icons are loading="lazy"; bring every chip into view so each request fires (and fails)
  await bp.locator('.skill-chip').evaluateAll(async (els) => {
    for (const e of els) {
      e.scrollIntoView({ block: 'center' })
      await new Promise((r) => setTimeout(r, 30))
    }
  })
  await expect
    .poll(() => bp.locator('.skill-chip img').count(), { timeout: 15_000 })
    .toBe(0)
  const broken = await bp.evaluate(() => Array.from(document.querySelectorAll('.skill-chip img')).filter((i) => i.complete && i.naturalWidth === 0).length)
  expect(broken).toBe(0)
  for (const n of siNames) {
    const c = bp.locator('.skill-chip').filter({ has: bp.locator('.chip-label', { hasText: new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) })
    await expect(c.locator('span').first()).toHaveText('code')
  }
  await context.close()
})

test('QT-037 ISO 26262 awareness strip', async ({ page }) => {
  await gotoHome(page)
  const strip = page.locator('.iso-strip')
  await expect(strip.locator('.iso-strip-title')).toContainText('ISO 26262 Awareness')
  await expect(strip.locator('.iso-strip-icon span').first()).toHaveText('verified_user')
  await expect(strip.locator('.iso-strip-title span').first()).toHaveText('shield')
  expect(await ownTexts(page, '.iso-strip-desc')).toEqual(baselineTexts('skills', { cls: 'iso-strip-desc' }))
  await expect(strip.locator('.iso-chip')).toHaveText([
    'Safety-Aware UI', 'Deterministic Performance', 'Structured Validation', 'FMEA Awareness', 'Fail-Safe Patterns',
  ])
})

test('QT-038 Chip image filters per theme', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const img = page.locator('.chip-icon-wrap img').first()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  expect(await css(img, 'filter')).toBe('brightness(1.5) saturate(1.1)')
  await press(page.locator('.theme-btn').first())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await expect.poll(() => css(img, 'filter')).toBe('brightness(0.85) saturate(1.05)')
})

test('QT-039 Projects section identity', async ({ page }) => {
  await gotoHome(page)
  const sec = await identity(page, 'projects', { icon: 'rocket_launch', label: '04 — Engineering Projects', title: 'Selected Work' })
  expect(await css(sec, 'background-color')).toBe(await resolvedColor(page, '--bg2'))
})

test('QT-040 Six project cards with wide spans and tags', async ({ page }, testInfo) => {
  await gotoHome(page)
  const cards = page.locator('.project-card')
  await expect(cards).toHaveCount(6)
  const wideIdx = baselineDom('desktop')
    .projects.elements.filter((e) => /^project-card( |$)/.test(e.className))
    .map((e, i) => (/\bwide\b/.test(e.className) ? i : -1))
    .filter((i) => i >= 0)
  const gotWide = await cards.evaluateAll((els) => els.map((e, i) => (e.classList.contains('wide') ? i : -1)).filter((i) => i >= 0))
  expect(gotWide).toHaveLength(2)
  expect(gotWide).toEqual(wideIdx)
  await expect(cards.nth(gotWide[0]).locator('.project-title')).toHaveText(/SUV.*Infotainment/)
  await expect(cards.nth(gotWide[1]).locator('.project-title')).toHaveText(/ADAS.*Demonstrator/)
  await expect(cards.nth(gotWide[0]).locator('.project-num')).toHaveText('PROJECT_03')
  await expect(cards.first().locator('.project-title')).toHaveText('Physiotherapy Laser Therapy HMI')
  await expect(cards.first().locator('.ptag2')).toHaveCount(5)
  await expect(cards.nth(2).locator('.ptag2')).toHaveCount(8)
  for (let i = 0; i < 6; i++) {
    const c = cards.nth(i)
    for (const sel of ['.project-period', '.pico span', '.project-num', '.project-domain', '.project-title', '.project-desc']) {
      expect((await c.locator(sel).first().textContent()).trim().length, `${sel} of card ${i}`).toBeGreaterThan(0)
    }
  }
  if (testInfo.project.name === 'desktop-chromium') {
    const gw = (await page.locator('.projects-grid').boundingBox()).width
    for (const i of gotWide) expect((await cards.nth(i).boundingBox()).width).toBeGreaterThan(gw - 2)
  }
})

test('QT-041 Projects grid single column at <= 900 px', async ({ page }, testInfo) => {
  await gotoHome(page)
  const grid = page.locator('.projects-grid')
  if (testInfo.project.name === 'mobile-chromium') {
    expect(trackCount(await css(grid, 'grid-template-columns'))).toBe(1)
    const s = await style(page.locator('.project-card.wide').first(), ['grid-column-start', 'grid-column-end'])
    expect(s['grid-column-start']).toBe('1')
    expect(['auto', '2']).toContain(s['grid-column-end'])
  } else {
    expect(trackCount(await css(grid, 'grid-template-columns'))).toBe(2)
  }
})

test('QT-042 Design section identity', async ({ page }) => {
  await gotoHome(page)
  const sec = await identity(page, 'design', { icon: 'brush', label: '05 — Design Portfolio', title: 'Creative Work', cls: ['full-band'] })
  expect(await css(sec, 'background-color')).toBe(await resolvedColor(page, '--bg2'))
  expect(await css(sec, 'border-top-width')).not.toBe('0px')
})

test('QT-043 Five Behance design cards', async ({ page }) => {
  await gotoHome(page)
  const cards = page.locator('.behance-card')
  await expect(cards).toHaveCount(5)
  await expect(page.locator('.behance-card.wide')).toHaveCount(1)
  await expect(page.locator('.behance-card.wide .bc-title')).toHaveText('Infotainment UI Modules')
  expect(await ownTexts(page, '.bc-title')).toEqual(baselineTexts('design', { cls: 'bc-title' }))
  expect(await ownTexts(page, '.bc-tag')).toEqual(baselineTexts('design', { cls: 'bc-tag' }))
  expect(await ownTexts(page, '.bc-desc')).toEqual(baselineTexts('design', { cls: 'bc-desc' }))
  for (let i = 0; i < 5; i++) {
    const c = cards.nth(i)
    await expect(c.locator('.behance-card-bg svg').first()).toHaveCount(1)
    await expect(c.locator('.behance-overlay')).toHaveCount(1)
    await expect(c.locator('.bc-tag span').first()).not.toHaveText('')
    await expect(c.locator('.bc-cta')).toContainText('View on Behance')
  }
})

test('QT-044 Design cards link to Behance in a new tab', async ({ page }) => {
  await gotoHome(page)
  const cards = page.locator('.behance-card')
  for (let i = 0; i < 5; i++) {
    await expect(cards.nth(i)).toHaveAttribute('href', BEHANCE)
    await expect(cards.nth(i)).toHaveAttribute('target', '_blank')
    await expect(cards.nth(i)).toHaveAttribute('rel', 'noopener noreferrer')
  }
})

test('QT-045 Education section identity', async ({ page }) => {
  await gotoHome(page)
  await identity(page, 'education', { icon: 'school', label: '06 — Education', title: 'Academic Background' })
})

test('QT-046 Degree card', async ({ page }) => {
  await gotoHome(page)
  const card = page.locator('.edu-card').first()
  await expect(card.locator('.edu-degree')).toHaveText('B.E. — Electronics & Communication Engineering')
  await expect(card.locator('.edu-school')).toHaveText('Adhiparasakthi College of Engineering (Anna University), Tamil Nadu')
  const tags = card.locator('.edu-tag')
  await expect(tags).toHaveText(['2015 – 2020', 'CGPA: 6.34 / 10', 'ECE'])
  for (let i = 0; i < 3; i++) expect(await css(tags.nth(i), 'color')).toBe(colors.cyan)
})

test('QT-047 Key Domain Expertise card', async ({ page }) => {
  await gotoHome(page)
  const card = page.locator('.edu-card').nth(1)
  await expect(card.locator('.edu-degree')).toHaveText('Key Domain Expertise')
  const ico = card.locator('.edu-icon span').first()
  await expect(ico).toHaveText('military_tech')
  expect(await css(ico, 'color')).toBe(colors.amber)
  expect(await ownTexts(page, '.edu-card:nth-child(2) .edu-school')).toEqual(
    baselineTexts('education', { cls: 'edu-school' }).slice(1),
  )
  const chips = card.locator('.edu-row span')
  await expect(chips).toHaveText(['Automotive HMI', 'Medical Device HMI', 'Instrument Clusters', 'Infotainment', 'ADAS / 3D Viz'])
  for (let i = 0; i < 5; i++) expect(await css(chips.nth(i), 'color')).toBe(await resolvedColor(page, '--amber'))
})

test('QT-049 Certifications band identity', async ({ page }) => {
  await gotoHome(page)
  const sec = await identity(page, 'certifications', { icon: 'verified', label: '07 — Certifications', title: 'Credentials' })
  expect(await css(sec, 'background-color')).toBe(await resolvedColor(page, '--surf'))
  expect(await css(sec, 'border-top-width')).not.toBe('0px')
  expect(await css(sec, 'border-bottom-width')).not.toBe('0px')
})

test('QT-050 Certification cards and column counts per breakpoint', async ({ page }) => {
  await gotoHome(page)
  const cards = page.locator('.cert-card')
  await expect(cards).toHaveCount(3)
  expect(await ownTexts(page, '.cert-name')).toEqual(baselineTexts('certifications', { cls: 'cert-name' }))
  expect(await ownTexts(page, '.cert-org')).toEqual(baselineTexts('certifications', { cls: 'cert-org' }))
  await expect(cards.nth(0).locator('.cert-name')).toHaveText('Qt 6 Core — Beginner, Intermediate & Advanced')
  await expect(cards.nth(1).locator('.cert-name')).toHaveText('QML for Beginners')
  await expect(cards.nth(2).locator('.cert-name')).toHaveText('Google UX Design Professional Certificate')
  const org = (await cards.locator('.cert-org').allTextContents()).map((s) => s.toUpperCase())
  expect(org).toEqual(['UDEMY', 'UDEMY', 'COURSERA — CREDLY VERIFIED'])
  await expect(cards.locator('.cert-ico span')).toHaveText(['school', 'school', 'verified_user'])
  for (const [w, n] of [[1366, 3], [901, 3], [900, 2], [800, 2], [541, 2], [540, 1], [390, 1]]) {
    await page.setViewportSize({ width: w, height: 800 })
    expect(trackCount(await css(page.locator('.certs-grid'), 'grid-template-columns')), `width ${w}`).toBe(n)
  }
})

test('QT-051 Resume section identity', async ({ page }) => {
  await gotoHome(page)
  await identity(page, 'resume', { icon: 'description', label: '08 — Resume' })
  await expect(page.locator('#resume h3')).toHaveText('Download My Resume')
  expect(await ownTexts(page, '.resume-info p')).toEqual(baselineTexts('resume', { tag: 'p', cls: '' }).slice(0, 1))
})

test('QT-052 Resume Download PDF and View Online buttons', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const dl = page.locator('.resume-info a', { hasText: 'Download PDF' })
  const view = page.locator('.resume-info a', { hasText: 'View Online' })
  await expect(dl).toHaveClass(/btn-green/)
  const href = await dl.getAttribute('href')
  expect(href.endsWith('Jeevanandham_Resume.pdf')).toBe(true)
  await expect(dl).toHaveAttribute('download', RESUME_DOWNLOAD)
  await expect(view).toHaveClass(/btn-outline/)
  await expect(view).toHaveAttribute('href', href)
  await expect(view).toHaveAttribute('target', '_blank')
  await expect(view).toHaveAttribute('rel', 'noopener noreferrer')
  const [download] = await Promise.all([page.waitForEvent('download'), dl.click()])
  expect(download.suggestedFilename()).toBe(RESUME_DOWNLOAD)
  const saved = await download.path()
  expect(statSync(saved).size).toBeGreaterThan(0)
})

test('QT-053 Resume preview card', async ({ page }) => {
  await gotoHome(page)
  const card = page.locator('.resume-preview')
  expect(norm(await card.locator('.resume-preview-header').textContent())).toBe('picture_as_pdfJEEVANANDHAM_RESUME.PDF · 3 PAGES')
  await expect(card.locator('.rdp-name')).toHaveText('S. JEEVANANDHAM')
  await expect(card.locator('.rdp-role')).toHaveText('SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI | UI/UX | QT/QML | EMBEDDED C++')
  const text = norm(await card.textContent())
  expect(text).toContain('Chennai')
  expect(text).toContain('jeevanandhamsivashankaran@gmail.com')
  expect(text).toContain('+91 8111010315')
  expect(text).toContain('KEY SKILLS')
  const rows = card.locator('.rdp-skill-row')
  await expect(rows).toHaveCount(4)
  const fills = await rows.evaluateAll((els) => els.map((e) => ({ w: e.querySelector('.rdp-bar-fill').style.width, bg: e.querySelector('.rdp-bar-fill').style.background })))
  expect(fills.map((f) => f.w)).toEqual(['92%', '88%', '85%', '78%'])
  for (const f of fills) expect(f.bg).toContain('gradient')
  const dl = card.locator('a[download]')
  await expect(dl).toHaveText('download' + 'Download')
  await expect(dl).toHaveAttribute('download', RESUME_DOWNLOAD)
  const view = card.locator('a[target="_blank"]')
  await expect(view).toHaveCount(1)
  await expect(view).toHaveText('open_in_newView')
  await expect(view).toHaveAttribute('rel', 'noopener noreferrer')
})

test('QT-055 Contact section identity', async ({ page }) => {
  await gotoHome(page)
  const sec = await identity(page, 'contact', { icon: 'mail', label: '09 — Contact', title: "Let's Work Together" })
  expect(await css(sec, 'text-align')).toBe('center')
  expect(await ownTexts(page, '.contact-sub')).toEqual(baselineTexts('contact', { cls: 'contact-sub' }))
})

test('QT-056 Email and phone links', async ({ page }) => {
  await gotoHome(page)
  const email = page.locator('.c-email')
  await expect(email).toHaveAttribute('href', 'mailto:jeevanandhamsivashankaran@gmail.com')
  await expect(email.locator('span').first()).toHaveText('mail')
  expect(await css(email, 'color')).toBe(colors.amber)
  const phone = page.locator('.c-phone')
  await expect(phone).toHaveAttribute('href', 'tel:+918111010315')
  await expect(phone).toHaveText('phone+91 8111010315')
  await expect(phone.locator('span').first()).toHaveText('phone')
  expect(await css(phone, 'color')).toBe(colors.green)
})

test('QT-057 Social profile links open safely in new tabs', async ({ page }) => {
  await gotoHome(page)
  const rows = [
    ['.c-li', 'https://linkedin.com/in/jeevanandhamsivashankaran/', 'open_in_new'],
    ['.c-bh', BEHANCE, 'brush'],
    ['.c-gh', 'https://github.com/jeevanandhamsivasankar', 'terminal'],
  ]
  for (const [sel, href, icon] of rows) {
    const a = page.locator(sel)
    await expect(a).toHaveAttribute('href', href)
    await expect(a).toHaveAttribute('target', '_blank')
    await expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(a.locator('span').first()).toHaveText(icon)
  }
  await expect(page.locator('.c-bh')).toHaveText('brushBehance Portfolio')
})

test('QT-058 Contact location line', async ({ page }) => {
  await gotoHome(page)
  const loc = page.locator('.contact-loc')
  await expect(loc).toHaveText('location_onChennai, Tamil Nadu, India')
  await expect(loc.locator('span').first()).toHaveText('location_on')
})
