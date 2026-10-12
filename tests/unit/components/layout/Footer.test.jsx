import { render } from '@testing-library/react'
import Footer from '../../../../src/components/layout/Footer.jsx'
import { FOOTER_TEXT } from '../../../../src/config/site.js'

describe('UNIT-FOOTER', () => {
  it('UT-FOOTER-001 renders footer with FOOTER_TEXT between two developer_board Icons (aria-hidden)', () => {
    const { container } = render(<Footer />)
    const f = container.querySelector('footer')
    expect(f).not.toBeNull()
    const icons = f.querySelectorAll('span')
    expect(icons).toHaveLength(2)
    icons.forEach((i) => {
      expect(i.textContent).toBe('developer_board')
      expect(i).toHaveAttribute('aria-hidden', 'true')
    })
    const nodes = [...f.childNodes]
    expect(nodes[0]).toBe(icons[0])
    expect(nodes[1].textContent).toBe(FOOTER_TEXT)
    expect(nodes[2]).toBe(icons[1])
  })
})
