import { Profiler } from 'react'
import { act, render, screen } from '@testing-library/react'
import Speedometer from '../../src/components/widgets/Speedometer.jsx'
import Hero from '../../src/sections/Hero.jsx'
import { GAUGE, gaugeFrame } from '../../src/lib/gauge.js'
import { triggerIntersection } from '../utils/browserMocks.js'
import { installManualRaf } from '../utils/appHelpers.jsx'

let visibility = 'visible'
function setVisibility(state) {
  visibility = state
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

beforeEach(() => {
  visibility = 'visible'
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
})
afterEach(() => {
  delete document.visibilityState
})

const speedOf = (svg) => svg.querySelector('text').textContent

describe('speedometer visibility gating (ARC-013, ARC-009, ARC-016)', () => {
  it('IT-023 speedometer pauses when hidden, off-screen or in a hidden tab, and resumes from t', () => {
    const raf = installManualRaf()
    let renders = 0
    render(
      <Profiler id="gauge" onRender={() => { renders += 1 }}>
        <Speedometer />
      </Profiler>,
    )
    const svg = screen.getByRole('img', { name: /HMI cluster/i })
    expect(raf.state.requested).toBe(0) // not in view yet

    act(() => triggerIntersection(svg, true))
    raf.flush(31) // ~500 ms of frames
    const s1 = speedOf(svg)
    expect(s1).not.toBe('')
    const framesRun = raf.state.executed
    expect(framesRun).toBe(31)

    // off-screen
    const cancels0 = raf.state.cancelled
    act(() => triggerIntersection(svg, false))
    expect(raf.state.cancelled).toBeGreaterThan(cancels0)
    let requested = raf.state.requested
    let rendersNow = renders
    raf.flush(125) // ~2 s
    expect(raf.state.requested).toBe(requested)
    expect(renders).toBe(rendersNow)

    // visible again, then hidden tab
    act(() => triggerIntersection(svg, true))
    raf.flush(3)
    const framesAfterResume = raf.state.executed
    const cancels1 = raf.state.cancelled
    setVisibility('hidden')
    expect(raf.state.cancelled).toBeGreaterThan(cancels1)
    requested = raf.state.requested
    rendersNow = renders
    raf.flush(125)
    expect(raf.state.requested).toBe(requested)
    expect(renders).toBe(rendersNow)
    expect(raf.state.executed).toBe(framesAfterResume)

    // back to visible: continues from t_prev
    setVisibility('visible')
    let t = 0
    for (let i = 0; i < framesAfterResume; i += 1) t += GAUGE.dt
    t += GAUGE.dt
    raf.flush(1)
    expect(speedOf(svg)).toBe(String(Math.round(gaugeFrame(t).speed)))
    // t restarted from 0 would give a different value
    let tFresh = 0
    tFresh += GAUGE.dt
    expect(String(Math.round(gaugeFrame(tFresh).speed))).not.toBe(String(Math.round(gaugeFrame(t).speed)))
  })

  it('IT-024 gauge without IntersectionObserver animates but still honours document visibility', () => {
    const savedWin = window.IntersectionObserver
    const savedGlobal = globalThis.IntersectionObserver
    delete window.IntersectionObserver
    delete globalThis.IntersectionObserver
    try {
      const raf = installManualRaf()
      expect(() => render(<Hero />)).not.toThrow()
      raf.flush(31)
      expect(raf.state.executed).toBe(31) // baseline behaviour: frames run while visible

      const cancels = raf.state.cancelled
      setVisibility('hidden')
      expect(raf.state.cancelled).toBeGreaterThan(cancels)
      const requested = raf.state.requested
      raf.flush(62)
      expect(raf.state.requested).toBe(requested)
      expect(raf.pending()).toBe(0)
    } finally {
      window.IntersectionObserver = savedWin
      globalThis.IntersectionObserver = savedGlobal
    }
  })
})
