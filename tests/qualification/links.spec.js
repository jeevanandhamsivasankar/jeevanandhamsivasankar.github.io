import { test, expect, only, gotoHome, revealAll } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-054 Resume PDF served with correct content type', async ({ request }, testInfo) => {
  only(testInfo, 'S')
  const res = await request.get('/Jeevanandham_Resume.pdf')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^application\/pdf/)
  expect((await res.body()).length).toBeGreaterThan(100_000)
})

test('QT-130 Internal anchors and same-origin assets resolve', async ({ page, request }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  await revealAll(page)
  const { anchors, urls } = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute('href'))
    const urls = Array.from(document.querySelectorAll('a[href], link[href], img[src], script[src], source[src]'))
      .map((e) => e.href || e.src)
      .filter((u) => u && u.startsWith(window.location.origin))
    return { anchors, urls: [...new Set(urls.map((u) => u.split('#')[0]))] }
  })
  expect(anchors.length).toBeGreaterThan(10)
  expect(anchors).toContain('#main')
  const missing = await page.evaluate((hs) => hs.filter((h) => !document.getElementById(h.slice(1))), anchors)
  expect(missing).toEqual([])
  expect(urls.some((u) => u.endsWith('.pdf'))).toBe(true)
  for (const u of urls) {
    const r = await request.get(u)
    expect(r.status(), u).toBe(200)
  }
})
