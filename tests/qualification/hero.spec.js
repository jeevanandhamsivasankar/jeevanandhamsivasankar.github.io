/* global document, window, getComputedStyle */
import { test, expect, only, gotoHome, freshPage, css, resolvedColor, collectErrors, baselineFullText } from './helpers.js'
import { ROLES, RESUME_DOWNLOAD } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-013 Hero three-column layout on desktop', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const hero = page.locator('section#hero.hero')
  await expect(hero).toHaveAttribute('data-section', 'hero')
  const kids = await hero.evaluate((el) =>
    Array.from(el.children).map((c) => c.className).filter((c) => /^hero-(content|center|right)$/.test(c)),
  )
  expect(kids).toEqual(['hero-content', 'hero-center', 'hero-right'])
  const cols = (await css(hero, 'grid-template-columns')).split(' ')
  expect(cols.slice(-2)).toEqual(['360px', '260px'])
  const box = await hero.boundingBox()
  expect(box.height).toBeGreaterThanOrEqual(800)
})

test('QT-014 Hero tag line and single h1', async ({ page }) => {
  await gotoHome(page)
  const tag = page.locator('.hero-tag')
  await expect(tag).toContainText('Senior HMI Engineer · Chennai, India')
  await expect(tag.locator('span').first()).toHaveText('developer_board')
  await expect(page.locator('h1')).toHaveCount(1)
  const h1 = page.locator('h1')
  const h1text = await h1.evaluate((e) => {
    const c = e.cloneNode(true)
    c.querySelectorAll('br').forEach((b) => b.replaceWith(' '))
    return c.textContent.replace(/\s+/g, ' ').trim()
  })
  expect(h1text).toBe('S. Jeevanandham B.ECE')
  await expect(h1.locator('em')).toHaveText('Jeevanandham')
  await expect(h1.locator('br')).toHaveCount(1)
  expect(await css(h1.locator('em'), 'color')).toBe(await resolvedColor(page, '--amber'))
})

test('QT-015 Typewriter cycles the five roles in order and wraps', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  test.setTimeout(180_000)
  await gotoHome(page, { pause: true, sections: false })
  const tw = page.locator('.hero-typewriter > span').first()
  const seen = []
  for (let t = 0; t <= 60_000; t += 50) {
    await page.clock.runFor(50)
    const text = (await tw.textContent()) ?? ''
    if (ROLES.includes(text) && seen[seen.length - 1] !== text) seen.push(text)
  }
  expect(seen.slice(0, 6)).toEqual([...ROLES, ROLES[0]])
  const cursor = page.locator('.hero-typewriter .cursor')
  await expect(cursor).toHaveText('|')
  expect(await css(cursor, 'color')).toBe(await resolvedColor(page, '--amber'))
})

test('QT-016 Typewriter timing in the production build', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await gotoHome(page, { pause: true, sections: false })
  const tw = page.locator('.hero-typewriter > span').first()
  const read = async () => {
    await page.waitForTimeout(40)
    return (await tw.textContent()) ?? ''
  }
  const word = ROLES[0]
  await page.clock.runFor(899)
  expect(await read()).toBe('')
  await page.clock.runFor(1) // 900
  expect(await read()).toBe('Q')
  await page.clock.runFor(1104) // 2004
  expect((await read()).length).toBe(17)
  await page.clock.runFor(1) // 2005
  expect(await read()).toBe(word)
  await page.clock.runFor(64) // 2069
  expect(await read()).toBe(word)
  await page.clock.runFor(1800) // 3869
  expect(await read()).toBe(word)
  await page.clock.runFor(1) // 3870
  expect((await read()).length).toBe(17)
  await page.clock.runFor(930) // 4800
  expect(await read()).toBe('E')
})

test('QT-017 Hero bio text and emphasis', async ({ page }) => {
  await gotoHome(page)
  const expected = /\|(Senior Software Engineer.*?programs\.)/.exec(baselineFullText('hero'))[1]
  const bio = page.locator('.hero-bio')
  expect((await bio.textContent()).replace(/\s+/g, ' ').trim()).toBe(expected)
  const strong = bio.locator('strong')
  await expect(strong).toHaveCount(2)
  await expect(strong).toHaveText(['4.9+ years', 'Qt/QML, Embedded C++, and real-time UI engineering'])
})

test('QT-018 Eight hero skill badges in order', async ({ page }) => {
  await gotoHome(page)
  await expect(page.locator('.hero-badges .badge')).toHaveText([
    'Qt / QML', 'Embedded C++', 'LVGL', 'CAN Bus', 'A-SPICE', 'Linux HMI', 'SQLite3', 'FreeRTOS',
  ])
})

