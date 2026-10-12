import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as site from '../../../src/config/site.js'

describe('UNIT-CONFIG_SITE', () => {
  it('UT-CONFIG_SITE-001 EMAIL, PHONE and PHONE_HREF are exact', () => {
    expect(site.EMAIL).toBe('jeevanandhamsivashankaran@gmail.com')
    expect(site.PHONE).toBe('+91 8111010315')
    expect(site.PHONE_HREF).toBe('tel:+918111010315')
  })

  it('UT-CONFIG_SITE-002 URLS hold the exact baseline values', () => {
    expect(site.URLS.linkedin).toBe('https://linkedin.com/in/jeevanandhamsivashankaran/')
    expect(site.URLS.behance).toBe('https://behance.net/s_jeevanandham')
    expect(site.URLS.github).toBe('https://github.com/jeevanandhamsivasankar')
    expect(site.URLS.canonical).toBe('https://jeevanandhamsivasankar.github.io/')
  })

  it('UT-CONFIG_SITE-003 RESUME is {href, downloadName, pages}', () => {
    expect(site.RESUME).toEqual({
      href: 'Jeevanandham_Resume.pdf',
      downloadName: 'Jeevanandham_SeniorHMIEngineer_Resume.pdf',
      pages: 3,
    })
  })

  it('UT-CONFIG_SITE-004 FOOTER_TEXT, OWNER_NAME, OWNER_TITLE and LOCATION are exact', () => {
    expect(site.FOOTER_TEXT).toBe('© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION')
    expect(site.OWNER_NAME).toBe('S. Jeevanandham')
    expect(site.OWNER_TITLE).toBe('Senior HMI Engineer')
    expect(site.LOCATION).toBe('Chennai, Tamil Nadu, India')
  })

  it('UT-CONFIG_SITE-005 THEME_GEO is {lat 13.08, lon 80.27, tzOffsetHours 5.5}', () => {
    expect(site.THEME_GEO).toEqual({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 })
  })

  it('UT-CONFIG_SITE-006 THEME_STORAGE_KEY is jsv-theme-override', () => {
    expect(site.THEME_STORAGE_KEY).toBe('jsv-theme-override')
  })

  it('UT-CONFIG_SITE-007 all exports are deeply frozen (or primitive); module imports nothing', () => {
    const frozen = (v) => {
      if (v === null || typeof v !== 'object') return true
      return Object.isFrozen(v) && Object.values(v).every(frozen)
    }
    for (const [name, value] of Object.entries(site)) expect(frozen(value), name).toBe(true)
    const src = readFileSync(resolve(process.cwd(), 'src/config/site.js'), 'utf8')
    expect(src).not.toMatch(/^\s*import\s/m)
    expect(src).not.toMatch(/\bimport\s*\(/)
  })
})
