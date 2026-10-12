import { renderHook, act } from '@testing-library/react'
import {
  useActiveSection,
  useHashScroll,
  pickActiveSection,
  ACTIVE_OFFSET_PX,
} from '../../../src/hooks/useActiveSection.js'

const setScrollY = (y) =>
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
const scroll = (y) => {
  if (y !== undefined) setScrollY(y)
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

/** Mount [data-section] elements with stubbed offsetTop. */
function mountSections(spec) {
  const els = spec.map(([id, top, extra = {}]) => {
    const el = document.createElement('section')
    el.dataset.section = id
    Object.defineProperty(el, 'offsetTop', { value: top, configurable: true })
    if (extra.placeholder) el.setAttribute('data-section-placeholder', '')
    document.body.appendChild(el)
    return el
  })
  return els
}
const SPEC = [['hero', 0], ['about', 800], ['contact', 1600]]

describe('UNIT-USE_ACTIVE_SECTION', () => {
  beforeEach(() => setScrollY(0))
  afterEach(() => {
    document.body.innerHTML = ''
    window.location.hash = ''
    vi.useRealTimers()
  })

  it('UT-USE_ACTIVE_SECTION-001 returns "hero" at scrollY 0 (default)', () => {
    mountSections(SPEC)
    expect(renderHook(() => useActiveSection()).result.current).toBe('hero')
  })

  it('UT-USE_ACTIVE_SECTION-002 registers the scroll listener with {passive: true}', () => {
    const add = vi.spyOn(window, 'addEventListener')
    renderHook(() => useActiveSection())
    const call = add.mock.calls.find(([type]) => type === 'scroll')
    expect(call).toBeTruthy()
    expect(call[2]).toEqual({ passive: true })
  })

  it('UT-USE_ACTIVE_SECTION-003 picks the last [data-section] with offsetTop - 140 <= scrollY', () => {
    mountSections(SPEC)
    const { result } = renderHook(() => useActiveSection())
    scroll(100)
    expect(result.current).toBe('hero')
    scroll(700)
    expect(result.current).toBe('about')
    scroll(1500)
    expect(result.current).toBe('contact')
  })

  it('UT-USE_ACTIVE_SECTION-004 boundary: offsetTop - 140 -> that section; offsetTop - 141 -> previous', () => {
    mountSections(SPEC)
    const { result } = renderHook(() => useActiveSection())
    expect(ACTIVE_OFFSET_PX).toBe(140)
    scroll(800 - 140)
    expect(result.current).toBe('about')
    scroll(800 - 141)
    expect(result.current).toBe('hero')
  })

  it('UT-USE_ACTIVE_SECTION-005 scrollY beyond the last section -> "contact"', () => {
    mountSections(SPEC)
    const { result } = renderHook(() => useActiveSection())
    scroll(99999)
    expect(result.current).toBe('contact')
  })

  it('UT-USE_ACTIVE_SECTION-006 last match in document order wins even when offsets are non-monotonic', () => {
    mountSections([['hero', 0], ['a', 2000], ['b', 100], ['c', 3000]])
    const { result } = renderHook(() => useActiveSection())
    scroll(500)
    expect(result.current).toBe('b')
  })

  it('UT-USE_ACTIVE_SECTION-007 rAF coalescing: 5 scroll events in one frame -> one querySelectorAll measurement', () => {
    mountSections(SPEC)
    renderHook(() => useActiveSection())
    const spy = vi.spyOn(document, 'querySelectorAll')
    for (let i = 0; i < 5; i += 1) scroll(100 + i)
    // let the frame elapse
    act(() => {
      vi.useFakeTimers()
      vi.runAllTimers()
    })
    expect(spy.mock.calls.filter(([sel]) => sel === '[data-section]')).toHaveLength(1)
  })

  it('UT-USE_ACTIVE_SECTION-008 no state update when the active id is unchanged', () => {
    mountSections(SPEC)
    let renders = 0
    renderHook(() => {
      renders += 1
      return useActiveSection()
    })
    scroll(10)
    const after = renders
    scroll(20)
    scroll(30)
    expect(renders).toBe(after)
  })

  it('UT-USE_ACTIVE_SECTION-009 custom defaultId honoured', () => {
    expect(renderHook(() => useActiveSection('top')).result.current).toBe('top')
  })

  it('UT-USE_ACTIVE_SECTION-010 unmount removes the same scroll listener', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useActiveSection())
    const handler = add.mock.calls.find(([type]) => type === 'scroll')[1]
    unmount()
    expect(remove).toHaveBeenCalledWith('scroll', handler)
  })

  it('UT-USE_ACTIVE_SECTION-016 unmount cancels a pending rAF', () => {
    mountSections(SPEC)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = renderHook(() => useActiveSection())
    scroll(100) // schedules a measurement frame
    unmount()
    expect(cancel).toHaveBeenCalled()
  })

  it('UT-USE_ACTIVE_SECTION-011 no [data-section] elements -> default id', () => {
    const { result } = renderHook(() => useActiveSection())
    scroll(500)
    expect(result.current).toBe('hero')
  })

  it('UT-USE_ACTIVE_SECTION-012 placeholder elements with data-section participate', () => {
    mountSections([['hero', 0], ['about', 800, { placeholder: true }], ['contact', 1600, { placeholder: true }]])
    const { result } = renderHook(() => useActiveSection())
    scroll(900)
    expect(result.current).toBe('about')
    scroll(1700)
    expect(result.current).toBe('contact')
  })

  it('UT-USE_ACTIVE_SECTION-013 pickActiveSection table of normal/boundary cases', () => {
    const nodes = mountSections([['hero', 0], ['second', 800], ['third', 1600]])
    const cases = [
      [0, 'hero'], [659, 'hero'], [660, 'second'], [661, 'second'], [1459, 'second'], [1460, 'third'], [5000, 'third'],
    ]
    for (const [y, id] of cases) expect(pickActiveSection(nodes, y), `y=${y}`).toBe(id)
    expect(pickActiveSection([], 500)).toBe('hero')
    expect(pickActiveSection([], 500, 140, 'x')).toBe('x')
    expect(pickActiveSection(nodes, 700, 0)).toBe('hero')
    expect(pickActiveSection(nodes, 800, 0)).toBe('second')
  })

  describe('useHashScroll', () => {
    function setup({ hash, children }) {
      const root = document.createElement('div')
      root.innerHTML = children
      document.body.appendChild(root)
      window.location.hash = hash
      return root
    }
    const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

    it('UT-USE_ACTIVE_SECTION-014 hash scroll: target appears later -> scrollIntoView called once on it', async () => {
      const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
      const root = setup({ hash: '#resume', children: '<div id="resume" data-section-placeholder></div>' })
      renderHook(() => useHashScroll({ current: root }))
      await flush()
      expect(spy).not.toHaveBeenCalled()
      // lazy content replaces the placeholder
      const real = document.createElement('section')
      real.id = 'resume'
      real.dataset.section = 'resume'
      await act(async () => {
        root.replaceChild(real, root.querySelector('[data-section-placeholder]'))
        await Promise.resolve()
      })
      await flush()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.contexts[0]).toBe(real)
      // one-shot: further DOM changes do not scroll again
      await act(async () => {
        root.appendChild(document.createElement('p'))
        await Promise.resolve()
      })
      await flush()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('UT-USE_ACTIVE_SECTION-015 hash scroll: no hash -> never called', async () => {
      const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
      const root = setup({ hash: '', children: '<div id="resume" data-section-placeholder></div>' })
      renderHook(() => useHashScroll({ current: root }))
      await act(async () => {
        root.querySelector('#resume').removeAttribute('data-section-placeholder')
        root.querySelector('#resume').dataset.section = 'resume'
        await Promise.resolve()
      })
      await flush()
      expect(spy).not.toHaveBeenCalled()
    })

    it('UT-USE_ACTIVE_SECTION-017 hash scroll: non-existent id -> no throw, never scrolls; unmount disconnects the observer', async () => {
      vi.useFakeTimers()
      const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
      const root = setup({ hash: '#nothere', children: '<div id="resume" data-section-placeholder></div>' })
      let hook
      expect(() => {
        hook = renderHook(() => useHashScroll({ current: root }, { timeoutMs: 1000 }))
      }).not.toThrow()
      await act(async () => {
        root.appendChild(document.createElement('p'))
        await Promise.resolve()
      })
      expect(spy).not.toHaveBeenCalled()
      // observation stops after the timeout
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      expect(disconnect).toHaveBeenCalled()
      hook.unmount()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('UT-USE_ACTIVE_SECTION-018 hash scroll: a keydown disarms the one-shot scroll', async () => {
      const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
      const root = setup({ hash: '#resume', children: '<div id="resume" data-section-placeholder></div>' })
      renderHook(() => useHashScroll({ current: root }))
      window.dispatchEvent(new Event('keydown'))
      const real = document.createElement('section')
      real.id = 'resume'
      real.dataset.section = 'resume'
      await act(async () => {
        root.replaceChild(real, root.querySelector('[data-section-placeholder]'))
        await Promise.resolve()
      })
      await flush()
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
