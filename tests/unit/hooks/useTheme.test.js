import { StrictMode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { useTheme, THEME_RECHECK_MS, CLOCK_TICK_MS } from '../../../src/hooks/useTheme.js'
import { readThemeOverride, writeThemeOverride } from '../../../src/lib/storage.js'
import { getSunPhase } from '../../../src/lib/solar.js'

vi.mock('../../../src/lib/storage.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    readThemeOverride: vi.fn(actual.readThemeOverride),
    writeThemeOverride: vi.fn(actual.writeThemeOverride),
  }
})
vi.mock('../../../src/lib/solar.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getSunPhase: vi.fn(actual.getSunPhase) }
})

const IST = 5.5 * 3_600_000
/** Instant for an IST wall-clock time. */
const ist = (y, mo, d, h, mi = 0, s = 0) => new Date(Date.UTC(y, mo - 1, d, h, mi, s) - IST)
const DAY_NOON = ist(2026, 6, 21, 12, 0)
const NIGHT_23 = ist(2026, 6, 21, 23, 0)
const root = () => document.documentElement

function stubStorage(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: vi.fn((k) => (k in data ? data[k] : null)),
    setItem: vi.fn((k, v) => {
      data[k] = String(v)
    }),
  }
}

const advance = (ms) => act(() => vi.advanceTimersByTime(ms))

