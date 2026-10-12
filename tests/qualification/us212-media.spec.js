import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { test, expect, gotoHome, loadAllSections } from './helpers.js'

// QT-164..167 run MediaSlot in a harness page (the manifest is empty in the real site) built
// with Vite and served in-memory at http://harness.test/. QT-168 runs against the real site.
const HERE = resolve(fileURLToPath(import.meta.url), '..')
const ORIGIN = 'http://harness.test'
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' }
let outDir

test.beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'us212-harness-'))
  await build({
    root: join(HERE, 'us212-harness'), configFile: false, logLevel: 'silent', base: './',
    plugins: [react()], build: { outDir, emptyOutDir: true },
  })
})

const video = (extra = {}) => ({
  id: 'clip', kind: 'video', sources: { webm: '/media/clip.webm', mp4: '/media/clip.mp4' }, poster: '/media/clip.webp',
  width: 640, height: 360, alt: 'Cluster demo clip', description: 'Cluster demo', ambient: true, durationSec: 8,
  rightsConfirmed: true, ...extra,
})

async function open(page, items, { reducedMotion } = {}) {
  const log = { media: [], plays: 0, pauses: 0 }
  await page.addInitScript((its) => {
    window.__ITEMS__ = its
    window.__events = []
    HTMLMediaElement.prototype.play = function () { this._p = false; window.__events.push('play'); this.dispatchEvent(new Event('play')); return Promise.resolve() }
    HTMLMediaElement.prototype.pause = function () { this._p = true; window.__events.push('pause'); this.dispatchEvent(new Event('pause')) }
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get() { return this._p !== false }, configurable: true })
  }, items)
  if (reducedMotion) await page.emulateMedia({ reducedMotion })
  await page.route(`${ORIGIN}/**`, (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/media/')) {
      log.media.push(url.pathname)
      return route.fulfill({ status: 200, contentType: url.pathname.endsWith('.webp') ? 'image/webp' : 'video/webm', body: Buffer.alloc(16) })
    }
    const file = join(outDir, url.pathname === '/' ? 'index.html' : url.pathname)
    if (!existsSync(file)) return route.fulfill({ status: 404, body: '' })
    return route.fulfill({ status: 200, contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) })
  })
  await page.goto(`${ORIGIN}/`)
  await page.waitForSelector('.media-slot')
  return log
}
const events = (page) => page.evaluate(() => window.__events)
const scrollToSlot = (page) => page.evaluate(() => document.querySelector('.media-slot').scrollIntoView({ block: 'center' }))

test('QT-164 lazy: no video bytes before the slot is within one viewport; poster, sizes and preload=none present', async ({ page }) => {
  const log = await open(page, [video()])
  await page.waitForTimeout(300)
  expect(log.media.filter((u) => /\.(webm|mp4)$/.test(u))).toEqual([])
  const attrs = await page.locator('video').evaluate((v) => ({ p: v.getAttribute('poster'), w: v.getAttribute('width'), h: v.getAttribute('height'), pre: v.getAttribute('preload'), pi: v.playsInline }))
  expect(attrs).toEqual({ p: '/media/clip.webp', w: '640', h: '360', pre: 'none', pi: true })
  await scrollToSlot(page)
  await expect(page.locator('video source')).toHaveCount(2)
})

test('QT-165 reduced motion: ambient clip never autoplays and offers a play button', async ({ page }) => {
  await open(page, [video()], { reducedMotion: 'reduce' })
  await scrollToSlot(page)
  await page.waitForTimeout(400)
  expect(await events(page)).not.toContain('play')
  await expect(page.getByRole('button', { name: /play video/i })).toBeVisible()
})

test('QT-166 ambient clip plays muted when visible, pauses when scrolled away and when the tab is hidden', async ({ page }) => {
  await open(page, [video()])
  await scrollToSlot(page)
  await expect.poll(() => events(page)).toContain('play')
  expect(await page.locator('video').evaluate((v) => v.muted)).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(async () => (await events(page)).at(-1)).toBe('pause')
  await scrollToSlot(page)
  await expect.poll(async () => (await events(page)).at(-1)).toBe('play')
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect.poll(async () => (await events(page)).at(-1)).toBe('pause')
})

test('QT-167 long clip: keyboard-operable named pause/play button; narrated video exposes a captions track', async ({ page }) => {
  await open(page, [
    video({ id: 'a', ambient: true, durationSec: 12 }),
    video({ id: 'n', ambient: false, narrated: true, captions: { src: '/media/clip.vtt', srclang: 'en', label: 'English' } }),
  ])
  await scrollToSlot(page)
  const btn = page.getByRole('button', { name: /video: Cluster demo clip/i }).first()
  await btn.focus()
  await expect(btn).toBeFocused()
  await expect(btn).toHaveAttribute('aria-label', /^(Pause|Play) video/)
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Enter')
  await expect(btn).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#slot-n').evaluate((e) => e.scrollIntoView())).resolves.toBeUndefined()
  await expect(page.locator('#slot-n video track[kind="captions"]')).toHaveCount(1)
})

test('QT-168 preview (?placeholders=1) shows the labelled placeholder; production default shows none', async ({ page }) => {
  await gotoHome(page)
  await loadAllSections(page)
  await expect(page.locator('[data-state="placeholder"]')).toHaveCount(0)
  expect(await page.locator('#projects').innerText()).not.toMatch(/PLACEHOLDER/)
  await page.goto('/?placeholders=1')
  await loadAllSections(page)
  const labels = page.locator('#projects .media-slot__label')
  await expect(labels.first()).toHaveText('PLACEHOLDER - OWNER MEDIA')
  await expect(labels.first()).toBeVisible()
})
