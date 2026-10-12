import { StrictMode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { useInView } from '../../../src/hooks/useInView.js'
import { getIntersectionObservers, triggerIntersection } from '../../utils/browserMocks.js'

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

function setup(opts) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const ref = { current: el }
  const hook = renderHook(() => useInView(ref, opts))
  return { ...hook, el, ref }
}

describe('UNIT-USE_IN_VIEW', () => {
  afterEach(() => {
    delete document.visibilityState
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('UT-USE_IN_VIEW-001 observes the ref element with one IntersectionObserver (threshold 0)', () => {
    const { el } = setup()
    const obs = getIntersectionObservers()
    expect(obs).toHaveLength(1)
    expect(obs[0].thresholds).toEqual([0])
    expect([...obs[0].elements]).toEqual([el])
  })

  it('UT-USE_IN_VIEW-002 returns true after an intersecting entry with visibilityState visible', () => {
    const { result, el } = setup()
    act(() => triggerIntersection(el, true))
    expect(result.current).toBe(true)
  })

  it('UT-USE_IN_VIEW-003 returns false after a non-intersecting entry', () => {
    const { result, el } = setup()
    act(() => triggerIntersection(el, true))
    act(() => triggerIntersection(el, false))
    expect(result.current).toBe(false)
  })

  it('UT-USE_IN_VIEW-004 false while the document is hidden even if intersecting; true again when visible', () => {
    const { result, el } = setup()
    act(() => triggerIntersection(el, true))
    expect(result.current).toBe(true)
    setVisibility('hidden')
    expect(result.current).toBe(false)
    setVisibility('visible')
    expect(result.current).toBe(true)
  })

  it('UT-USE_IN_VIEW-005 trackDocumentVisibility: false ignores document visibility', () => {
    const { result, el } = setup({ trackDocumentVisibility: false })
    act(() => triggerIntersection(el, true))
    setVisibility('hidden')
    expect(result.current).toBe(true)
  })

  it('UT-USE_IN_VIEW-006 no IntersectionObserver -> true (still false while the document is hidden)', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { result } = setup()
    expect(result.current).toBe(true)
    setVisibility('hidden')
    expect(result.current).toBe(false)
  })

  it('UT-USE_IN_VIEW-007 initial value before the first IO callback is false', () => {
    const { result } = setup()
    expect(result.current).toBe(false)
  })

  it('UT-USE_IN_VIEW-008 unmount disconnects the observer and removes the visibilitychange listener', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const { unmount } = setup()
    const handler = add.mock.calls.find(([t]) => t === 'visibilitychange')[1]
    unmount()
    expect(getIntersectionObservers()).toHaveLength(0)
    expect(remove).toHaveBeenCalledWith('visibilitychange', handler)
  })

  it('UT-USE_IN_VIEW-009 ref.current === null -> no observer, no throw', () => {
    expect(() => renderHook(() => useInView({ current: null }))).not.toThrow()
    expect(getIntersectionObservers()).toHaveLength(0)
  })

  it('UT-USE_IN_VIEW-010 StrictMode: exactly one live observer and one listener', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const el = document.createElement('div')
    renderHook(() => useInView({ current: el }), { wrapper: StrictMode })
    expect(getIntersectionObservers()).toHaveLength(1)
    const adds = add.mock.calls.filter(([t]) => t === 'visibilitychange').length
    const removes = remove.mock.calls.filter(([t]) => t === 'visibilitychange').length
    expect(adds - removes).toBe(1)
  })
})
