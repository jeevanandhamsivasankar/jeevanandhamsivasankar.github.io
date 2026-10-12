import { test, expect } from '@playwright/test'

const html = (page) => page.locator('html')
const THEME_KEY = 'jsv-theme-override'

async function watchClass(page) {
  await page.evaluate(() => {
    window.__sw = { seen: false }
    new MutationObserver(() => {
      if (document.documentElement.classList.contains('theme-switching')) window.__sw.seen = true
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
}

test('QT-154 toggle flips data-theme synchronously and the transient class is added then removed', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, 'night'), THEME_KEY)
  await page.goto('/')
  await watchClass(page)
  const before = await html(page).getAttribute('data-theme')
  const states = await page.evaluate(() => {
    document.querySelector('.theme-btn').click()
    return new Promise((r) => requestAnimationFrame(() => r({
      theme: document.documentElement.getAttribute('data-theme'),
      cls: document.documentElement.classList.contains('theme-switching'),
    })))
  })
  expect(states.theme).not.toBe(before)
  expect(states.cls).toBe(true)
  await expect(html(page)).not.toHaveClass(/theme-switching/, { timeout: 1500 })
})

test('QT-155 reload paints the stored theme with no transition class and no flash', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, 'day'), THEME_KEY)
  await page.addInitScript(() => {
    window.__sw = { seen: false }
    new MutationObserver(() => {
      if (document.documentElement.classList.contains('theme-switching')) window.__sw.seen = true
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
  await page.goto('/')
  await expect(html(page)).toHaveAttribute('data-theme', 'day')
  expect(await page.evaluate(() => window.__sw.seen)).toBe(false)
})

test('QT-156 reduced motion switches theme instantly without class, overlay or icon animation', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.addInitScript((k) => localStorage.setItem(k, 'night'), THEME_KEY)
  await page.goto('/')
  await watchClass(page)
  await page.evaluate(() => document.querySelector('.theme-btn').click())
  await expect(html(page)).toHaveAttribute('data-theme', 'day')
  expect(await page.evaluate(() => window.__sw.seen)).toBe(false)
  await expect(page.locator('[data-testid="theme-illum"]')).toHaveCount(0)
  await ctx.close()
})

test('QT-157 rapid double toggle ends in the last theme and leaves no stuck class', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, 'night'), THEME_KEY)
  await page.goto('/')
  const result = await page.evaluate(() => {
    const b = document.querySelector('.theme-btn')
    b.click()
    b.click()
    return document.documentElement.getAttribute('data-theme')
  })
  expect(result).toBe('night')
  await expect(html(page)).toHaveAttribute('data-theme', 'night')
  await expect(html(page)).not.toHaveClass(/theme-switching/, { timeout: 1500 })
})
