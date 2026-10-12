import { StrictMode } from 'react'
import { act, render } from '@testing-library/react'
import Speedometer from '../../../../src/components/widgets/Speedometer.jsx'
import {
  GAUGE,
  arcPath,
  gaugeFrame,
  needlePoint,
  rpmAngle,
  rpmAt,
  speedAngle,
  speedAt,
} from '../../../../src/lib/gauge.js'
import { installManualRaf } from '../../../utils/manualRaf.js'

const state = vi.hoisted(() => ({ inView: false, reduced: false }))
vi.mock('../../../../src/hooks/useInView.js', () => ({ useInView: () => state.inView }))
vi.mock('../../../../src/hooks/usePrefersReducedMotion.js', () => ({
  usePrefersReducedMotion: () => state.reduced,
}))

const DT = 0.006
let raf

beforeEach(() => {
  state.inView = false
  state.reduced = false
  raf = installManualRaf()
})
afterEach(() => raf.restore())

const texts = (c) => [...c.querySelectorAll('text')].map((t) => t.textContent)
const needle = (c) => c.querySelector('line[filter="url(#softGlow)"]')
const needleX = (c) => Number(needle(c).getAttribute('x2'))
const ticks = (c) => [...c.querySelectorAll('line:not([stroke^="url"])')]
const frames = (n) => act(() => raf.flush(n))

