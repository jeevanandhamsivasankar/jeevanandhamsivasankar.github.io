import {
  test, expect, only, gotoHome, freshPage, press, style, rootVar, collectErrors, setClock,
} from './helpers.js'
import { DAY, NIGHT, THEME_KEY } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const theme = (page) => page.evaluate(() => document.documentElement.getAttribute('data-theme'))
const settle = (page) => page.waitForTimeout(120)

async function loadAt(browser, testInfo, iso, extra = {}) {
  const { context, page } = await freshPage(browser, testInfo, { reducedMotion: 'reduce', ...extra })
  await setClock(page, iso)
  await page.goto('/')
  await page.waitForSelector('#hero')
  return { context, page }
}

test('QT-059 Theme attribute set before first paint of the app', async ({ browser }, testInfo) => {
  const runAt = async (iso) => {
    const { context, page } = await freshPage(browser, testInfo)
    await page.addInitScript(() => {
      const check = () => {
        const root = document.getElementById('root')
        if (root && root.firstChild && window.__firstFrameTheme === undefined) {
          window.__firstFrameTheme = null
          requestAnimationFrame(() => {
            window.__firstFrameTheme = document.documentElement.dataset.theme
          })
        }
      }
      new MutationObserver(check).observe(document, { childList: true, subtree: true })
    })
    await setClock(page, iso)
    await page.goto('/')
    await page.waitForSelector('#hero')
    await expect.poll(() => page.evaluate(() => window.__firstFrameTheme)).not.toBeNull()
    const r = {
      first: await page.evaluate(() => window.__firstFrameTheme),
      attr: await theme(page),
      bg: (await rootVar(page, '--bg')).toLowerCase(),
    }
    await context.close()
    return r
  }
  expect(await runAt(DAY)).toEqual({ first: 'day', attr: 'day', bg: '#fef9f0' })
  expect(await runAt(NIGHT)).toEqual({ first: 'night', attr: 'night', bg: '#060c18' })
})

test('QT-060 Automatic theme from Chennai sunrise/sunset (clock-controlled)', async ({ browser }, testInfo) => {
  only(testInfo, 'D')
  test.setTimeout(120_000)
  const cases = [
    ['2026-06-21T06:30:00Z', 'day'],
    ['2026-06-21T17:30:00Z', 'night'],
    ['2026-06-21T00:15:40Z', 'night'],
    ['2026-06-21T00:15:55Z', 'day'],
    ['2026-06-21T13:02:00Z', 'day'],
    ['2026-06-21T13:02:10Z', 'night'],
    ['2026-12-21T01:02:00Z', 'night'],
    ['2026-12-21T01:02:10Z', 'day'],
    ['2026-12-21T12:15:40Z', 'day'],
    ['2026-12-21T12:15:55Z', 'night'],
  ]
  for (const [iso, expected] of cases) {
    const { context, page } = await loadAt(browser, testInfo, iso)
    expect.soft(await theme(page), iso).toBe(expected)
    await context.close()
  }
})

test('QT-061 Auto re-evaluation every 60 s until an override exists', async ({ browser }, testInfo) => {
  only(testInfo, 'D')
  // auto: day at 18:31:30 IST, night once the tick after sunset (18:32:03 IST) has run
  let { context, page } = await loadAt(browser, testInfo, '2026-06-21T13:01:30Z')
  expect(await theme(page)).toBe('day')
  await page.clock.runFor(61_000)
  await settle(page)
  const mid = await theme(page)
  await page.clock.runFor(60_000)
  await settle(page)
  expect(await theme(page)).toBe('night')
  testInfo.annotations.push({ type: 'note', description: `theme 61 s after load: ${mid}` })
  await context.close()
  // manual toggle before sunrise stops auto switching
  ;({ context, page } = await loadAt(browser, testInfo, '2026-06-21T00:15:00Z'))
  expect(await theme(page)).toBe('night')
  await press(page.locator('.theme-btn').first())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await page.clock.runFor(5 * 60_000)
  await settle(page)
  expect(await theme(page)).toBe('day')
  await context.close()
  // persisted override
  ;({ context, page } = await (async () => {
    const c = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
    await c.page.addInitScript((k) => window.localStorage.setItem(k, 'night'), THEME_KEY)
    await setClock(c.page, DAY)
    await c.page.goto('/')
    await c.page.waitForSelector('#hero')
    return c
  })())
  expect(await theme(page)).toBe('night')
  await page.clock.runFor(120_000)
  await settle(page)
  expect(await theme(page)).toBe('night')
  await context.close()
})

