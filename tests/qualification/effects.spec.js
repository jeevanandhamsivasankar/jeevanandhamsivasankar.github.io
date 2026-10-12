import {
  test, expect, only, gotoHome, freshPage, press, centre, hoverAt, css, style, scrollToSection, loadAllSections,
} from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const PARTICLE_COLORS = ['rgb(245, 158, 11)', 'rgb(34, 211, 238)', 'rgb(52, 211, 153)', 'rgb(167, 139, 250)', 'rgb(251, 113, 133)']

test('QT-067 Gradient orbs', async ({ page }) => {
  await gotoHome(page)
  const wrap = page.locator('.orbs-wrap')
  await expect(wrap).toHaveAttribute('aria-hidden', 'true')
  expect(await css(wrap, 'position')).toBe('fixed')
  const orbs = page.locator('.orb')
  await expect(orbs).toHaveCount(4)
  const widths = [700, 600, 500, 400]
  const durs = ['20s', '25s', '18s', '28s']
  for (let i = 0; i < 4; i++) {
    const s = await style(orbs.nth(i), ['pointer-events', 'width', 'filter', 'animation-duration', 'background-image'])
    expect(s['pointer-events']).toBe('none')
    expect(s.width).toBe(`${widths[i]}px`)
    const blur = parseFloat(/blur\(([\d.]+)px\)/.exec(s.filter)[1])
    expect(blur).toBeGreaterThanOrEqual(60)
    expect(blur).toBeLessThanOrEqual(80)
    expect(s['animation-duration']).toBe(durs[i])
  }
  const night = await orbs.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage))
  await press(page.locator('.theme-btn').first())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await page.waitForTimeout(1600) // 1.4 s background transition
  const day = await orbs.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage))
  for (let i = 0; i < 4; i++) expect(day[i]).not.toBe(night[i])
})

test('QT-068 Cursor glow follows the pointer and hides under reduced motion', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const glow = page.locator('.cursor-glow')
  await expect(glow).toHaveAttribute('aria-hidden', 'true')
  expect(await glow.evaluate((e) => [e.style.left, e.style.top])).toEqual(['-500px', '-500px'])
  expect(await css(glow, 'width')).toBe('380px')
  expect(await css(glow, 'transition')).toMatch(/0\.08s linear/) // Sprint 2: --dur-instant (80 ms)
  await page.mouse.move(400, 300)
  await page.waitForTimeout(100)
  expect(await glow.evaluate((e) => [e.style.left, e.style.top])).toEqual(['400px', '300px'])
  const { page: rp, context } = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
  await gotoHome(rp)
  const rg = rp.locator('.cursor-glow')
  if ((await rg.count()) > 0) expect(await css(rg, 'display')).toBe('none')
  await context.close()
})

test('QT-069 Seeded particles: count, ranges, reproducibility and reduced motion', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const read = (p) =>
    p.locator('.particle').evaluateAll((els) =>
      els.map((e) => ({
        left: e.style.left, top: e.style.top, w: e.style.width, h: e.style.height,
        bg: e.style.background, op: e.style.opacity,
        dur: e.style.getPropertyValue('--dur'), delay: e.style.getPropertyValue('--delay'), dx: e.style.getPropertyValue('--dx'),
      })),
    )
  const a = await read(page)
  expect(a).toHaveLength(18)
  for (const p of a) {
    const left = parseFloat(p.left), top = parseFloat(p.top), size = parseFloat(p.w)
    expect(p.left.endsWith('%') && left >= 0 && left <= 100).toBe(true)
    expect(p.top.endsWith('%') && top >= 20 && top <= 90).toBe(true)
    expect(size).toBeGreaterThanOrEqual(1.5)
    expect(size).toBeLessThanOrEqual(4)
    expect(parseFloat(p.dur)).toBeGreaterThanOrEqual(4)
    expect(parseFloat(p.dur)).toBeLessThanOrEqual(9)
    expect(parseFloat(p.delay)).toBeGreaterThanOrEqual(0)
    expect(parseFloat(p.delay)).toBeLessThanOrEqual(6)
    expect(Math.abs(parseFloat(p.dx))).toBeLessThanOrEqual(30)
    expect(parseFloat(p.op)).toBeGreaterThanOrEqual(0.3)
    expect(parseFloat(p.op)).toBeLessThanOrEqual(0.8)
    expect(PARTICLE_COLORS).toContain(p.bg.replace(/ none.*$/, '').trim())
  }
  const c1 = await freshPage(browser, testInfo)
  await gotoHome(c1.page)
  expect(await read(c1.page)).toEqual(a)
  await c1.context.close()
  const c2 = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
  await gotoHome(c2.page)
  const shown = await c2.page.locator('.particle').evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length)
  expect(shown).toBe(0)
  await c2.context.close()
})

