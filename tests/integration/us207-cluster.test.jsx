import fs from 'node:fs'
import path from 'node:path'
import { act, render } from '@testing-library/react'
import InstrumentCluster from '../../src/components/widgets/InstrumentCluster.jsx'
import { triggerIntersection, setMatchMedia } from '../utils/browserMocks.js'

const walk = (dir, out = []) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) walk(p, out)
    else if (/\.(jsx?|css)$/.test(f.name)) out.push(p)
  }
  return out
}

describe('US-207 instrument cluster', () => {
  let raf
  beforeEach(() => {
    raf = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
  })
  const setHidden = (hidden) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
  }
  afterEach(() => setHidden(false))

  it('IT-054 role=img with aria-label, labels present, and Speedometer is no longer imported', () => {
    const { container } = render(<InstrumentCluster />)
    const root = container.querySelector('.cluster')
    expect(root.getAttribute('role')).toBe('img')
    expect(root.getAttribute('aria-label')).toMatch(/simulated/i)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.textContent).toContain('HMI CLUSTER DEMO')
    expect(container.textContent).toContain('SIMULATED')
    const offenders = walk(path.resolve('src')).filter((f) => /Speedometer/.test(fs.readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
    expect(fs.existsSync(path.resolve('src/components/widgets/Speedometer.jsx'))).toBe(false)
  })

  it('IT-054 animation writes to refs/attributes, not React state', () => {
    const src = fs.readFileSync(path.resolve('src/components/widgets/InstrumentCluster.jsx'), 'utf8')
    expect(src).not.toMatch(/useState/)
    expect(src).toMatch(/setAttribute/)
  })

  it('IT-055 no rAF while off-screen; loop starts in view; stops when tab hidden and resumes', () => {
    const { container } = render(<InstrumentCluster />)
    const root = container.querySelector('.cluster')
    expect(raf).not.toHaveBeenCalled() // observer has not reported intersection
    act(() => triggerIntersection(root, true))
    expect(raf).toHaveBeenCalled()
    raf.mockClear()
    act(() => triggerIntersection(root, false))
    setHidden(true)
    act(() => triggerIntersection(root, true))
    expect(raf).not.toHaveBeenCalled() // in view but tab hidden
    setHidden(false)
    expect(raf).toHaveBeenCalled()
  })

  it('IT-055 reduced motion never schedules rAF and renders a static frame', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { container } = render(<InstrumentCluster />)
    act(() => triggerIntersection(container.querySelector(".cluster"), true))
    expect(raf).not.toHaveBeenCalled()
    expect(container.querySelector('pre').textContent.split('\n').length).toBe(6)
    expect(Number(container.querySelector('.cl-speed').textContent)).toBeGreaterThan(0)
  })
})
