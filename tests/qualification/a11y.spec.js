import {
  test, expect, only, gotoHome, freshPage, css, style, resolvedColor, loadAllSections, settleScroll,
} from './helpers.js'
import { NAV, THEME_KEY } from './expected.js'
import { compareHeroToBaseline } from './visual-helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const seconds = (v) => v.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) / 1000 : parseFloat(x)))

test('QT-088 CSS reduced-motion behaviour', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoHome(page)
  const particles = await page.locator('.particle').evaluateAll((els) => els.map((e) => getComputedStyle(e).display))
  expect(particles.every((d) => d === 'none')).toBe(true)
  const glow = page.locator('.cursor-glow')
  if ((await glow.count()) > 0) expect(await css(glow, 'display')).toBe('none')
  expect(await css(page.locator('html'), 'scroll-behavior')).toBe('auto')
  for (const sel of ['.hring', '.orb']) {
    const s = await style(page.locator(sel).first(), ['animation-duration', 'animation-iteration-count'])
    for (const d of seconds(s['animation-duration'])) expect(d).toBeLessThanOrEqual(0.00001 + 1e-9)
    expect(s['animation-iteration-count']).toBe('1')
  }
  for (const sel of ['.nav', '.btn', '.stat-card']) {
    for (const d of seconds(await css(page.locator(sel).first(), 'transition-duration'))) expect(d, sel).toBeLessThanOrEqual(0.00001 + 1e-9)
  }
})

test('QT-089 JS-driven motion disabled under reduced motion', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoHome(page)
  const speed = () => page.locator('.gauge-widget svg text').first().textContent()
  const tw = () => page.locator('.hero-typewriter > span').first().textContent()
  const s0 = await speed()
  expect(await tw()).toBe('Qt / QML Developer')
  await page.clock.runFor(3000)
  await page.waitForTimeout(150)
  expect(await speed()).toBe(s0)
  expect(await tw()).toBe('Qt / QML Developer')
  await page.mouse.move(1365, 400)
  await page.waitForTimeout(100)
  expect(await page.locator('.profile-card').evaluate((e) => e.style.transform)).toBe('')
})

test('QT-090 Landmarks, heading structure and language', async ({ page }) => {
  await gotoHome(page)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('navigation')).toHaveCount(1)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  const levels = await page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => +h.tagName[1]))
  expect(levels[0]).toBe(1)
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading #${i} (h${levels[i]})`).toBeLessThanOrEqual(1)
})

test('QT-091 Image alternatives and decorative layers', async ({ page }) => {
  await gotoHome(page)
  const imgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map((i) => ({ alt: i.getAttribute('alt'), src: i.getAttribute('src'), cls: i.className })),
  )
  expect(imgs.length).toBeGreaterThan(0)
  for (const i of imgs) expect(i.alt, i.src).not.toBeNull()
  expect(imgs.find((i) => i.cls === 'profile-photo').alt).toBe('S. Jeevanandham')
  for (const i of imgs.filter((x) => (x.src || '').includes('simpleicons.org'))) {
    expect(i.src.split('/').pop()).toBe(i.alt)
    expect(i.alt.length).toBeGreaterThan(0)
  }
  await expect(page.locator('.orbs-wrap')).toHaveAttribute('aria-hidden', 'true')
  const glow = page.locator('.cursor-glow')
  if ((await glow.count()) > 0) await expect(glow).toHaveAttribute('aria-hidden', 'true')
  const deco = await page.evaluate(() => {
    const semantic = (e) => !!(e.getAttribute('role') || e.textContent.trim())
    const ok = (e) => e.getAttribute('aria-hidden') === 'true' || !semantic(e)
    return {
      particles: Array.from(document.querySelectorAll('.particle')).every(ok),
      rings: ok(document.querySelector('.hero-rings')),
    }
  })
  expect(deco).toEqual({ particles: true, rings: true })
})

