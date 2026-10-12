import { test, expect, only } from './helpers.js'

const CANON = 'https://jeevanandhamsivasankar.github.io/'
const meta = (page, sel, attr = 'content') => page.locator(sel).getAttribute(attr)

test('QT-123 Title and core meta tags', async ({ page }, testInfo) => {
  only(testInfo, 'S')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle('S. Jeevanandham · Senior HMI Engineer')
  expect((await meta(page, 'meta[name="description"]')).trim().length).toBeGreaterThan(0)
  expect(await meta(page, 'meta[name="author"]')).toBe('S. Jeevanandham')
  expect(await meta(page, 'meta[name="theme-color"]')).toBe('#060c18')
  expect(await meta(page, 'link[rel="canonical"]', 'href')).toBe(CANON)
})

test('QT-124 Open Graph and Twitter tags and OG image', async ({ page, request }, testInfo) => {
  only(testInfo, 'S')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(await meta(page, 'meta[property="og:type"]')).toBe('website')
  expect(await meta(page, 'meta[property="og:url"]')).toBe(CANON)
  expect((await meta(page, 'meta[property="og:title"]')).length).toBeGreaterThan(0)
  expect((await meta(page, 'meta[property="og:description"]')).length).toBeGreaterThan(0)
  expect(await meta(page, 'meta[property="og:image"]')).toBe(`${CANON}og-card.jpg`) // Sprint 2 (FR-MEDIA-003)
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image')
  const res = await request.get('/og-card.jpg')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^image\//)
})

test('QT-125 SVG favicon', async ({ page, request }, testInfo) => {
  only(testInfo, 'S')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"][href="/favicon.svg"]')).toHaveCount(1)
  const res = await request.get('/favicon.svg')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image/svg+xml')
})