test('QT-019 Hero call-to-action links and resume download filename', async ({ page, request }) => {
  await gotoHome(page)
  const ctas = page.locator('.hero-cta a')
  await expect(ctas).toHaveCount(3)
  const rows = [
    ['btn-amber', '#projects', 'rocket_launch', 'View Projects'],
    ['btn-outline', '#contact', 'mail', 'Get In Touch'],
    ['btn-green', null, 'download', 'Resume'],
  ]
  for (let i = 0; i < 3; i++) {
    const a = ctas.nth(i)
    await expect(a).toHaveClass(new RegExp(rows[i][0]))
    await expect(a.locator('span').first()).toHaveText(rows[i][2])
    await expect(a).toContainText(rows[i][3])
    if (rows[i][1]) await expect(a).toHaveAttribute('href', rows[i][1])
  }
  const resume = ctas.nth(2)
  const href = await resume.getAttribute('href')
  expect(href.endsWith('Jeevanandham_Resume.pdf')).toBe(true)
  await expect(resume).toHaveAttribute('download', RESUME_DOWNLOAD)
  const res = await request.get(new URL(href, page.url()).toString())
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('application/pdf')
  const [download] = await Promise.all([page.waitForEvent('download'), resume.click()])
  expect(download.suggestedFilename()).toBe(RESUME_DOWNLOAD)
})

test('QT-020 Gauge widget content', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const g = page.locator('.gauge-widget')
  await expect(g.locator('.gauge-label-top')).toHaveText('⚡ Live HMI Cluster Demo')
  await expect(g.locator('svg')).toHaveCount(1)
  const stats = g.locator('.gauge-stat')
  await expect(stats).toHaveCount(3)
  const exp = [['4.9+', 'Yrs Exp', 'rgb(245, 158, 11)'], ['8+', 'Projects', 'rgb(34, 211, 238)'], ['2', 'Domains', 'rgb(52, 211, 153)']]
  for (let i = 0; i < 3; i++) {
    await expect(stats.nth(i).locator('.gauge-stat-val')).toHaveText(exp[i][0])
    await expect(stats.nth(i).locator('.gauge-stat-lbl')).toHaveText(exp[i][1])
    expect(await css(stats.nth(i).locator('.gauge-stat-val'), 'color')).toBe(exp[i][2])
  }
  await expect(g.locator('.gauge-stack-tag')).toHaveText(['Qt/QML', 'LVGL', 'C++', 'CAN', 'UART'])
})

test('QT-021 Speedometer SVG geometry and labels', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page, { pause: true, sections: false })
  const svg = page.locator('.gauge-widget svg')
  await expect(svg).toHaveAttribute('viewBox', '0 0 260 260')
  expect(await css(svg, 'max-width')).toBe('320px')
  const info = await svg.evaluate((el) => {
    const lines = Array.from(el.querySelectorAll('line'))
    const ticks = lines.filter((l) => !(l.getAttribute('stroke') || '').startsWith('url('))
    const needle = lines.find((l) => (l.getAttribute('stroke') || '').startsWith('url('))
    return {
      ticks: ticks.length,
      major: ticks.filter((l) => l.getAttribute('stroke-width') === '2').length,
      needle: { x: +needle.getAttribute('x2'), y: +needle.getAttribute('y2') },
      texts: Array.from(el.querySelectorAll('text')).map((t) => t.textContent),
      stops: Array.from(el.querySelectorAll('linearGradient')).map((g) =>
        Array.from(g.querySelectorAll('stop')).map((s) => s.getAttribute('stop-color').toLowerCase()),
      ),
    }
  })
  expect(info.ticks).toBe(19)
  expect(info.major).toBe(7)
  expect(info.texts).toContain('km/h')
  expect(info.texts).toContain('HMI CLUSTER DEMO')
  expect(info.texts.some((t) => /^\d+ RPM$/.test(t))).toBe(true)
  expect(info.stops).toContainEqual(['#34d399', '#22d3ee'])
  expect(info.stops).toContainEqual(['#f59e0b', '#fb7185'])
  // needle endpoint from the displayed initial speed (formula: UT-SPEEDOMETER)
  const speed = Number(info.texts[0])
  const ang = ((-215 + (Math.min(speed, 180) / 180) * 250) * Math.PI) / 180
  expect(info.needle.x).toBeCloseTo(130 + 84 * Math.cos(ang), 0)
  expect(info.needle.y).toBeCloseTo(130 + 84 * Math.sin(ang), 0)
  testInfo.annotations.push({ type: 'note', description: `initial frame speed ${speed}` })
})

test('QT-022 Speedometer animates, and is static under reduced motion', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  const read = async (p) => p.locator('.gauge-widget svg text').allTextContents()
  await gotoHome(page)
  const before = await read(page)
  await page.clock.runFor(2000)
  await page.waitForTimeout(100)
  const after = await read(page)
  expect(after[0]).not.toBe(before[0])
  const { page: rp, context } = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
  await gotoHome(rp)
  const b2 = await read(rp)
  await rp.clock.runFor(2000)
  await rp.waitForTimeout(100)
  const a2 = await read(rp)
  expect(a2).toEqual(b2)
  await context.close()
})