describe('UNIT-SPEEDOMETER', () => {
  it('UT-SPEEDOMETER-001 speedAt(0) === 88; rpmAt(0) is about 4309.7', () => {
    expect(speedAt(0)).toBe(88)
    expect(rpmAt(0)).toBeCloseTo(4309.7, 0)
    expect(Math.abs(rpmAt(0) - 4309.7)).toBeLessThan(0.1)
  })

  it('UT-SPEEDOMETER-002 speedAt/rpmAt(0.006) match the formulas', () => {
    const t = 0.006
    expect(speedAt(t)).toBeCloseTo(Math.sin(t * 0.5) * 45 + 88 + Math.sin(t * 1.4) * 22, 10)
    expect(rpmAt(t)).toBeCloseTo(Math.sin(t * 0.7 + 1) * 1200 + 2800 + Math.cos(t * 1.1) * 500, 8)
    expect(speedAt(t)).toBeCloseTo(88.3196, 3)
    expect(rpmAt(t)).toBeCloseTo(4312.3, 0)
  })

  it('UT-SPEEDOMETER-003 angle mapping and clamping', () => {
    expect(speedAngle(0)).toBe(-215)
    expect(speedAngle(180)).toBe(35)
    expect(speedAngle(90)).toBe(-90)
    expect(speedAngle(200)).toBe(35)
    expect(rpmAngle(9000)).toBe(rpmAngle(8000))
    expect(rpmAngle(8000)).toBe(35)
  })

  it('UT-SPEEDOMETER-004 arcPath large-arc flag: 1 above 180 deg sweep, 0 at exactly 180 and below', () => {
    const flag = (d) => d.split(' ')[5] // M x y A r r rot LARGE sweep x y
    expect(arcPath(130, 130, 100, -215, 35).split(' ')[7]).toBe('1')
    expect(arcPath(130, 130, 100, -215, -35).split(' ')[7]).toBe('0') // exactly 180
    expect(arcPath(130, 130, 100, -215, -34.99).split(' ')[7]).toBe('1')
    expect(arcPath(130, 130, 100, -215, -100).split(' ')[7]).toBe('0')
    expect(flag).toBeTypeOf('function')
  })

  it('UT-SPEEDOMETER-005 arcPath(130,130,100,-215,35) start/end coordinates', () => {
    const d = arcPath(130, 130, 100, -215, 35)
    const m = d.match(/^M (\S+) (\S+) A 100 100 0 1 1 (\S+) (\S+)$/)
    expect(m).not.toBeNull()
    const [sx, sy, ex, ey] = m.slice(1).map(Number)
    expect(sx).toBeCloseTo(130 + 100 * Math.cos((-215 * Math.PI) / 180), 6)
    expect(sy).toBeCloseTo(130 + 100 * Math.sin((-215 * Math.PI) / 180), 6)
    expect(sx).toBeCloseTo(48.085, 2)
    expect(sy).toBeCloseTo(187.357, 2)
    expect(ex).toBeCloseTo(211.915, 2)
    expect(ey).toBeCloseTo(187.357, 2)
  })

  it('UT-SPEEDOMETER-006 19 ticks; 0,3,..,18 are major (7) length 18 width 2; others length 10', () => {
    const { container } = render(<Speedometer />)
    const t = ticks(container)
    expect(t).toHaveLength(19)
    let majors = 0
    t.forEach((l, i) => {
      const len = Math.hypot(
        l.getAttribute('x2') - l.getAttribute('x1'),
        l.getAttribute('y2') - l.getAttribute('y1'),
      )
      if (i % 3 === 0) {
        majors += 1
        expect(len).toBeCloseTo(18, 6)
        expect(l.getAttribute('stroke-width')).toBe('2')
      } else {
        expect(len).toBeCloseTo(10, 6)
        expect(l.getAttribute('stroke-width')).toBe('1')
      }
    })
    expect(majors).toBe(7)
  })

  it('UT-SPEEDOMETER-007 needle length 84; endpoint at speed 0 is about (61.19, 178.18)', () => {
    expect(GAUGE.needleLen).toBe(84)
    const p = needlePoint(speedAngle(0))
    expect(p.x).toBeCloseTo(61.19, 2)
    expect(p.y).toBeCloseTo(178.18, 2)
    const { container } = render(<Speedometer />)
    const n = needle(container)
    expect(Math.hypot(n.getAttribute('x2') - 130, n.getAttribute('y2') - 130)).toBeCloseTo(84, 6)
  })

  it('UT-SPEEDOMETER-008 render: viewBox, texts, gradient stops', () => {
    const { container } = render(<Speedometer />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 260 260')
    const tx = texts(container)
    expect(tx).toEqual(['88', 'km/h', 'HMI CLUSTER DEMO', `${Math.round(rpmAt(0))} RPM`])
    const stops = (id) => [...container.querySelectorAll(`#${id} stop`)].map((s) => s.getAttribute('stop-color'))
    expect(stops('arcGrad')).toEqual(['#34d399', '#22d3ee'])
    expect(stops('rpmGrad')).toEqual(['#f59e0b', '#fb7185'])
  })

  it('UT-SPEEDOMETER-009 SVG ids each present once', () => {
    const { container } = render(<Speedometer />)
    for (const id of ['gbg', 'arcGrad', 'rpmGrad', 'needleGrad', 'glow', 'softGlow']) {
      expect(container.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
    }
  })

  it('UT-SPEEDOMETER-010 svg has role="img" and aria-label', () => {
    const { container } = render(<Speedometer />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'HMI cluster demo gauge')
  })

  it('UT-SPEEDOMETER-011 in view: each frame advances t by 0.006', () => {
    state.inView = true
    const { container } = render(<Speedometer />)
    expect(raf.request).toHaveBeenCalledTimes(1)
    frames(1)
    const { speed, rpm } = gaugeFrame(DT)
    expect(needleX(container)).toBeCloseTo(needlePoint(speedAngle(speed)).x, 8)
    expect(texts(container)[3]).toBe(`${Math.round(rpm)} RPM`)
    expect(texts(container)[0]).toBe(String(Math.round(speed)))
    // second frame advances again
    frames(1)
    expect(needleX(container)).toBeCloseTo(needlePoint(speedAngle(gaugeFrame(2 * DT).speed)).x, 8)
  })

  it('UT-SPEEDOMETER-012 unmount calls cancelAnimationFrame with the pending id', () => {
    state.inView = true
    const { unmount } = render(<Speedometer />)
    frames(2)
    const [pendingId] = raf.pending()
    expect(pendingId).toBeDefined()
    unmount()
    expect(raf.cancel).toHaveBeenCalledWith(pendingId)
  })

  it('UT-SPEEDOMETER-013 reduced motion: no rAF; static t=0 frame', () => {
    state.inView = true
    state.reduced = true
    const { container } = render(<Speedometer />)
    expect(raf.request).not.toHaveBeenCalled()
    expect(texts(container)[0]).toBe('88')
    expect(texts(container)[3]).toBe(`${Math.round(rpmAt(0))} RPM`)
  })

  it('UT-SPEEDOMETER-014 useInView false at mount: no rAF scheduled, no re-render', () => {
    const { container } = render(<Speedometer />)
    const before = container.innerHTML
    expect(raf.request).not.toHaveBeenCalled()
    frames(3)
    expect(container.innerHTML).toBe(before)
  })

  it('UT-SPEEDOMETER-015 false to true schedules exactly one rAF; true to false cancels, no more frames', () => {
    const { rerender, container } = render(<Speedometer />)
    expect(raf.request).not.toHaveBeenCalled()
    state.inView = true
    rerender(<Speedometer />)
    expect(raf.request).toHaveBeenCalledTimes(1)
    frames(1)
    const [pending] = raf.pending()
    state.inView = false
    rerender(<Speedometer />)
    expect(raf.cancel).toHaveBeenCalledWith(pending)
    const html = container.innerHTML
    const calls = raf.request.mock.calls.length
    frames(3)
    expect(raf.request.mock.calls.length).toBe(calls)
    expect(container.innerHTML).toBe(html)
  })

  it('UT-SPEEDOMETER-016 resume after pause continues from tRef', () => {
    state.inView = true
    const { rerender, container } = render(<Speedometer />)
    frames(100)
    state.inView = false
    rerender(<Speedometer />)
    state.inView = true
    rerender(<Speedometer />)
    frames(1)
    let t = 0
    for (let i = 0; i < 101; i += 1) t += DT
    const expected = needlePoint(speedAngle(speedAt(t))).x
    expect(needleX(container)).toBeCloseTo(expected, 8)
    expect(needleX(container)).not.toBeCloseTo(needlePoint(speedAngle(speedAt(DT))).x, 3)
  })

  it('UT-SPEEDOMETER-017 StrictMode: one active loop', () => {
    state.inView = true
    const { container } = render(
      <StrictMode>
        <Speedometer />
      </StrictMode>,
    )
    expect(raf.pending()).toHaveLength(1)
    frames(1)
    expect(raf.pending()).toHaveLength(1)
    expect(needleX(container)).toBeCloseTo(needlePoint(speedAngle(speedAt(DT))).x, 8)
  })
})
