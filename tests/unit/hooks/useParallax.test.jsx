import { renderHook } from '@testing-library/react'
import { useParallax } from '../../../src/hooks/useParallax.js'

const move = (clientX, clientY) =>
  window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))

function setup(opts) {
  const hook = renderHook(() => useParallax(opts))
  const el = document.createElement('div')
  hook.result.current.current = el
  return { ...hook, el }
}

describe('UNIT-USE_PARALLAX', () => {
  it('UT-USE_PARALLAX-001 returns a ref object', () => {
    const { result } = renderHook(() => useParallax())
    expect(result.current).toHaveProperty('current')
    expect(result.current.current).toBeNull()
  })

  it('UT-USE_PARALLAX-002 clientX = innerWidth -> rotateY(7deg); clientX = 0 -> rotateY(-7deg)', () => {
    const { el } = setup()
    move(window.innerWidth, window.innerHeight / 2)
    expect(el.style.transform).toContain('rotateY(7deg)')
    move(0, window.innerHeight / 2)
    expect(el.style.transform).toContain('rotateY(-7deg)')
  })

  it('UT-USE_PARALLAX-003 centre -> rotateY(0deg) rotateX(0deg)', () => {
    const { el } = setup()
    move(window.innerWidth / 2, window.innerHeight / 2)
    expect(el.style.transform).toContain('rotateY(0deg) rotateX(0deg)')
  })

  it('UT-USE_PARALLAX-004 clientY = 0 -> rotateX(7deg) (sign inversion of y)', () => {
    const { el } = setup()
    move(window.innerWidth / 2, 0)
    expect(el.style.transform).toContain('rotateX(7deg)')
    move(window.innerWidth / 2, window.innerHeight)
    expect(el.style.transform).toContain('rotateX(-7deg)')
  })

  it('UT-USE_PARALLAX-005 exact transform string', () => {
    const { el } = setup()
    move(window.innerWidth, 0)
    expect(el.style.transform).toBe('perspective(900px) rotateY(7deg) rotateX(7deg) translateZ(8px)')
    move(window.innerWidth * 0.75, window.innerHeight * 0.25)
    const x = (0.75 - 0.5) * 14
    const y = (0.25 - 0.5) * 14
    expect(el.style.transform).toBe(`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)`)
  })

  it('UT-USE_PARALLAX-006 passive mousemove listener, removed on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useParallax())
    const call = add.mock.calls.find(([type]) => type === 'mousemove')
    expect(call[2]).toEqual({ passive: true })
    unmount()
    expect(remove).toHaveBeenCalledWith('mousemove', call[1])
  })

  it('UT-USE_PARALLAX-007 enabled: false -> no listener and no transform', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const { el } = setup({ enabled: false })
    expect(add.mock.calls.some(([type]) => type === 'mousemove')).toBe(false)
    move(window.innerWidth, 0)
    expect(el.style.transform).toBe('')
  })

  it('UT-USE_PARALLAX-008 ref.current === null -> handler does not throw', () => {
    renderHook(() => useParallax())
    expect(() => move(10, 10)).not.toThrow()
  })
})
