import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import App from '../../src/App.jsx'
import Nav from '../../src/components/layout/Nav.jsx'
import { NAV_ITEMS } from '../../src/config/sections.js'
import { ThemeProvider, useThemeContext } from '../../src/context/ThemeContext.jsx'
import { renderAndSettle, installFakeTime } from '../utils/appHelpers.jsx'

process.env.TZ = 'Asia/Kolkata'

const KEY = 'jsv-theme-override'
const NIGHT_ISO = '2026-06-21T17:30:00Z' // 23:00 IST
const NOON_ISO = '2026-06-21T06:30:00Z' // 12:00 IST

const themeAttr = () => document.documentElement.dataset.theme
const badge = () => document.querySelector('.theme-badge').textContent
const navToggle = () => document.querySelector('.nav-right .theme-btn')
const mobileToggle = () => document.querySelector('.mobile-menu .theme-btn')
const tick = (ms) => act(() => { vi.advanceTimersByTime(ms) })

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
})

describe('theme integration (ARC-008, ARC-009, ARC-014, ARC-007)', () => {
  it('IT-002 ThemeProvider + Nav toggle -> html[data-theme] -> localStorage', async () => {
    installFakeTime(NIGHT_ISO)
    await renderAndSettle(<App />)
    expect(themeAttr()).toBe('night')

    fireEvent.click(navToggle())
    expect(themeAttr()).toBe('day')
    expect(navToggle()).toHaveTextContent('Night')
    expect(badge()).toMatch(/DAY/)
    expect(localStorage.getItem(KEY)).toBe('day')

    fireEvent.click(document.querySelector('.hamburger'))
    expect(document.querySelector('.mobile-menu')).toHaveClass('open')
    fireEvent.click(mobileToggle())
    expect(themeAttr()).toBe('night')
    expect(localStorage.getItem(KEY)).toBe('night')
    expect(document.querySelector('.mobile-menu')).not.toHaveClass('open')
    expect(localStorage.length).toBe(1)
  })

  it('IT-003 theme-before-paint: attribute set in the provider layout phase, no night frame for day visitors', () => {
    installFakeTime(NOON_ISO)
    const seenInPassive = []
    function Probe() {
      useEffect(() => {
        seenInPassive.push(themeAttr())
      }, [])
      return null
    }
    const records = []
    const mo = new MutationObserver((list) => records.push(...list))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    act(() => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      )
    })
    records.push(...mo.takeRecords())
    mo.disconnect()

    expect(records).toHaveLength(1) // only one attribute write for the initial render
    expect(themeAttr()).toBe('day')
    expect(seenInPassive).toEqual(['day']) // layout effect ran before passive effects
  })

  it('IT-004 override persistence across remount (simulated reload)', () => {
    installFakeTime(NOON_ISO)
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const tree = (
      <ThemeProvider>
        <Nav items={NAV_ITEMS} />
      </ThemeProvider>
    )

    const first = render(tree)
    expect(themeAttr()).toBe('day')
    fireEvent.click(navToggle())
    expect(themeAttr()).toBe('night')
    first.unmount()

    tick(10 * 60 * 1000)
    document.documentElement.removeAttribute('data-theme')
    setIntervalSpy.mockClear()
    const records = []
    const mo = new MutationObserver((list) => records.push(...list))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    render(tree)
    records.push(...mo.takeRecords())
    mo.disconnect()
    expect(records).toHaveLength(1)
    expect(themeAttr()).toBe('night') // applied before paint, from the stored override

    // only the clock interval is active (no automatic theme re-check)
    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    expect(badge()).toMatch(/NIGHT · 12:10\spm/i)
    tick(3 * 60 * 1000)
    expect(themeAttr()).toBe('night')
    expect(badge()).toMatch(/NIGHT · 12:13\spm/i)
  })

  it('IT-005 storage failure modes fall back to the automatic theme without errors', async () => {
    const KEY_ = KEY
    const variants = {
      'getItem throws': () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('denied')
        })
      },
      'setItem throws QuotaExceededError': () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new DOMException('full', 'QuotaExceededError')
        })
      },
      'stored value is "foo"': () => {
        localStorage.setItem(KEY_, 'foo')
      },
      'window.localStorage getter throws': () => {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() {
            throw new DOMException('blocked', 'SecurityError')
          },
        })
      },
    }
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      for (const [name, arrange] of Object.entries(variants)) {
        localStorage.clear()
        document.documentElement.removeAttribute('data-theme')
        installFakeTime(NOON_ISO)
        arrange()
        const view = await renderAndSettle(<App />)
        expect(themeAttr(), name).toBe('day')
        fireEvent.click(navToggle())
        expect(themeAttr(), name).toBe('night')
        tick(2 * 60 * 1000)
        expect(themeAttr(), name).toBe('night') // stays for the page lifetime
        view.unmount()
        vi.useRealTimers()
        vi.mocked(Storage.prototype.getItem).mockRestore?.()
        vi.mocked(Storage.prototype.setItem).mockRestore?.()
        if (descriptor) Object.defineProperty(window, 'localStorage', descriptor)
      }
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      if (descriptor) Object.defineProperty(window, 'localStorage', descriptor)
    }
  })

  it('IT-006 auto switch across sunset and manual toggle stopping it', async () => {
    installFakeTime('2026-06-21T13:01:30Z') // 18:31:30 IST
    const first = await renderAndSettle(<App />)
    expect(themeAttr()).toBe('day')
    tick(60000) // 18:32:30 IST: after sunset 18:32:03
    expect(themeAttr()).toBe('night')
    expect(badge()).toMatch(/NIGHT/)
    tick(60000)
    expect(themeAttr()).toBe('night')
    first.unmount()

    localStorage.clear()
    vi.setSystemTime(new Date('2026-06-22T00:15:00Z')) // 05:45 IST, before sunrise
    await renderAndSettle(<App />)
    expect(themeAttr()).toBe('night')
    fireEvent.click(navToggle())
    expect(themeAttr()).toBe('day')
    tick(5 * 60 * 1000) // across sunrise
    expect(themeAttr()).toBe('day')
  })

  it('IT-007 badge clock refreshes every 60 s with and without override', async () => {
    installFakeTime(NIGHT_ISO)
    await renderAndSettle(<App />)
    expect(badge()).toMatch(/NIGHT · 11:00\spm/i)
    tick(60000)
    expect(badge()).toMatch(/NIGHT · 11:01\spm/i)
    fireEvent.click(navToggle())
    tick(60000)
    expect(badge()).toMatch(/DAY · 11:02\spm/i)
  })

  it('IT-008 context contract and use outside the provider', () => {
    const received = {}
    function Consumer({ sink }) {
      const ctx = useThemeContext()
      useEffect(() => {
        Object.assign(sink, ctx)
      })
      return null
    }
    render(
      <ThemeProvider>
        <Consumer sink={received} />
      </ThemeProvider>,
    )
    expect(['day', 'night']).toContain(received.theme)
    expect(received.isDay).toBe(received.theme === 'day')
    expect(received.now).toBeInstanceOf(Date)
    expect(typeof received.toggle).toBe('function')

    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer sink={{}} />)).toThrow(new Error('useThemeContext must be used within ThemeProvider'))
  })
})

// keep screen import used for debugging convenience
void screen
