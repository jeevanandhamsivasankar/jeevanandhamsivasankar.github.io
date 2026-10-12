import { test, expect, gotoHome, only } from './helpers.js'

const sizeOf = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) })
const currentSrc = async (page) => {
  await page.locator('.profile-photo').evaluate((i) => i.decode().catch(() => {}))
  return page.locator('.profile-photo').evaluate((i) => i.currentSrc)
}

test.describe('US-205 DPR1', () => {
  test.use({ deviceScaleFactor: 1 })
  test('QT-137 srcset selects -300.avif at DPR1', async ({ page }, ti) => {
    only(ti, 'D')
    await gotoHome(page)
    expect(await currentSrc(page)).toMatch(/-300\.avif$/)
  })
})

test.describe('US-205 DPR2', () => {
  test.use({ deviceScaleFactor: 2 })
  test('QT-137 srcset selects -450.avif at DPR2', async ({ page }, ti) => {
    only(ti, 'D')
    await gotoHome(page)
    expect(await currentSrc(page)).toMatch(/-450\.avif$/)
  })
})

test('QT-138 mobile downloads no large profile image', async ({ page }, ti) => {
  only(ti, 'M')
  const got = []
  page.on('response', async (r) => {
    if (/\/img\/profile-/.test(r.url())) got.push({ url: r.url(), n: (await r.body().catch(() => Buffer.alloc(0))).length })
  })
  await gotoHome(page)
  await page.waitForLoadState('networkidle')
  for (const s of got) {
    expect(s.url).not.toMatch(/profile-(600|900)\./)
    expect(s.n).toBeLessThanOrEqual(25 * 1024)
  }
})

test('QT-139 OG meta, icons and manifest resolve with right types', async ({ page, request }) => {
  await gotoHome(page)
  const og = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image')
  const card = await request.get(new URL(og).pathname)
  expect(card.status()).toBe(200)
  expect(card.headers()['content-type']).toContain('image/jpeg')
  const types = { '/favicon.svg': 'image/svg+xml', '/favicon.ico': 'image', '/favicon-32.png': 'image/png', '/apple-touch-icon.png': 'image/png', '/site.webmanifest': '' }
  for (const [u, t] of Object.entries(types)) {
    const r = await request.get(u)
    expect(r.status(), u).toBe(200)
    expect(r.headers()['content-type'], u).toContain(t)
  }
  const man = await (await request.get('/site.webmanifest')).json()
  for (const ic of man.icons) {
    const r = await request.get(ic.src)
    expect(r.status()).toBe(200)
    const { w, h } = sizeOf(await r.body())
    expect(`${w}x${h}`).toBe(ic.sizes)
  }
})

test('QT-139 no new third-party origin is requested', async ({ page }) => {
  const origins = new Set()
  page.on('request', (r) => origins.add(new URL(r.url()).origin))
  await gotoHome(page)
  const allowed = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.simpleicons.org', 'null'])
  for (const o of origins) if (!/^http:\/\/(localhost|127\.0\.0\.1)/.test(o)) expect(allowed.has(o), o).toBe(true)
})

test('QT-140 profile image causes no layout shift (CLS < 0.05)', async ({ page }, ti) => {
  only(ti, 'D')
  await page.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await gotoHome(page)
  await page.waitForLoadState('networkidle')
  expect(await page.evaluate(() => window.__cls)).toBeLessThan(0.05)
})
