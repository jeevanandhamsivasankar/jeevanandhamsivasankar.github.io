import { fireEvent, render } from '@testing-library/react'
import About from '../../../src/sections/About.jsx'
import { STATS } from '../../../src/data/profile.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-ABOUT', () => {
  it('UT-ABOUT-001 section id/data-section "about"; label "01 — About" (person); title "Who I Am"', () => {
    const { container } = render(<About />)
    const root = sectionFrame(container, {
      id: 'about', tag: 'section', labelIcon: 'person', labelText: '01 — About', title: 'Who I Am',
    })
    expect(root).toHaveClass('section-wrap')
  })

  it('UT-ABOUT-002 4 paragraphs; 5 .hl spans in order', () => {
    const { container } = render(<About />)
    expect(container.querySelectorAll('.about-text p')).toHaveLength(4)
    const hl = [...container.querySelectorAll('.about-text .hl')].map((n) => n.textContent)
    expect(hl).toEqual([
      'Senior Software Engineer',
      'automotive and medical device industries',
      'Qt/QML and Embedded C++',
      'engineering rigour and UX design sensibility',
      'A-SPICE aligned development',
    ])
  })

  it('UT-ABOUT-003 4 .stat-card with num/label and .stat-num inline colour', () => {
    const { container } = render(<About />)
    const cards = container.querySelectorAll('.stat-card')
    expect(cards).toHaveLength(4)
    cards.forEach((c, i) => {
      expect(c.querySelector('.stat-num').textContent).toBe(STATS[i].num)
      expect(c.querySelector('.stat-label').textContent).toBe(STATS[i].label)
      expect(c.querySelector('.stat-num').style.color).toBe(norm('color', STATS[i].color))
    })
  })

  it('UT-ABOUT-004 stat cards have reveal d0..d3', () => {
    const { container } = render(<About />)
    const cards = [...container.querySelectorAll('.stat-card')]
    cards.forEach((c, i) => {
      expect(c).toHaveClass('reveal', `d${i}`)
    })
  })

  it('UT-ABOUT-005 hover sets border ${color}66 and shadow ${color}22; leave restores', () => {
    const { container } = render(<About />)
    const card = container.querySelector('.stat-card')
    const color = STATS[0].color
    fireEvent.mouseOver(card)
    expect(card.style.borderColor).toBe(norm('borderColor', `${color}66`))
    expect(card.style.boxShadow).toBe(`0 16px 48px ${color}22, inset 0 1px 0 var(--glass-shine)`)
    fireEvent.mouseOut(card)
    expect(card.style.borderColor).toBe('')
    expect(card.style.boxShadow).toBe('')
  })
})
