import { act, render } from '@testing-library/react'
import CursorGlow from '../../../../src/components/effects/CursorGlow.jsx'
import { setMatchMedia } from '../../../utils/browserMocks.js'
import { installManualRaf } from '../../../utils/manualRaf.js'

const move = (x, y) => window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }))
let raf

beforeEach(() => {
  raf = installManualRaf()
})
afterEach(() => raf.restore())

describe('UNIT-CURSOR_GLOW', () => {
  it('UT-CURSOR_GLOW-001 .cursor-glow with aria-hidden; initial left/top -500px', () => {
    const { container } = render(<CursorGlow />)
    const el = container.firstChild
    expect(el).toHaveClass('cursor-glow')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.style.left).toBe('-500px')
    expect(el.style.top).toBe('-500px')
  })

  it('UT-CURSOR_GLOW-002 mousemove (400, 300) gives left 400px / top 300px after rAF flush', () => {
    const { container } = render(<CursorGlow />)
    act(() => {
      move(400, 300)
      raf.flush()
    })
    expect(container.firstChild.style.left).toBe('400px')
    expect(container.firstChild.style.top).toBe('300px')
  })

  it('UT-CURSOR_GLOW-003 several moves in one frame produce one style write (rAF coalescing)', () => {
    const { container } = render(<CursorGlow />)
    const el = container.firstChild
    let writes = 0
    for (const prop of ['left', 'top']) {
      let v = el.style[prop]
      Object.defineProperty(el.style, prop, {
        configurable: true,
        get: () => v,
        set: (x) => {
          if (prop === 'left') writes += 1
          v = x
        },
      })
    }
    act(() => {
      move(10, 10)
      move(20, 20)
      move(30, 30)
      raf.flush()
    })
    expect(writes).toBe(1)
    expect(el.style.left).toBe('30px')
  })

  it('UT-CURSOR_GLOW-004 passive listener; removed and pending rAF cancelled on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<CursorGlow />)
    const call = add.mock.calls.find(([type]) => type === 'mousemove')
    expect(call).toBeDefined()
    expect(call[2]).toEqual(expect.objectContaining({ passive: true }))
    const handler = call[1]
    act(() => move(5, 5)) // leaves a pending rAF
    unmount()
    expect(remove).toHaveBeenCalledWith('mousemove', handler)
    expect(raf.cancel).toHaveBeenCalled()
    expect(raf.pending()).toEqual([])
  })

  it('UT-CURSOR_GLOW-005 reduced motion renders nothing and adds no mousemove listener', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const add = vi.spyOn(window, 'addEventListener')
    const { container } = render(<CursorGlow />)
    expect(container).toBeEmptyDOMElement()
    expect(add.mock.calls.some(([type]) => type === 'mousemove')).toBe(false)
  })
})
