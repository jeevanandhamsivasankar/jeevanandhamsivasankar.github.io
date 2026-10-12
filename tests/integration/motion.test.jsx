import { act, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { HERO_ROLES } from '../../src/data/profile.js'
import { setMatchMedia, triggerIntersection } from '../utils/browserMocks.js'
import { installManualRaf, settle, installFakeTime } from '../utils/appHelpers.jsx'

const REDUCE = '(prefers-reduced-motion: reduce)'
const speedText = () => document.querySelector('.gauge-widget .cl-speed').textContent
const typed = () => document.querySelector('.hero-typewriter span').textContent

async function renderApp() {
  await act(async () => {
    render(<App />)
  })
  await settle()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('reduced motion (ARC-009, ARC-013, ARC-012, ARC-016)', () => {
  it('IT-021 reduced motion disables instrument cluster, typewriter, parallax and cursor glow', async () => {
    setMatchMedia({ [REDUCE]: true })
    installFakeTime('2026-06-21T06:30:00Z')
    const raf = installManualRaf()
    const addSpy = vi.spyOn(window, 'addEventListener')

    await renderApp()
    const gaugeSvg = document.querySelector('.gauge-widget .cluster')
    act(() => triggerIntersection(gaugeSvg, true))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 200 }))

    expect(raf.state.requested).toBe(0)
    const frozen = speedText()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(speedText()).toBe(frozen) // FR-MOTION-007: static final frame, no change over time
    expect(typed()).toBe('Qt / QML Developer')
    expect(addSpy.mock.calls.filter(([type]) => type === 'mousemove')).toHaveLength(0)
    expect(document.querySelector('.profile-card').style.transform).toBe('')
    expect(document.querySelector('.cursor-glow')).toBeNull()
  })

  it('IT-022 switching to reduced motion at runtime stops running motion', async () => {
    installFakeTime('2026-06-21T06:30:00Z')
    const raf = installManualRaf()
    await renderApp()
    const gaugeSvg = document.querySelector('.gauge-widget .cluster')
    act(() => triggerIntersection(gaugeSvg, true))

    let clock = 0
    vi.spyOn(performance, 'now').mockImplementation(() => (clock += 16)) // 16 ms per frame
    const speedBefore = speedText()
    const canBefore = document.querySelector('.gauge-widget .cluster-can pre').textContent
    raf.flush(400)
    expect(raf.state.executed).toBeGreaterThan(0)
    expect(document.querySelector('.gauge-widget .cluster-can pre').textContent).not.toBe(canBefore)
    expect(speedText()).not.toBe(speedBefore)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(typed().length).toBeGreaterThan(0)
    expect(typed()).not.toBe(HERO_ROLES[0])

    const cancelsBefore = raf.state.cancelled
    const requestedBefore = raf.state.requested
    act(() => setMatchMedia({ [REDUCE]: true }))
    expect(raf.state.cancelled).toBeGreaterThan(cancelsBefore)
    raf.flush(5)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(raf.state.requested).toBe(requestedBefore)
    expect(raf.pending()).toBe(0)
    expect(typed()).toBe(HERO_ROLES[0])
    // only the theme re-check and clock intervals remain; every typewriter timeout is cleared
    expect(vi.getTimerCount()).toBe(2)
  })
})
