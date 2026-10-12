/* global document, window, getComputedStyle */
import { test, expect, only, gotoHome, scrollToY, scrollToSection, scrollBottom, settleScroll, tapOrClick, css, collectErrors } from './helpers.js'
import { NAV } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-001 Fixed top navigation bar stays visible while scrolling', async ({ page }) => {
  await gotoHome(page)
  const nav = page.locator('nav.nav')
  expect(await css(nav, 'position')).toBe('fixed')
  expect(await css(nav, 'top')).toBe('0px')
  expect(await css(nav, 'z-index')).toBe('300')
  expect(await css(nav, 'height')).toBe('64px')
  for (const y of [1500, 'bottom']) {
    if (y === 'bottom') await scrollBottom(page)
    else await scrollToY(page, y)
    const box = await nav.boundingBox()
    expect(box.y).toBe(0)
    await expect(nav).toBeInViewport()
  }
})

test('QT-002 Nav logo icon and label', async ({ page }) => {
  await gotoHome(page)
  const logo = page.locator('.nav-logo')
  await expect(logo).toBeVisible()
  expect(await logo.evaluate((e) => e.textContent)).toBe('developer_boardJEEVANANDHAM')
  await expect(logo.locator('span').first()).toHaveAttribute('aria-hidden', 'true')
  const accessible = await logo.evaluate((e) => {
    const c = e.cloneNode(true)
    c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
    return c.textContent.trim()
  })
  expect(accessible).toBe('JEEVANANDHAM')
})

test('QT-003 Nine nav links in order with icons and existing targets', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const links = page.locator('.nav-links a')
  await expect(links).toHaveCount(9)
  for (let i = 0; i < NAV.length; i++) {
    const a = links.nth(i)
    await expect(a).toHaveAccessibleName(NAV[i].label)
    await expect(a).toHaveAttribute('href', `#${NAV[i].id}`)
    await expect(a.locator('span').first()).toHaveText(NAV[i].icon)
  }
  const missing = await page.evaluate(
    (ids) => ids.filter((id) => !document.getElementById(id)),
    NAV.map((n) => n.id),
  )
  expect(missing).toEqual([])
})

test('QT-004 Nav is derived from the registry and excludes Hero', async ({ page }) => {
  await gotoHome(page)
  const r = await page.evaluate(() => ({
    sections: Array.from(document.querySelectorAll('[data-section]')).map((e) => e.dataset.section),
    desktop: Array.from(document.querySelectorAll('.nav-links a')).map((a) => a.getAttribute('href')),
    mobile: Array.from(document.querySelectorAll('.mobile-menu a')).map((a) => a.getAttribute('href')),
    hero: document.querySelectorAll('nav a[href="#hero"], .mobile-menu a[href="#hero"]').length,
  }))
  const expected = r.sections.filter((s) => s !== 'hero').map((s) => `#${s}`)
  expect(r.desktop).toEqual(expected)
  expect(r.mobile).toEqual(expected)
  expect(r.hero).toBe(0)
})

test('QT-005 Nav link scrolls smoothly to the section and updates the hash', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  expect(await css(page.locator('html'), 'scroll-behavior')).toBe('smooth')
  await page.locator('.nav-links a', { hasText: 'Projects' }).click()
  await settleScroll(page, { from: 0 })
  expect(await page.evaluate(() => window.location.hash)).toBe('#projects')
  const top = await page.evaluate(() => document.getElementById('projects').getBoundingClientRect().top)
  expect(top).toBeGreaterThanOrEqual(-2)
  expect(top).toBeLessThanOrEqual(100)
})

test('QT-006 Active-section highlight including the 140 px offset boundary', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  const active = page.locator('.nav-links a.active')
  await expect(active).toHaveCount(0)
  for (const [delta, label] of [[-100, 'Skills'], [-140, 'Skills'], [-141, 'Experience']]) {
    await scrollToSection(page, 'skills', delta)
    await page.waitForTimeout(80)
    await expect(active).toHaveCount(1)
    await expect(active).toHaveText(new RegExp(`${label}$`))
  }
  await scrollBottom(page)
  await expect(active).toHaveCount(1)
  await expect(active).toHaveText(/Contact$/)
})

test('QT-007 Nav compacts beyond the 30 px scroll threshold', async ({ page }) => {
  await gotoHome(page)
  const nav = page.locator('nav.nav')
  await scrollToY(page, 30)
  await expect(nav).not.toHaveClass(/scrolled/)
  await scrollToY(page, 31)
  await page.waitForTimeout(400)
  await expect(nav).toHaveClass(/scrolled/)
  expect(await css(nav, 'height')).toBe('54px')
  expect(await css(nav, 'transition')).toContain('0.3s')
  await scrollToY(page, 0)
  await page.waitForTimeout(400)
  await expect(nav).not.toHaveClass(/scrolled/)
  expect(await css(nav, 'height')).toBe('64px')
})

