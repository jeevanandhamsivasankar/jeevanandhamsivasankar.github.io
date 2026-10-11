import { test, expect } from './fixtures.js'

test('QT-SMOKE-001 home page loads with expected title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Jeevanandham/)
})