test('QT-092 Keyboard reachability, order and focus visibility', async ({ page }, testInfo) => {
  await gotoHome(page)
  const desc = () =>
    page.evaluate(() => {
      const a = document.activeElement
      const cs = getComputedStyle(a)
      return {
        tag: a.tagName,
        text: a.textContent.replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href'),
        cls: a.className,
        focusRing: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
      }
    })
  if (testInfo.project.name === 'desktop-chromium') {
    const seq = []
    for (let i = 0; i < 13; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(350) // outline-width is covered by the 0.2-0.3 s "transition: all"
      seq.push(await desc())
    }
    expect(seq[0].text).toMatch(/Skip to content/)
    for (let i = 0; i < 9; i++) {
      expect(seq[1 + i].href, `tab stop ${i + 1}`).toBe(`#${NAV[i].id}`)
      expect(seq[1 + i].text).toContain(NAV[i].label)
    }
    expect(seq[10].cls).toContain('theme-btn')
    expect(seq[11].text).toContain('View Projects')
    expect(seq[12].text).toContain('Get In Touch')
    for (const s of seq) expect(s.focusRing, `focus ring on "${s.text}"`).toBe(true)
    // Enter on the "Skills" link
    await page.keyboard.press('Shift+Tab')
    await page.evaluate(() => document.activeElement.blur())
    await page.locator('.nav-links a[href="#skills"]').focus()
    await page.keyboard.press('Enter')
    await settleScroll(page, { from: 0 })
    const top = await page.evaluate(() => document.getElementById('skills').getBoundingClientRect().top)
    expect(top).toBeGreaterThanOrEqual(-2)
    expect(top).toBeLessThanOrEqual(100)
  } else {
    const burger = page.locator('.hamburger')
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      if (await burger.evaluate((e) => e === document.activeElement)) break
    }
    await expect(burger).toBeFocused()
    await page.waitForTimeout(350)
    expect((await desc()).focusRing).toBe(true)
    await page.keyboard.press('Enter')
    await expect(page.locator('.mobile-menu.open')).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('.mobile-menu')).toBeHidden()
    await page.keyboard.press('Space')
    await expect(page.locator('.mobile-menu.open')).toBeVisible()
  }
})

test('QT-093 Text contrast in both themes', async ({ browser }, testInfo) => {
  only(testInfo, 'D')
  test.setTimeout(120_000)
  const failures = {}
  const unresolved = {}
  for (const theme of ['night', 'day']) {
    const { page, context } = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
    await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [THEME_KEY, theme])
    await gotoHome(page, { at: null })
    await loadAllSections(page)
    const res = await page.evaluate(() => {
      const DECORATIVE = [/^HMI CLUSTER DEMO$/]
      const parse = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/)
        if (!m) return null
        const p = m[1].split(/[,/ ]+/).filter(Boolean).map(Number)
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
      }
      const over = (top, bot) => {
        const a = top.a + bot.a * (1 - top.a)
        const f = (x, y) => (x * top.a + y * bot.a * (1 - top.a)) / (a || 1)
        return { r: f(top.r, bot.r), g: f(top.g, bot.g), b: f(top.b, bot.b), a }
      }
      const lum = (c) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
      }
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
      const out = { fail: [], unresolved: [], checked: 0 }
      let resolvedOverride = true
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
      let el
      while ((el = walker.nextNode())) {
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'svg', 'SVG'].includes(el.tagName) || el.closest('svg')) continue
        if (el.closest('[aria-hidden="true"]')) continue
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()
        if (!own) continue
        if (DECORATIVE.some((r) => r.test(own))) continue
        const rect = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        resolvedOverride = !el.closest('.behance-card, .gauge-widget, .profile-card')
        if (rect.bottom <= 0 || rect.right <= 0 || rect.width === 0 || rect.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue
        // background: composite ancestors; art/gradient/backdrop layers cannot be resolved (listed as unresolved)
        let layers = []
        let node = el
        let resolved = resolvedOverride
        while (node && node.nodeType === 1) {
          const ncs = getComputedStyle(node)
          if (ncs.backgroundImage !== 'none' || (ncs.backdropFilter && ncs.backdropFilter !== 'none')) { resolved = false }
          const bg = parse(ncs.backgroundColor)
          if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 1) break }
          node = node.parentElement
        }
        let bg = { r: 0, g: 0, b: 0, a: 0 }
        for (const l of layers.reverse()) bg = bg.a === 0 ? l : over(l, bg)
        if (bg.a < 1) bg = over(bg, parse(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 })
        let fg = parse(cs.color)
        fg = over(fg, bg)
        const size = parseFloat(cs.fontSize)
        const bold = parseInt(cs.fontWeight, 10) >= 700
        const large = size >= 24 || (size >= 18.66 && bold)
        const need = large ? 3 : 4.5
        const r = ratio(fg, bg)
        out.checked++
        const info = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${own.slice(0, 30)}" ${r.toFixed(2)}:1 (need ${need})`
        if (!resolved) { if (r < need) out.unresolved.push(info); continue }
        if (r < need) out.fail.push(info)
      }
      return out
    })
    failures[theme] = res.fail
    unresolved[theme] = res.unresolved
    expect(res.checked).toBeGreaterThan(50)
    await context.close()
  }
  await testInfo.attach('contrast.json', { body: JSON.stringify({ failures, unresolved }, null, 1), contentType: 'application/json' })
  testInfo.annotations.push({ type: 'unresolved-contrast', description: JSON.stringify(unresolved).slice(0, 3000) })
  expect(failures, 'text below WCAG AA contrast (resolvable backgrounds)').toEqual({ night: [], day: [] })
})

