import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '../../../src/hooks/useTypewriter.js'

const WORDS = ['Qt / QML Developer', 'Embedded HMI Engineer', 'UX / UI Engineer']
const rng0 = () => 0
const at = (ms) => act(() => vi.advanceTimersByTime(ms))
const setup = (words = WORDS, opts = { rng: rng0 }) => renderHook((p) => useTypewriter(p.words, p.opts), {
  initialProps: { words, opts },
})

describe('UNIT-USE_TYPEWRITER', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('UT-USE_TYPEWRITER-001 with rng 0: "" at 899 ms; "Q" at 900 ms', () => {
    const { result } = setup()
    expect(result.current).toBe('')
    at(899)
    expect(result.current).toBe('')
    at(1)
    expect(result.current).toBe('Q')
  })

  it('UT-USE_TYPEWRITER-002 each further character after 65 ms; 2 chars at 965 ms', () => {
    const { result } = setup()
    at(900)
    at(64)
    expect(result.current).toBe('Q')
    at(1)
    expect(result.current).toBe('Qt')
  })

  it('UT-USE_TYPEWRITER-003 full first word (18 chars) at 2005 ms; still full at 2069 ms', () => {
    const { result } = setup()
    at(2004)
    expect(result.current).toHaveLength(17)
    at(1)
    expect(result.current).toBe('Qt / QML Developer')
    expect(result.current).toHaveLength(18)
    at(64)
    expect(result.current).toBe('Qt / QML Developer')
  })

  it('UT-USE_TYPEWRITER-004 completion check at 2070 ms schedules the 1800 ms pause: full at 3869, 17 chars at 3870', () => {
    const { result } = setup()
    at(3869)
    expect(result.current).toBe('Qt / QML Developer')
    at(1)
    expect(result.current).toBe('Qt / QML Develope')
    expect(result.current).toHaveLength(17)
  })

  it('UT-USE_TYPEWRITER-005 deletion every 35 ms: empty at 4465 ms', () => {
    const { result } = setup()
    at(3870)
    at(34)
    expect(result.current).toHaveLength(17)
    at(35 - 34)
    expect(result.current).toHaveLength(16)
    at(4464 - 3905)
    expect(result.current).toHaveLength(1)
    at(1)
    expect(result.current).toBe('')
  })

  it('UT-USE_TYPEWRITER-006 300 ms wait then the next word: "E" at 4800 ms', () => {
    const { result } = setup()
    at(4799)
    expect(result.current).toBe('')
    at(1)
    expect(result.current).toBe('E')
  })

  it('UT-USE_TYPEWRITER-007 jitter: rng 0.999 -> type interval 65 + 29.97 ms', () => {
    // Fake timers truncate fractional delays, so assert the requested delay itself.
    const spy = vi.spyOn(globalThis, 'setTimeout')
    const { result } = setup(WORDS, { rng: () => 0.999 })
    at(900)
    expect(result.current).toBe('Q')
    const delays = spy.mock.calls.map(([, d]) => d)
    expect(delays[delays.length - 1]).toBeCloseTo(65 + 0.999 * 30, 5)
    expect(delays[delays.length - 1]).toBeLessThan(95)
    at(95)
    expect(result.current).toBe('Qt')
  })

  it('UT-USE_TYPEWRITER-008 wraps from the last word to the first', () => {
    const { result } = setup(['a', 'b'])
    at(900)
    expect(result.current).toBe('a')
    at(3100 - 900)
    expect(result.current).toBe('b')
    at(5300 - 3100)
    expect(result.current).toBe('a')
  })

  it('UT-USE_TYPEWRITER-009 single-word list cycles that word', () => {
    const { result } = setup(['ab'])
    at(900)
    expect(result.current).toBe('a')
    at(65)
    expect(result.current).toBe('ab')
    // pause 1800 from the completion check at +65, delete, wait 300, type again
    at(65 + 1800 + 35 * 2 + 35 + 300 + 900)
    expect(['a', 'ab', '']).toContain(result.current)
    at(5000)
    expect(result.current.startsWith('a') || result.current === '').toBe(true)
  })

  it('UT-USE_TYPEWRITER-010 unmount clears the pending timer in every phase', () => {
    for (const ms of [950, 2500, 4000, 4480]) {
      const { unmount } = setup()
      at(ms)
      expect(vi.getTimerCount(), `phase at ${ms}`).toBe(1)
      unmount()
      expect(vi.getTimerCount(), `after unmount at ${ms}`).toBe(0)
    }
  })

  it('UT-USE_TYPEWRITER-011 enabled: false returns words[0] immediately and schedules no timers', () => {
    const { result } = setup(WORDS, { rng: rng0, enabled: false })
    expect(result.current).toBe(WORDS[0])
    expect(vi.getTimerCount()).toBe(0)
    at(10_000)
    expect(result.current).toBe(WORDS[0])
  })

  it('UT-USE_TYPEWRITER-012 enabled switching true->false mid-cycle returns words[0] and clears timers', () => {
    const { result, rerender } = setup()
    at(1000)
    expect(result.current).not.toBe(WORDS[0])
    rerender({ words: WORDS, opts: { rng: rng0, enabled: false } })
    expect(result.current).toBe(WORDS[0])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('UT-USE_TYPEWRITER-013 custom speed, deleteSpeed and pause honoured', () => {
    const words = ['ab']
    const { result } = setup(words, { rng: rng0, speed: 10, deleteSpeed: 5, pause: 100 })
    at(900)
    expect(result.current).toBe('a')
    at(9)
    expect(result.current).toBe('a')
    at(1)
    expect(result.current).toBe('ab')
    at(10 + 99) // completion check at +10, pause 100
    expect(result.current).toBe('ab')
    at(1)
    expect(result.current).toBe('a')
    at(5)
    expect(result.current).toBe('')
  })

  it('UT-USE_TYPEWRITER-014 default rng is Math.random (called once per typed character)', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useTypewriter(WORDS))
    at(900)
    expect(result.current).toBe('Q')
    expect(spy).toHaveBeenCalledTimes(1)
    at(65)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('UT-USE_TYPEWRITER-015 empty words returns "" without throwing or scheduling', () => {
    let hook
    expect(() => {
      hook = renderHook(() => useTypewriter([]))
    }).not.toThrow()
    expect(hook.result.current).toBe('')
    expect(vi.getTimerCount()).toBe(0)
  })
})