test('QT-062 Theme toggle button label, icon and manual override', async ({ page, browser }, testInfo) => {
  await gotoHome(page)
  const nav = page.locator('nav.nav .theme-btn')
  const mobile = testInfo.project.name === 'mobile-chromium'
  await expect(nav).toHaveAttribute('title', 'Toggle day/night theme')
  await expect(nav).toHaveText('light_modeDay')
  await expect(nav.locator('span').first()).toHaveText('light_mode')
  if (mobile) {
    const menuBtn = page.locator('.mobile-menu .theme-btn')
    await press(page.locator('.hamburger'))
    await press(menuBtn)
  } else {
    await press(nav)
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await expect(nav).toHaveText('dark_modeNight')
  await expect(nav.locator('span').first()).toHaveText('dark_mode')
  // manual choice survives sunrise
  const { context, page: p2 } = await loadAt(browser, testInfo, '2026-06-21T00:10:00Z')
  expect(await theme(p2)).toBe('night')
  await press(p2.locator('.theme-btn').first())
  await expect(p2.locator('html')).toHaveAttribute('data-theme', 'day')
  await p2.clock.runFor(12 * 60_000)
  await settle(p2)
  expect(await theme(p2)).toBe('day')
  await context.close()
})

test('QT-063 Theme badge text, ticking clock and mobile hiding', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }) // no rAF flood while the fake clock runs
  await gotoHome(page, { at: '2026-06-21T17:30:00Z' })
  const badge = page.locator('.theme-badge')
  const desktop = testInfo.project.name === 'desktop-chromium'
  const read = async () => ({
    icon: await badge.locator('span').first().textContent(),
    text: (await badge.evaluate((e) => Array.from(e.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(''))).replace(/\s+/g, ' ').trim(),
  })
  if (desktop) {
    let b = await read()
    expect(b.icon).toBe('nights_stay')
    expect(b.text).toMatch(/^(DAY|NIGHT) · \d{2}:\d{2}\s(am|pm)$/i)
    expect(b.text).toMatch(/^NIGHT · 11:00\s?pm$/i)
    await page.clock.runFor(61_000)
    await settle(page)
    const b2 = await read()
    expect(b2.text).toMatch(/11:01/)
    await press(page.locator('.theme-btn').first())
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
    b = await read()
    expect(b.icon).toBe('wb_sunny')
    expect(b.text).toMatch(/^DAY · /)
    await page.clock.runFor(61_000)
    await settle(page)
    expect((await read()).text).toMatch(/11:02/)
  }
  for (const [w, visible] of [[390, false], [900, false], [901, true], [1366, true]]) {
    await page.setViewportSize({ width: w, height: 800 })
    if (visible) await expect(badge, `width ${w}`).toBeVisible()
    else await expect(badge, `width ${w}`).toBeHidden()
  }
})

test('QT-064 Smooth theme transitions (computed style inspection)', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const origin = await page.evaluate(() => performance.timeOrigin)
  const t = async (sel) => style(page.locator(sel).first(), ['transition-property', 'transition-duration'])
  const html = await t('html')
  expect(html['transition-property']).toBe('background-color, color')
  expect(html['transition-duration']).toBe('1.2s, 0.6s')
  const body = await t('body')
  expect(body['transition-property']).toContain('background')
  expect(body['transition-duration']).toBe('1.2s, 0.6s')
  for (const sel of ['.gauge-widget', '.profile-info-panel', 'footer']) {
    const c = await t(sel)
    expect(c['transition-property'], sel).toContain('background')
    expect(c['transition-property'], sel).toContain('border-color')
    expect(c['transition-property'], sel).toContain('box-shadow')
    expect(c['transition-duration'], sel).toBe('0.8s, 0.8s, 0.5s, 0.4s, 0.5s')
  }
  const ctl = await t('.theme-btn')
  expect(parseFloat(ctl['transition-duration'])).toBeGreaterThan(0)
  await press(page.locator('.theme-btn').first())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin)
})

test('QT-066 Manual theme persists across reloads with guarded storage', async ({ page, browser }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page, { at: DAY })
  expect(await theme(page)).toBe('day')
  await press(page.locator('.theme-btn').first())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  const keys = await page.evaluate(() => Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))
  expect(keys).toEqual([[THEME_KEY, 'night']])
  await page.reload()
  await page.waitForSelector('#hero')
  expect(await theme(page)).toBe('night')

  // invalid stored value falls back to the automatic theme
  let c = await freshPage(browser, testInfo)
  await c.page.addInitScript((k) => window.localStorage.setItem(k, 'foo'), THEME_KEY)
  await setClock(c.page, DAY)
  await c.page.goto('/')
  await c.page.waitForSelector('#hero')
  expect(await theme(c.page)).toBe('day')
  await c.context.close()

  // throwing storage (methods, then accessor)
  const variants = [
    () => {
      const boom = () => { throw new Error('storage disabled') }
      Storage.prototype.getItem = boom
      Storage.prototype.setItem = boom
    },
    () => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage disabled') } })
    },
  ]
  for (const fn of variants) {
    c = await freshPage(browser, testInfo)
    const errors = collectErrors(c.page)
    await c.page.addInitScript(fn)
    await setClock(c.page, DAY)
    await c.page.goto('/')
    await c.page.waitForSelector('#hero')
    expect(await theme(c.page)).toBe('day')
    await press(c.page.locator('.theme-btn').first())
    await expect(c.page.locator('html')).toHaveAttribute('data-theme', 'night')
    await c.page.waitForTimeout(200)
    expect(errors.pageErrors).toEqual([])
    expect(errors.consoleErrors).toEqual([])
    await c.context.close()
  }
})

test('QT-114 Theme independent of the visitor\'s time zone', async ({ browser }, testInfo) => {
  only(testInfo, 'D')
  test.setTimeout(240_000)
  const zones = ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Australia/Lord_Howe']
  const instants = [
    ['2026-06-21T06:30:00Z', 'day'],
    ['2026-06-21T17:30:00Z', 'night'],
    ['2026-06-21T00:15:55Z', null],
    ['2026-03-08T06:30:00Z', null],
    ['2026-03-29T00:30:00Z', null],
    ['2026-11-01T05:30:00Z', null],
  ]
  for (const [iso, expected] of instants) {
    const results = {}
    for (const tz of zones) {
      const { context, page } = await loadAt(browser, testInfo, iso, { timezoneId: tz })
      results[tz] = await theme(page)
      await context.close()
    }
    const ref = results['Asia/Kolkata']
    if (expected) expect(ref, iso).toBe(expected)
    for (const tz of zones) expect(results[tz], `${iso} in ${tz}`).toBe(ref)
  }
})