test('QT-023 Profile card image and info panel', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const img = page.locator('img.profile-photo')
  await expect(img).toHaveAttribute('alt', 'S. Jeevanandham')
  await expect(img).toHaveAttribute('width', '600')
  await expect(img).toHaveAttribute('height', '900')
  await expect(img).toHaveAttribute('decoding', 'async')
  await expect.poll(() => img.evaluate((e) => e.naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator('.profile-card .scan')).toHaveCount(1)
  await expect(page.locator('.profile-card .corner')).toHaveCount(4)
  await expect(page.locator('.pname')).toHaveText('S. JEEVANANDHAM')
  await expect(page.locator('.prole')).toHaveText('SENIOR HMI ENGINEER')
  await expect(page.locator('.status-row')).toHaveText('OPEN TO OPPORTUNITIES')
  const dot = page.locator('.status-dot')
  expect(await css(dot, 'background-color')).toBe('rgb(52, 211, 153)')
  expect(await css(dot, 'animation-name')).not.toBe('none')
  await expect(page.locator('.profile-tags-row .ptag')).toHaveText(['Automotive HMI', 'Medical HMI', 'Qt/QML', 'UX Design'])
})

test('QT-024 Profile image failure hides the image only', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  const errors = collectErrors(page)
  await page.route('**/profile.webp', (r) => r.fulfill({ status: 404, body: 'nope' }))
  await gotoHome(page)
  await expect.poll(() => css(page.locator('img.profile-photo'), 'display')).toBe('none')
  await expect(page.locator('.profile-info-panel')).toBeVisible()
  expect(errors.pageErrors).toEqual([])
})

test('QT-025 Profile card parallax tilt and reduced-motion suppression', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const card = page.locator('.profile-card')
  const angles = async () => {
    await page.waitForTimeout(60)
    const t = await card.evaluate((e) => e.style.transform)
    const m = /perspective\(900px\) rotateY\((-?[\d.]+)deg\) rotateX\((-?[\d.]+)deg\) translateZ\(8px\)/.exec(t)
    expect(m, `transform "${t}"`).not.toBeNull()
    return { y: parseFloat(m[1]), x: parseFloat(m[2]) }
  }
  expect(await card.evaluate((e) => e.style.transition)).toBe('transform 0.15s ease-out')
  await page.mouse.move(1365, 400)
  let a = await angles()
  expect(Math.abs(a.y - 7)).toBeLessThan(0.05)
  await page.mouse.move(683, 400)
  a = await angles()
  expect(Math.abs(a.y)).toBeLessThan(0.05)
  expect(Math.abs(a.x)).toBeLessThan(0.05)
  await page.mouse.move(0, 0)
  a = await angles()
  expect(a.y).toBeCloseTo(-7, 1)
  expect(a.x).toBeCloseTo(7, 1)
  const { page: rp, context } = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
  await gotoHome(rp)
  await rp.mouse.move(1365, 400)
  await rp.mouse.move(0, 0)
  await rp.waitForTimeout(100)
  expect(await rp.locator('.profile-card').evaluate((e) => e.style.transform)).toBe('')
  await context.close()
})

test('QT-026 Hero collapses at <= 900 px and CTAs stack at <= 540 px', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  await gotoHome(page)
  const hero = page.locator('#hero')
  const cta = page.locator('.hero-cta')
  const state = async () => ({
    center: await css(page.locator('.hero-center'), 'display'),
    right: await css(page.locator('.hero-right'), 'display'),
    pad: await css(hero, 'padding'),
    cols: (await css(hero, 'grid-template-columns')).split(' ').length,
    dir: await css(cta, 'flex-direction'),
  })
  let s = await state()
  expect(s.center).toBe('none')
  expect(s.right).toBe('none')
  expect(s.pad).toBe('80px 24px 60px')
  expect(s.dir).toBe('column')
  const widths = await page.evaluate(() => {
    const c = document.querySelector('.hero-cta')
    const cs = getComputedStyle(c)
    const content = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    return { content, btns: Array.from(c.querySelectorAll('.btn')).map((b) => b.getBoundingClientRect().width) }
  })
  for (const w of widths.btns) expect(Math.abs(w - widths.content)).toBeLessThanOrEqual(1)
  await page.setViewportSize({ width: 540, height: 800 })
  s = await state()
  expect(s.dir).toBe('column')
  await page.setViewportSize({ width: 541, height: 800 })
  s = await state()
  expect(s.dir).toBe('row')
  await page.setViewportSize({ width: 900, height: 800 })
  s = await state()
  expect([s.center, s.right, s.cols]).toEqual(['none', 'none', 1])
  await page.setViewportSize({ width: 901, height: 800 })
  s = await state()
  expect(s.cols).toBe(3)
  expect(s.center).not.toBe('none')
})
