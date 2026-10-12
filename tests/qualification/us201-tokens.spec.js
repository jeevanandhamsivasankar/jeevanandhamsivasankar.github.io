import { test, expect, gotoHome, freshPage, loadAllSections } from './helpers.js'
import { THEME_KEY } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const rgbOf = (hex) => {
  const n = hex.replace('#', '')
  return `rgb(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)})`
}

for (const theme of ['night', 'day']) {
  test(`QT-131 computed colours resolve to v2 tokens (${theme})`, async ({ browser }, testInfo) => {
    const { page, context } = await freshPage(browser, testInfo)
    await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [THEME_KEY, theme])
    await gotoHome(page, { at: null })
    await loadAllSections(page)
    const res = await page.evaluate(() => {
      const probe = (sel, prop) => {
        const el = document.querySelector(sel)
        return el ? getComputedStyle(el)[prop] : null
      }
      const tokenRgb = (name) => {
        const d = document.createElement('i')
        d.style.color = `var(${name})`
        document.body.appendChild(d)
        const c = getComputedStyle(d).color
        d.remove()
        return c
      }
      return {
        text3: tokenRgb('--color-text-3'),
        text2: tokenRgb('--color-text-2'),
        accent: tokenRgb('--color-accent'),
        meta: probe('.exp-period, .exp-company-loc, .contact-loc', 'color'),
        outlineBorder: probe('.btn-outline', 'borderTopColor'),
        badgeColor: probe('.badge', 'color'),
        legacyMuted: (() => {
          const d = document.createElement('i')
          d.style.color = 'var(--muted)'
          document.body.appendChild(d)
          const c = getComputedStyle(d).color
          d.remove()
          return c
        })(),
      }
    })
    // Meta text no longer uses the sub-AA #475569 / #94a3b8 muted values.
    expect(res.legacyMuted).toBe(res.text3)
    expect(res.legacyMuted).not.toBe(rgbOf('#475569'))
    if (theme === 'night') {
      expect(res.text3).toBe(rgbOf('#8291a7'))
      expect(res.accent).toBe(rgbOf('#f59e0b'))
    } else {
      expect(res.text3).toBe(rgbOf('#5b6b82'))
    }
    expect(res.badgeColor).toBe(res.text2)
    await context.close()
  })
}
