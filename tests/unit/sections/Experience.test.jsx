import { render } from '@testing-library/react'
import Experience from '../../../src/sections/Experience.jsx'
import { EXPERIENCE } from '../../../src/data/experience.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-EXPERIENCE', () => {
  it('UT-EXPERIENCE-001 root #experience.exp-band.full-band[data-section]; label "02 — Experience" (work); title "Career"', () => {
    const { container } = render(<Experience />)
    const root = sectionFrame(container, {
      id: 'experience', tag: 'div', labelIcon: 'work', labelText: '02 — Experience', title: 'Career',
    })
    expect(root).toHaveClass('exp-band', 'full-band')
  })

  it('UT-EXPERIENCE-002 4 .exp-item with dot, amber icon tile, role, company, period, location, desc', () => {
    const { container } = render(<Experience />)
    const items = container.querySelectorAll('.exp-item')
    expect(items).toHaveLength(4)
    items.forEach((it, i) => {
      const e = EXPERIENCE[i]
      expect(it.querySelector('.exp-dot')).not.toBeNull()
      const icon = it.querySelector('.exp-icon span')
      expect(icon.textContent).toBe(e.icon)
      expect(icon.style.color).toBe(norm('color', '#f59e0b'))
      expect(it.querySelector('.exp-role').textContent).toBe(e.role)
      expect(it.querySelector('.exp-company-name').textContent).toBe(e.company)
      expect(it.querySelector('.exp-period').textContent).toBe(e.period)
      expect(it.querySelector('.exp-company-loc').textContent).toBe(e.location)
      expect(it.querySelector('.exp-desc').textContent).toBe(e.desc)
    })
  })

  it('UT-EXPERIENCE-003 items have reveal d<min(i,3)>', () => {
    const { container } = render(<Experience />)
    ;[...container.querySelectorAll('.exp-item')].forEach((it, i) => {
      expect(it).toHaveClass('reveal', `d${Math.min(i, 3)}`)
    })
  })
})