test('QT-094 Icon ligatures are not announced', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const names = {
    viewProjects: page.getByRole('link', { name: 'View Projects', exact: true }),
    about: page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }),
  }
  for (const loc of Object.values(names)) await expect(loc).toHaveCount(1)
  const accessible = async (loc) => loc.first().evaluate((e) => {
    const c = e.cloneNode(true)
    c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
    return c.textContent.replace(/\s+/g, ' ').trim()
  })
  const forbidden = /\b(rocket_launch|person|light_mode|dark_mode|mail|wb_sunny|nights_stay)\b/
  const texts = [
    await accessible(names.viewProjects),
    await accessible(names.about),
    await accessible(page.locator('nav .theme-btn')),
    await accessible(page.locator('.c-email')),
  ]
  expect(texts[0]).toBe('View Projects')
  expect(texts[1]).toBe('About')
  for (const t of texts) expect(t).not.toMatch(forbidden)
  await expect(page.locator('nav .theme-btn')).toHaveAccessibleName(/^(Day|Night)$/)
  await expect(page.locator('.c-email')).toHaveAccessibleName('jeevanandhamsivashankaran@gmail.com')
  const unhidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body *'))
      .filter((e) => /Material Symbols/.test(getComputedStyle(e).fontFamily) && e.getAttribute('aria-hidden') !== 'true')
      .map((e) => e.outerHTML.slice(0, 80)),
  )
  expect(unhidden).toEqual([])
})

test('QT-095 Skip link', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const skip = page.locator('a.skip-link')
  let box = await skip.boundingBox()
  expect(box.y + box.height).toBeLessThanOrEqual(0)
  await expect(skip).not.toBeInViewport()
  const diff = await compareHeroToBaseline(browser, testInfo.project.use.baseURL, 'desktop', 'night')
  expect(diff.ratio, 'hero screenshot vs baseline').toBeLessThanOrEqual(0.002)
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await expect(skip).toHaveText('Skip to content')
  box = await skip.boundingBox()
  const vp = page.viewportSize()
  expect(box.width).toBeGreaterThan(0)
  expect(box.height).toBeGreaterThan(0)
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width)
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height)
  expect(parseInt(await css(skip, 'z-index'), 10)).toBeGreaterThan(300)
  await page.keyboard.press('Enter')
  const active = await page.evaluate(() => [document.activeElement.tagName, document.activeElement.id, document.activeElement.getAttribute('tabindex')])
  expect(active).toEqual(['MAIN', 'main', '-1'])
})

test('QT-096 Keyboard-only focus-visible outline in both themes', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const cta = page.getByRole('link', { name: 'View Projects', exact: true })
  const focusCta = async () => {
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab')
      if (await cta.evaluate((e) => e === document.activeElement)) return
    }
    throw new Error('View Projects not reachable by Tab')
  }
  const outline = async () => {
    await page.waitForTimeout(400) // outline-width transitions with "transition: all 0.25s"
    return style(cta, ['outline-style', 'outline-color', 'outline-width', 'outline-offset'])
  }
  await focusCta()
  let o = await outline()
  expect(o['outline-style']).toBe('solid')
  expect(o['outline-width']).toBe('2px')
  expect(o['outline-offset']).toBe('2px')
  expect(o['outline-color']).toBe(await resolvedColor(page, '--amber'))
  expect(o['outline-color']).toBe('rgb(245, 158, 11)')
  // day theme, toggled with the keyboard to stay in keyboard modality
  const tbtn = page.locator('nav .theme-btn')
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Shift+Tab')
    if (await tbtn.evaluate((e) => e === document.activeElement)) break
  }
  await expect(tbtn).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await focusCta()
  o = await outline()
  expect(o['outline-style']).toBe('solid')
  expect(o['outline-color']).toBe(await resolvedColor(page, '--amber'))
  expect(o['outline-color']).toBe('rgb(180, 83, 9)')
  // mouse click: no outline
  await page.evaluate(() => document.activeElement.blur())
  await cta.click()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  expect((await outline())['outline-style']).toBe('none')
})
