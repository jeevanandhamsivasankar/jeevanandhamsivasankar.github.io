import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { triggerIntersection } from '../utils/browserMocks.js'

describe('UT-SMOKE: test infrastructure', () => {
  it('UT-SMOKE-001 renders with RTL and supports jest-dom matchers', () => {
    render(createElement('div', { 'data-testid': 'smoke' }, 'hello'))
    expect(screen.getByTestId('smoke')).toBeInTheDocument()
    expect(screen.getByTestId('smoke')).toHaveTextContent('hello')
  })

  it('UT-SMOKE-002 browser mocks are installed and controllable', () => {
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
    const el = document.createElement('div')
    const cb = vi.fn()
    new IntersectionObserver(cb).observe(el)
    triggerIntersection(el, true)
    expect(cb).toHaveBeenCalledWith([expect.objectContaining({ target: el, isIntersecting: true })], expect.anything())
  })
})