test('QT-008 Hamburger replaces inline links at <= 900 px', async ({ page }, testInfo) => {
  await gotoHome(page)
  const links = page.locator('.nav-links')
  const burger = page.locator('.hamburger')
  const expectMobileLayout = async () => {
    await expect(links).toBeHidden()
    await expect(burger).toBeVisible()
    const box = await burger.boundingBox()
    const cw = await page.evaluate(() => document.documentElement.clientWidth)
    expect(box.x + box.width, 'hamburger must lie inside the visible viewport').toBeLessThanOrEqual(cw)
    await expect(burger).toHaveAttribute('aria-label', 'Menu')
    await expect(burger.locator('span')).toHaveCount(3)
  }
  const expectDesktopLayout = async () => {
    await expect(links).toBeVisible()
    await expect(burger).toBeHidden()
  }
  if (testInfo.project.name === 'mobile-chromium') await expectMobileLayout()
  else await expectDesktopLayout()
  await page.setViewportSize({ width: 900, height: 800 })
  await expectMobileLayout()
  await page.setViewportSize({ width: 901, height: 800 })
  await expectDesktopLayout()
})

test('QT-009 Hamburger toggles the mobile menu with 9 links and theme button', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  await gotoHome(page)
  const burger = page.locator('.hamburger')
  const menu = page.locator('.mobile-menu')
  await tapOrClick(burger)
  await expect(page.locator('.mobile-menu.open')).toBeVisible()
  expect(await css(menu, 'top')).toBe('64px')
  expect(await css(menu, 'position')).toBe('fixed')
  const links = menu.locator('a.nav-link')
  await expect(links).toHaveCount(9)
  for (let i = 0; i < NAV.length; i++) {
    await expect(links.nth(i)).toHaveText(NAV[i].icon + NAV[i].label)
    await expect(links.nth(i)).toHaveAttribute('href', `#${NAV[i].id}`)
    expect(await css(links.nth(i).locator('span').first(), 'font-size')).toBe('15px')
  }
  const btn = menu.locator('.theme-btn')
  await expect(btn).toContainText('Switch to Day Mode')
  const [bw, mw] = await Promise.all([btn.boundingBox(), menu.boundingBox()])
  const pad = await menu.evaluate((e) => parseFloat(getComputedStyle(e).paddingLeft) + parseFloat(getComputedStyle(e).paddingRight))
  expect(Math.abs(bw.width - (mw.width - pad))).toBeLessThanOrEqual(2)
  await tapOrClick(burger)
  await expect(menu).toBeHidden()
})

test('QT-010 Mobile menu closes on link or theme selection', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  await gotoHome(page)
  const burger = page.locator('.hamburger')
  const menu = page.locator('.mobile-menu')
  await tapOrClick(burger)
  await menu.locator('a[href="#contact"]').tap()
  await expect(menu).toBeHidden()
  await settleScroll(page, { from: 0 })
  expect(await page.evaluate(() => window.location.hash)).toBe('#contact')
  const top = await page.evaluate(() => document.getElementById('contact').getBoundingClientRect().top)
  expect(top).toBeGreaterThanOrEqual(-2)
  expect(top).toBeLessThanOrEqual(100)
  await tapOrClick(burger)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  await menu.locator('.theme-btn').tap()
  await expect(menu).toBeHidden()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
})

test('QT-011 Hamburger exposes aria-expanded and aria-controls', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  await gotoHome(page)
  const burger = page.locator('.hamburger')
  await expect(burger).toHaveAttribute('aria-expanded', 'false')
  await tapOrClick(burger)
  await expect(burger).toHaveAttribute('aria-expanded', 'true')
  const id = await burger.getAttribute('aria-controls')
  expect(id).toBeTruthy()
  await expect(page.locator('.mobile-menu')).toHaveAttribute('id', id)
  expect(await page.evaluate((i) => !!document.getElementById(i), id)).toBe(true)
})

test('QT-012 Escape closes the mobile menu and returns focus', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  const errors = collectErrors(page)
  await gotoHome(page)
  const burger = page.locator('.hamburger')
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    if (await burger.evaluate((e) => e === document.activeElement)) break
  }
  await expect(burger).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.mobile-menu.open')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.mobile-menu')).toBeHidden()
  await expect(burger).toHaveAttribute('aria-expanded', 'false')
  await expect(burger).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('.mobile-menu')).toBeHidden()
  await expect(burger).toHaveAttribute('aria-expanded', 'false')
  expect(errors.pageErrors).toEqual([])
})
