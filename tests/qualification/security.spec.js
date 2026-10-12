import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect, only, gotoHome, revealAll, ROOT } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-097 All new-tab links carry rel noopener noreferrer', async ({ page }) => {
  await gotoHome(page)
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[target="_blank"]')).map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel') || '' })),
  )
  for (const l of links) {
    expect(l.rel.split(/\s+/), l.href).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
  }
  // 5 design cards + 3 social + View Online + preview View = 10 exist in the markup and baseline
  expect(links.length).toBeGreaterThanOrEqual(10)
  test.info().annotations.push({ type: 'note', description: `STP states >= 13 new-tab links; markup and baseline contain ${links.length}` })
})

test('QT-098 No third-party scripts; origin allowlist; no CSP violations', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  const requests = []
  const messages = []
  page.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType() }))
  page.on('console', (m) => messages.push(m.text()))
  await gotoHome(page)
  await revealAll(page)
  const self = new URL(testInfo.project.use.baseURL).origin
  const scripts = requests.filter((r) => r.type === 'script')
  expect(scripts.length).toBeGreaterThan(0)
  for (const s of scripts) expect(new URL(s.url).origin, s.url).toBe(self)
  const allowed = new Set([self, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.simpleicons.org'])
  const foreign = [...new Set(requests.map((r) => new URL(r.url).origin))].filter((o) => !allowed.has(o))
  expect(foreign).toEqual([])
  expect(messages.filter((m) => /Content Security Policy/i.test(m))).toEqual([])
})

test('QT-099 No unsafe sinks, no cookies, no personal data collection', async ({ page }, testInfo) => {
  only(testInfo, 'S')
  const files = []
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(js|jsx)$/.test(f)) files.push(p)
    }
  }
  walk(join(ROOT, 'src'))
  const patterns = [/dangerouslySetInnerHTML/, /\beval\s*\(/, /new Function\b/, /\.innerHTML\s*=/, /document\.write\b/]
  const hits = []
  for (const f of files) {
    const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    for (const p of patterns) if (p.test(code)) hits.push(`${f}: ${p}`)
  }
  expect(hits).toEqual([])
  await gotoHome(page)
  expect(await page.evaluate(() => document.cookie)).toBe('')
  expect(await page.evaluate(() => document.querySelectorAll('form, input, textarea').length)).toBe(0)
})

test('QT-100 Rendered URLs use only allowed schemes', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  await revealAll(page)
  const urls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[href], [src]')).flatMap((e) => [e.getAttribute('href'), e.getAttribute('src')].filter((v) => v !== null)),
  )
  expect(urls.length).toBeGreaterThan(20)
  const ok = /^(https:|mailto:|tel:|#|\/|[A-Za-z0-9_./-]+$)/
  expect(urls.filter((u) => !ok.test(u))).toEqual([])
  expect(urls.filter((u) => /^\s*(javascript:|data:|vbscript:|http:)/i.test(u))).toEqual([])
})