test('QT-070 Hero rings', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const rings = page.locator('.hring')
  await expect(rings).toHaveCount(4)
  const exp = [[580, '80s'], [440, '55s'], [300, '36s'], [180, '24s']]
  const names = []
  for (let i = 0; i < 4; i++) {
    const s = await style(rings.nth(i), ['width', 'height', 'animation-duration', 'animation-name', 'border-top-style'])
    expect(s.width).toBe(`${exp[i][0]}px`)
    expect(s.height).toBe(`${exp[i][0]}px`)
    expect(s['animation-duration']).toBe(exp[i][1])
    expect(s['border-top-style']).toBe(i === 2 ? 'dashed' : 'solid')
    names.push(s['animation-name'])
  }
  expect(names[0]).not.toBe(names[1])
  expect(names[0]).toBe(names[2])
  expect(names[1]).toBe(names[3])
})

test('QT-071 Reveal-on-scroll including lazy sections and stagger classes', async ({ page }) => {
  await gotoHome(page)
  const cert = page.locator('.cert-card').first()
  await expect(cert).not.toHaveClass(/visible/)
  expect(await css(cert, 'opacity')).toBe('0')
  expect(await css(cert, 'transform')).toBe('matrix(1, 0, 0, 1, 0, 24)')
  await loadAllSections(page)
  await page.waitForTimeout(500)
  await expect
    .poll(() => page.evaluate(() => Array.from(document.querySelectorAll('.reveal')).filter((e) => !e.classList.contains('visible')).length))
    .toBe(0)
  const cls = (sel) => page.locator(sel).evaluateAll((els) => els.map((e) => (e.className.match(/\bd\d\b/) || [''])[0]))
  expect(await cls('.stat-card')).toEqual(['d0', 'd1', 'd2', 'd3'])
  expect(await cls('.exp-item')).toEqual(['d0', 'd1', 'd2', 'd3'])
  expect(await cls('.skill-cat')).toEqual(Array.from({ length: 9 }, (_, i) => `d${i % 3}`))
  expect(await cls('.project-card')).toEqual(Array.from({ length: 6 }, (_, i) => `d${i % 2}`))
  expect(await cls('.behance-card')).toEqual(Array.from({ length: 5 }, (_, i) => `d${i % 2}`))
  expect(await cls('.cert-card')).toEqual(['d0', 'd1', 'd2'])
})

test('QT-081 Baseline micro-interactions', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  // stat card
  const stat = page.locator('.stat-card').first()
  await hoverAt(stat)
  await expect.poll(() => css(stat, 'border-top-color')).toBe('rgba(245, 158, 11, 0.4)')
  await expect.poll(() => css(stat, 'box-shadow')).toContain('0px 16px 48px')
  // project card
  const pc = page.locator('.project-card').first()
  const before = await pc.evaluate((e) => e.style.borderColor)
  await hoverAt(pc)
  await expect.poll(() => pc.evaluate((e) => e.style.borderColor)).not.toBe(before)
  expect(await pc.evaluate((e) => e.style.borderColor)).toBe('rgba(52, 211, 153, 0.6)')
  await expect.poll(() => css(pc.locator('.project-card-line'), 'transform')).toBe('matrix(1, 0, 0, 1, 0, 0)')
  await page.mouse.move(2, 400)
  await expect.poll(() => pc.evaluate((e) => e.style.borderColor)).toBe(before)
  // chip
  const chip = page.locator('.skill-chip').filter({ has: page.locator('.chip-label', { hasText: /^Qt \/ QML$/ }) }).first()
  await hoverAt(chip)
  await expect.poll(() => css(chip.locator('.chip-label'), 'color')).toBe('rgb(65, 205, 82)')
  await expect.poll(() => css(chip, 'transform')).toBe('matrix(1.02, 0, 0, 1.02, 0, -2)')
  // design card
  const card = page.locator('.behance-card').first()
  const cta = card.locator('.bc-cta')
  await page.mouse.move(2, 400)
  await centre(card)
  expect(await css(cta, 'transform')).toBe('none')
  await hoverAt(card)
  // Sprint 2 (US-210): no layout transition; the CTA nudges 4 px with transform instead of widening its gap
  await expect.poll(() => css(cta, 'transform')).toBe('matrix(1, 0, 0, 1, 4, 0)')
  // contact email
  const email = page.locator('.c-email')
  await hoverAt(email)
  await expect.poll(() => css(email, 'background-color')).toBe('rgba(245, 158, 11, 0.12)')
  // hero entry delays
  const delays = await page.evaluate(() =>
    ['.hero-tag', '.hero-name', '.hero-typewriter', '.hero-bio', '.hero-badges', '.hero-cta'].map((s) =>
      getComputedStyle(document.querySelector(s)).animationDelay,
    ),
  )
  // Sprint 2 (FR-MOTION-002): entry delays are multiples of --stagger-step (60 ms), in the v1.1 order
  const ms = delays.map((d) => Math.round(parseFloat(d) * 1000))
  ms.forEach((v, i) => {
    expect(v % 60, `delay ${i}`).toBe(0)
    if (i) expect(v).toBeGreaterThan(ms[i - 1])
  })
  await scrollToSection(page, 'hero')
})