describe('UNIT-USE_THEME', () => {
  let realRead
  let realWrite
  let realPhase

  beforeEach(async () => {
    const storageActual = await vi.importActual('../../../src/lib/storage.js')
    const solarActual = await vi.importActual('../../../src/lib/solar.js')
    realRead = storageActual.readThemeOverride
    realWrite = storageActual.writeThemeOverride
    realPhase = solarActual.getSunPhase
    readThemeOverride.mockImplementation(realRead)
    writeThemeOverride.mockImplementation(realWrite)
    getSunPhase.mockImplementation(realPhase)
    vi.useFakeTimers()
    vi.setSystemTime(DAY_NOON)
    root().removeAttribute('data-theme')
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    root().removeAttribute('data-theme')
    window.localStorage.clear()
  })

  it('UT-USE_THEME-001 initial theme is day at 12:00 IST and night at 23:00 IST (storage empty)', () => {
    const storage = stubStorage()
    expect(renderHook(() => useTheme({ storage })).result.current.theme).toBe('day')
    vi.setSystemTime(NIGHT_23)
    const night = renderHook(() => useTheme({ storage })).result.current
    expect(night.theme).toBe('night')
    expect(night.isDay).toBe(false)
  })

  it('UT-USE_THEME-002 data-theme is written in a layout effect, before passive effects, never night first for a day visitor', () => {
    const seen = []
    const spy = vi.spyOn(root(), 'setAttribute')
    renderHook(() => {
      const theme = useTheme({ storage: stubStorage() })
      // sibling passive effect observing the attribute
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffectProbe(seen)
      return theme
    })
    expect(seen[0]).toBe('day')
    const themeWrites = spy.mock.calls.filter(([k]) => k === 'data-theme').map(([, v]) => v)
    expect(themeWrites.length).toBeGreaterThan(0)
    expect(themeWrites[0]).toBe('day')
    expect(themeWrites).not.toContain('night')
  })

  it('UT-USE_THEME-003 attribute follows theme changes and is always exactly day or night', () => {
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect(root().getAttribute('data-theme')).toBe('day')
    act(() => result.current.toggle())
    expect(root().getAttribute('data-theme')).toBe('night')
    act(() => result.current.toggle())
    expect(root().getAttribute('data-theme')).toBe('day')
    expect(['day', 'night']).toContain(root().getAttribute('data-theme'))
  })

  it('UT-USE_THEME-004 auto mode flips to night after sunset (18:31:30 IST day 172, two 60 s ticks)', () => {
    vi.setSystemTime(ist(2026, 6, 21, 18, 31, 30))
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect(result.current.theme).toBe('day')
    advance(60_000)
    advance(60_000)
    expect(result.current.theme).toBe('night')
    expect(root().getAttribute('data-theme')).toBe('night')
  })

  it('UT-USE_THEME-005 theme interval period is 60 000 ms (no evaluation at 59 999 ms)', () => {
    expect(THEME_RECHECK_MS).toBe(60000)
    expect(CLOCK_TICK_MS).toBe(60000)
    renderHook(() => useTheme({ storage: stubStorage() }))
    const initial = getSunPhase.mock.calls.length
    advance(59_999)
    expect(getSunPhase.mock.calls.length).toBe(initial)
    advance(1)
    expect(getSunPhase.mock.calls.length).toBe(initial + 1)
  })

  it('UT-USE_THEME-006 unmount clears the interval(s)', () => {
    const { unmount } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('UT-USE_THEME-007 toggle flips day<->night and isDay is consistent', () => {
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect([result.current.theme, result.current.isDay]).toEqual(['day', true])
    act(() => result.current.toggle())
    expect([result.current.theme, result.current.isDay]).toEqual(['night', false])
    act(() => result.current.toggle())
    expect([result.current.theme, result.current.isDay]).toEqual(['day', true])
  })

  it('UT-USE_THEME-008 after toggle the theme interval is cleared and sunset no longer changes the theme', () => {
    vi.setSystemTime(ist(2026, 6, 21, 18, 31, 30))
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect(vi.getTimerCount()).toBe(2)
    act(() => result.current.toggle()) // night
    act(() => result.current.toggle()) // day again, manual
    expect(vi.getTimerCount()).toBe(1) // only the clock
    advance(5 * 60_000)
    expect(result.current.theme).toBe('day')
  })

  it('UT-USE_THEME-009 toggle writes jsv-theme-override via writeThemeOverride with the latest value', () => {
    const storage = stubStorage()
    const { result } = renderHook(() => useTheme({ storage }))
    expect(writeThemeOverride).not.toHaveBeenCalled()
    act(() => result.current.toggle())
    expect(writeThemeOverride).toHaveBeenLastCalledWith('night', storage)
    expect(storage.data['jsv-theme-override']).toBe('night')
    act(() => {
      result.current.toggle()
      result.current.toggle()
    })
    expect(writeThemeOverride).toHaveBeenLastCalledWith(result.current.theme, storage)
    expect(storage.data['jsv-theme-override']).toBe(result.current.theme)
  })

  it('UT-USE_THEME-010 stored "night" at mount during day -> night, counts as override, no theme interval', () => {
    const storage = stubStorage({ 'jsv-theme-override': 'night' })
    const { result } = renderHook(() => useTheme({ storage }))
    expect(result.current.theme).toBe('night')
    expect(result.current.isManual).toBe(true)
    expect(vi.getTimerCount()).toBe(1)
    advance(10 * 60_000)
    expect(result.current.theme).toBe('night')
  })

  it('UT-USE_THEME-011 stored "day" at mount during night -> day', () => {
    vi.setSystemTime(NIGHT_23)
    const storage = stubStorage({ 'jsv-theme-override': 'day' })
    const { result } = renderHook(() => useTheme({ storage }))
    expect(result.current.theme).toBe('day')
    expect(root().getAttribute('data-theme')).toBe('day')
  })

  it('UT-USE_THEME-012 readThemeOverride returning null -> automatic theme and interval; nothing thrown', () => {
    readThemeOverride.mockReturnValue(null)
    let hook
    expect(() => {
      hook = renderHook(() => useTheme())
    }).not.toThrow()
    expect(hook.result.current.theme).toBe('day')
    expect(hook.result.current.isManual).toBe(false)
    expect(vi.getTimerCount()).toBe(2)
  })

  it('UT-USE_THEME-013 writeThemeOverride returning false -> toggle still flips; no error', () => {
    writeThemeOverride.mockReturnValue(false)
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    expect(() => act(() => result.current.toggle())).not.toThrow()
    expect(result.current.theme).toBe('night')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('day')
  })

  it('UT-USE_THEME-014 now refreshes every 60 s in auto mode', () => {
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    const t0 = result.current.now.getTime()
    advance(60_000)
    expect(result.current.now.getTime()).toBe(t0 + 60_000)
    advance(60_000)
    expect(result.current.now.getTime()).toBe(t0 + 120_000)
  })

  it('UT-USE_THEME-015 now still refreshes every 60 s while a manual override is active', () => {
    const { result } = renderHook(() => useTheme({ storage: stubStorage() }))
    act(() => result.current.toggle())
    const t0 = result.current.now.getTime()
    advance(60_000)
    expect(result.current.now.getTime()).toBe(t0 + 60_000)
    advance(60_000)
    expect(result.current.now.getTime()).toBe(t0 + 120_000)
  })

  it('UT-USE_THEME-016 StrictMode double mount leaves one theme interval and one clock interval', () => {
    renderHook(() => useTheme({ storage: stubStorage() }), { wrapper: StrictMode })
    expect(vi.getTimerCount()).toBe(2)
  })

  it('UT-USE_THEME-017 no re-render when the tick computes an unchanged phase', () => {
    let renders = 0
    renderHook(() => {
      renders += 1
      return useTheme({ storage: stubStorage() })
    })
    const base = renders
    // Timers fire in creation order: theme interval first, then the clock.
    act(() => {
      vi.advanceTimersToNextTimer()
    })
    expect(renders).toBe(base) // theme tick, same phase: bail-out
    act(() => {
      vi.advanceTimersToNextTimer()
    })
    expect(renders).toBe(base + 1) // clock tick: `now` changed
  })
})

import { useEffect } from 'react'
function useEffectProbe(seen) {
  useEffect(() => {
    seen.push(document.documentElement.getAttribute('data-theme'))
  }, [seen])
}
