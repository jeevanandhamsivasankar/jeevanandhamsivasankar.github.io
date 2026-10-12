import { StrictMode } from 'react'
import { renderHook } from '@testing-library/react'
import { useReveal } from '../../../src/hooks/useReveal.js'
import { getIntersectionObservers, triggerIntersection } from '../../utils/browserMocks.js'

function makeRoot(html = '<div class="reveal" id="a"></div><div class="reveal" id="b"></div>') {
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.appendChild(root)
  return root
}

describe('UNIT-USE_REVEAL', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('UT-USE_REVEAL-001 creates one IntersectionObserver with threshold 0.06', () => {
    const root = makeRoot()
    renderHook(() => useReveal({ current: root }))
    const obs = getIntersectionObservers()
    expect(obs).toHaveLength(1)
    expect(obs[0].thresholds).toEqual([0.06])
  })

  it('UT-USE_REVEAL-002 observes all .reveal descendants of the root and none outside it', () => {
    const root = makeRoot()
    const outside = document.createElement('div')
    outside.className = 'reveal'
    document.body.appendChild(outside)
    renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    expect([...obs.elements]).toEqual([...root.querySelectorAll('.reveal')])
    expect(obs.elements.has(outside)).toBe(false)
  })

  it('UT-USE_REVEAL-003 isIntersecting true adds "visible" and unobserves that element', () => {
    const root = makeRoot()
    renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    const a = root.querySelector('#a')
    const b = root.querySelector('#b')
    triggerIntersection(a, true)
    expect(a).toHaveClass('visible')
    expect(obs.elements.has(a)).toBe(false)
    expect(b).not.toHaveClass('visible')
    expect(obs.elements.has(b)).toBe(true)
  })

  it('UT-USE_REVEAL-004 isIntersecting false adds nothing and keeps observing', () => {
    const root = makeRoot()
    renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    const a = root.querySelector('#a')
    triggerIntersection(a, false)
    expect(a).not.toHaveClass('visible')
    expect(obs.elements.has(a)).toBe(true)
  })

  it('UT-USE_REVEAL-005 repeated intersection is idempotent (single visible class)', () => {
    const root = makeRoot()
    renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    const a = root.querySelector('#a')
    obs.callback([{ target: a, isIntersecting: true }, { target: a, isIntersecting: true }], obs)
    obs.callback([{ target: a, isIntersecting: true }], obs)
    expect(a.className.split(/\s+/).filter((c) => c === 'visible')).toHaveLength(1)
  })

  it('UT-USE_REVEAL-006 unmount calls disconnect', () => {
    const root = makeRoot()
    const { unmount } = renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    const spy = vi.spyOn(obs, 'disconnect')
    unmount()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(getIntersectionObservers()).toHaveLength(0)
  })

  it('UT-USE_REVEAL-007 without IntersectionObserver every .reveal gets visible immediately, nothing throws', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const root = makeRoot()
    expect(() => renderHook(() => useReveal({ current: root }))).not.toThrow()
    root.querySelectorAll('.reveal').forEach((el) => expect(el).toHaveClass('visible'))
  })

  it('UT-USE_REVEAL-008 rootRef.current === null -> no observer, no throw', () => {
    expect(() => renderHook(() => useReveal({ current: null }))).not.toThrow()
    expect(getIntersectionObservers()).toHaveLength(0)
  })

  it('UT-USE_REVEAL-009 re-render does not create a new observer', () => {
    const root = makeRoot()
    const ref = { current: root }
    const { rerender } = renderHook(() => useReveal(ref))
    const [first] = getIntersectionObservers()
    rerender()
    rerender()
    const after = getIntersectionObservers()
    expect(after).toHaveLength(1)
    expect(after[0]).toBe(first)
  })

  it('UT-USE_REVEAL-010 StrictMode: first observer disconnected; exactly one live observer', () => {
    const root = makeRoot()
    renderHook(() => useReveal({ current: root }), { wrapper: StrictMode })
    expect(getIntersectionObservers()).toHaveLength(1)
  })

  it('UT-USE_REVEAL-011 nested .reveal observed; elements without .reveal ignored', () => {
    const root = makeRoot(
      '<section class="reveal" id="outer"><div><p class="reveal" id="inner"></p></div></section><div id="plain"></div>',
    )
    renderHook(() => useReveal({ current: root }))
    const [obs] = getIntersectionObservers()
    expect(obs.elements.has(root.querySelector('#outer'))).toBe(true)
    expect(obs.elements.has(root.querySelector('#inner'))).toBe(true)
    expect(obs.elements.has(root.querySelector('#plain'))).toBe(false)
    expect(obs.elements.size).toBe(2)
  })
})
