import { render } from '@testing-library/react'
import Design from '../../src/sections/Design.jsx'
import { DESIGN_CARDS } from '../../src/data/design.js'

const NAME_RE = /Rajesh|Kumar|Jeevanandham|Sivasankar/i

describe('IT-063 design art is decorative and anonymous', () => {
  it('IT-063 each card art wrapper is aria-hidden; art SVG text carries no personal names', () => {
    const { container } = render(<Design />)
    const bgs = container.querySelectorAll('.behance-card-bg')
    expect(bgs).toHaveLength(DESIGN_CARDS.length)
    bgs.forEach((bg) => {
      expect(bg).toHaveAttribute('aria-hidden', 'true')
      expect(bg.querySelector('svg')).not.toBeNull()
      expect(bg.textContent).not.toMatch(NAME_RE)
    })
  })
})
