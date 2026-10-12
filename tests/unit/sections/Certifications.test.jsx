import { render } from '@testing-library/react'
import Certifications from '../../../src/sections/Certifications.jsx'
import { CERTIFICATIONS } from '../../../src/data/certifications.js'
import { sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-CERTIFICATIONS', () => {
  it('UT-CERTIFICATIONS-001 root id "certifications" full band; label "07 — Certifications" (verified); title "Credentials"', () => {
    const { container } = render(<Certifications />)
    const root = sectionFrame(container, {
      id: 'certifications', tag: 'div', labelIcon: 'verified', labelText: '07 — Certifications', title: 'Credentials',
    })
    expect(root).toHaveClass('full-band')
  })

  it('UT-CERTIFICATIONS-002 3 .cert-card with icon, name, org', () => {
    const { container } = render(<Certifications />)
    const cards = container.querySelectorAll('.cert-card')
    expect(cards).toHaveLength(3)
    cards.forEach((c, i) => {
      expect(c.querySelector('.cert-ico span').textContent).toBe(CERTIFICATIONS[i].icon)
      expect(c.querySelector('.cert-name').textContent).toBe(CERTIFICATIONS[i].name)
      expect(c.querySelector('.cert-org').textContent).toBe(CERTIFICATIONS[i].org)
    })
  })

  it('UT-CERTIFICATIONS-003 cards have reveal d<i>', () => {
    const { container } = render(<Certifications />)
    ;[...container.querySelectorAll('.cert-card')].forEach((c, i) => {
      expect(c).toHaveClass('reveal', `d${i}`)
    })
  })
})
