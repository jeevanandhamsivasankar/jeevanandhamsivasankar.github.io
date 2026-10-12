import { StrictMode } from 'react'
import { act, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { getIntersectionObservers, triggerIntersection } from '../utils/browserMocks.js'
import { installManualRaf, settle } from '../utils/appHelpers.jsx'

// React registers 'selectionchange' on the document once per root and never removes it.
const IGNORED_EVENTS = new Set(['selectionchange'])

function trackListeners(target, name, live) {
  const origAdd = target.addEventListener
  const origRemove = target.removeEventListener
  const captureOf = (opts) => (typeof opts === 'boolean' ? opts : Boolean(opts?.capture))
  const find = (type, fn, opts) =>
    live.findIndex((e) => e.target === name && e.type === type && e.fn === fn && e.capture === captureOf(opts))
  vi.spyOn(target, 'addEventListener').mockImplementation((type, fn, opts) => {
    if (!IGNORED_EVENTS.has(type) && fn && find(type, fn, opts) === -1) {
      live.push({ target: name, type, fn, capture: captureOf(opts) })
    }
    return origAdd.call(target, type, fn, opts)
  })
  vi.spyOn(target, 'removeEventListener').mockImplementation((type, fn, opts) => {
    const i = find(type, fn, opts)
    if (i !== -1) live.splice(i, 1)
    return origRemove.call(target, type, fn, opts)
  })
}

describe('StrictMode resource hygiene (ARC-001, ARC-002, ARC-008, ARC-009)', () => {
  it('IT-037 StrictMode double effects leave exactly one of each resource', async () => {
    const intervals = new Set()
    const realSet = globalThis.setInterval
    const realClear = globalThis.clearInterval
    vi.spyOn(globalThis, 'setInterval').mockImplementation((...args) => {
      const id = realSet(...args)
      intervals.add(id)
      return id
    })
    vi.spyOn(globalThis, 'clearInterval').mockImplementation((id) => {
      intervals.delete(id)
      return realClear(id)
    })
    const live = []
    trackListeners(window, 'window', live)
    trackListeners(document, 'document', live)
    const raf = installManualRaf()

    let view
    await act(async () => {
      view = render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    })
    await settle()

    const gauge = document.querySelector('.gauge-widget .cluster')
    act(() => triggerIntersection(gauge, true))
    raf.flush(3)
    expect(raf.pending()).toBe(1)

    const count = (target, type) => live.filter((e) => e.target === target && e.type === type).length
    expect(intervals.size).toBe(2) // theme re-check + clock
    const sectionsWithReveal = [...document.querySelectorAll('[data-section]')].filter((s) => s.querySelector('.reveal'))
    expect(getIntersectionObservers()).toHaveLength(sectionsWithReveal.length + 1)
    expect(count('window', 'scroll')).toBe(2) // useActiveSection + useScrolled
    expect(count('document', 'visibilitychange')).toBe(1) // useInView
    expect(count('window', 'mousemove')).toBe(2) // parallax + cursor glow
    expect(count('window', 'hashchange')).toBe(1)

    view.unmount()
    expect(intervals.size).toBe(0)
    expect(getIntersectionObservers()).toHaveLength(0)
    expect(live.map((e) => `${e.target}:${e.type}`)).toEqual([])
    expect(raf.pending()).toBe(0)
  })
})
