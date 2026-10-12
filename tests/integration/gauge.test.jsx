import { act, render } from '@testing-library/react'
import InstrumentCluster from '../../src/components/widgets/InstrumentCluster.jsx'
import { triggerIntersection } from '../utils/browserMocks.js'
import { installManualRaf } from '../utils/appHelpers.jsx'

// Retargeted in Sprint 2 (US-207): the Speedometer was replaced by the instrument cluster (FR-MOTION-004).
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

describe('instrument cluster visibility gating (ARC-013, ARC-009, ARC-016)', () => {
  it('IT-023 cluster pauses when off-screen or in a hidden tab, and resumes', () => {
    const raf = installManualRaf()
    const { container } = render(<InstrumentCluster />)
    const root = container.querySelector('.cluster')
    expect(raf.state.requested).toBe(0) // not yet reported in view
    act(() => triggerIntersection(root, true))
    raf.flush(5)
    expect(raf.state.executed).toBe(5)

    act(() => triggerIntersection(root, false))
    const requested = raf.state.requested
    raf.flush(5)
    expect(raf.state.requested).toBe(requested)
    expect(raf.pending()).toBe(0)

    act(() => triggerIntersection(root, true))
    expect(raf.pending()).toBe(1) // resumes
    setVisibility('hidden')
    expect(raf.pending()).toBe(0)
    setVisibility('visible')
    expect(raf.pending()).toBe(1)
  })

  it('IT-024 cluster without IntersectionObserver animates but still honours document visibility', () => {
    const savedWin = window.IntersectionObserver
    const savedGlobal = globalThis.IntersectionObserver
    delete window.IntersectionObserver
    delete globalThis.IntersectionObserver
    try {
      const raf = installManualRaf()
      expect(() => render(<InstrumentCluster />)).not.toThrow()
      raf.flush(31)
      expect(raf.state.executed).toBe(31)

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
