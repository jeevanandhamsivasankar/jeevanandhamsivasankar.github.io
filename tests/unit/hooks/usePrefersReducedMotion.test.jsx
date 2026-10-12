import { renderHook, act } from '@testing-library/react'
import { usePrefersReducedMotion } from '../../../src/hooks/usePrefersReducedMotion.js'
import { setMatchMedia, mockMatchMedia } from '../../utils/browserMocks.js'

const Q = '(prefers-reduced-motion: reduce)'

describe('UNIT-USE_PREFERS_REDUCED_MOTION', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('UT-USE_PREFERS_REDUCED_MOTION-001 returns false when the query does not match', () => {
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-002 returns true when it matches', () => {
    setMatchMedia({ [Q]: true })
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-003 updates on a change event (false -> true -> false)', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    act(() => setMatchMedia({ [Q]: true }))
    expect(result.current).toBe(true)
    act(() => setMatchMedia({ [Q]: false }))
    expect(result.current).toBe(false)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-004 removes its listener on unmount', () => {
    const lists = []
    window.matchMedia = (q) => {
      const m = mockMatchMedia(q)
      vi.spyOn(m, 'addEventListener')
      vi.spyOn(m, 'removeEventListener')
      lists.push(m)
      return m
    }
    const { unmount } = renderHook(() => usePrefersReducedMotion())
    const subscribed = lists.find((m) => m.addEventListener.mock.calls.length > 0)
    expect(subscribed).toBeTruthy()
    const [, handler] = subscribed.addEventListener.mock.calls[0]
    unmount()
    expect(subscribed.removeEventListener).toHaveBeenCalledWith('change', handler)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-005 no window.matchMedia -> false, no throw', () => {
    vi.stubGlobal('matchMedia', undefined)
    let hook
    expect(() => {
      hook = renderHook(() => usePrefersReducedMotion())
    }).not.toThrow()
    expect(hook.result.current).toBe(false)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-006 MediaQueryList with only addListener (legacy) is supported', () => {
    let state = false
    let legacyHandler
    const mql = {
      get matches() {
        return state
      },
      addListener: vi.fn((fn) => {
        legacyHandler = fn
      }),
      removeListener: vi.fn(),
    }
    window.matchMedia = () => mql
    const { result, unmount } = renderHook(() => usePrefersReducedMotion())
    expect(mql.addListener).toHaveBeenCalledTimes(1)
    act(() => legacyHandler({ matches: true }))
    expect(result.current).toBe(true)
    unmount()
    expect(mql.removeListener).toHaveBeenCalledWith(legacyHandler)
  })

  it('UT-USE_PREFERS_REDUCED_MOTION-007 queries exactly (prefers-reduced-motion: reduce)', () => {
    const queries = []
    window.matchMedia = (q) => {
      queries.push(q)
      return mockMatchMedia(q)
    }
    renderHook(() => usePrefersReducedMotion())
    expect(queries.length).toBeGreaterThan(0)
    expect(new Set(queries)).toEqual(new Set([Q]))
  })
})
