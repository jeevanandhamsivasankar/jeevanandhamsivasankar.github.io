import { act, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { HERO_ROLES } from '../../src/data/profile.js'
import { gaugeFrame } from '../../src/lib/gauge.js'
import { setMatchMedia, triggerIntersection } from '../utils/browserMocks.js'
import { installManualRaf, settle, useFakeTime } from '../utils/appHelpers.jsx'

const REDUCE = '(prefers-reduced-motion: reduce)'
const speedText = () => document.querySelector('.gauge-widget svg text').textContent
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
  it('IT-021 reduced motion disables speedometer, typewriter, parallax and cursor glow', async () => {
    setMatchMedia({ [REDUCE]: true })
    useFakeTime('2026-06-21T06:30:00Z')
    const raf = installManualRaf()
    const addSpy = vi.spyOn(window, 'addEventListener')

    await renderApp()
    const gaugeSvg = document.querySelector('.gauge-widget svg')
    act(() => triggerIntersection(gaugeSvg, true))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 200 }))

    expect(raf.state.requested).toBe(0)
    expect(speedText()).toBe(String(Math.round(gaugeFrame(0).speed)))
    expect(typed()).toBe('Qt / QML Developer')
    expect(addSpy.mock.calls.filter(([type]) => type === 'mousemove')).toHaveLength(0)
    expect(document.querySelector('.profile-card').style.transform).toBe('')
    expect(document.querySelector('.cursor-glow')).toBeNull()
  })

  it('IT-022 switching to reduced motion at runtime stops running motion', async () => {
    useFakeTime('2026-06-21T06:30:00Z')
    const raf = installManualRaf()
    await renderApp()
    const gaugeSvg = document.querySelector('.gauge-widget svg')
    act(() => triggerIntersection(gaugeSvg, true))

    const speedBefore = speedText()
    raf.flush(100)
    expect(raf.state.executed).toBeGreaterThan(0)
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
