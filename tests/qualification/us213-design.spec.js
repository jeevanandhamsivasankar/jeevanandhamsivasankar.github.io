import { test, expect, gotoHome, loadAllSections } from './helpers.js'

test('QT-169 design cards without owner media render the existing SVG art, aria-hidden, no media slot or placeholder', async ({ page }) => {
  await gotoHome(page)
  await loadAllSections(page)
  const bgs = page.locator('#design .behance-card-bg')
  await expect(bgs).toHaveCount(5)
  for (let i = 0; i < 5; i++) {
    await expect(bgs.nth(i)).toHaveAttribute('aria-hidden', 'true')
    await expect(bgs.nth(i).locator('svg')).toHaveCount(1)
  }
  await expect(page.locator('#design .media-slot')).toHaveCount(0)
  expect(await page.locator('#design').innerText()).not.toMatch(/PLACEHOLDER|Rajesh|Kumar/)
})

test('QT-170 reduced motion: no animation or transition runs on design art', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoHome(page)
  await loadAllSections(page)
  const running = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.effect?.target?.closest?.('#design .behance-card-bg') && a.playState === 'running').length,
  )
  expect(running).toBe(0)
})
