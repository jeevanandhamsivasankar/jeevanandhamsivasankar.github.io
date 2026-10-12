import { renderHook, act } from '@testing-library/react'
import { useScrolled } from '../../../src/hooks/useScrolled.js'

const scrollTo = (y) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('UNIT-USE_SCROLLED', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
  })

  it('UT-USE_SCROLLED-001 initial false at scrollY 0', () => {
    expect(renderHook(() => useScrolled()).result.current).toBe(false)
  })

  it('UT-USE_SCROLLED-002 boundary: 30 -> false, 31 -> true, 29 -> false', () => {
    const { result } = renderHook(() => useScrolled())
    scrollTo(30)
    expect(result.current).toBe(false)
    scrollTo(31)
    expect(result.current).toBe(true)
    scrollTo(29)
    expect(result.current).toBe(false)
  })

  it('UT-USE_SCROLLED-003 back to 0 -> false', () => {
    const { result } = renderHook(() => useScrolled())
    scrollTo(500)
    expect(result.current).toBe(true)
    scrollTo(0)
    expect(result.current).toBe(false)
  })

  it('UT-USE_SCROLLED-004 custom threshold (100) honoured', () => {
    const { result } = renderHook(() => useScrolled(100))
    scrollTo(100)
    expect(result.current).toBe(false)
    scrollTo(101)
    expect(result.current).toBe(true)
  })

  it('UT-USE_SCROLLED-005 passive scroll listener, removed on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrolled())
    const call = add.mock.calls.find(([type]) => type === 'scroll')
    expect(call).toBeTruthy()
    expect(call[2]).toEqual({ passive: true })
    unmount()
    expect(remove).toHaveBeenCalledWith('scroll', call[1])
  })

  it('UT-USE_SCROLLED-006 mounted at scrollY 500: false until the first scroll event (baseline)', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true })
    const { result } = renderHook(() => useScrolled())
    expect(result.current).toBe(false)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current).toBe(true)
  })
})
