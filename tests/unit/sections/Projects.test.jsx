import { fireEvent, render } from '@testing-library/react'
import Projects from '../../../src/sections/Projects.jsx'
import { PROJECTS } from '../../../src/data/projects.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-PROJECTS', () => {
  it('UT-PROJECTS-001 section id "projects", background var(--bg2); label "04 — Engineering Projects"; title "Selected Work"', () => {
    const { container } = render(<Projects />)
    const root = sectionFrame(container, {
      id: 'projects', tag: 'section', labelIcon: 'rocket_launch', labelText: '04 — Engineering Projects', title: 'Selected Work',
    })
    expect(root.style.background).toBe('var(--bg2)')
  })

  it('UT-PROJECTS-002 6 .project-card with wide per data, period, tile, number, domain, title, desc, tags', () => {
    const { container } = render(<Projects />)
    const cards = container.querySelectorAll('.project-card')
    expect(cards).toHaveLength(6)
    cards.forEach((c, i) => {
      const p = PROJECTS[i]
      expect(c.classList.contains('wide')).toBe(Boolean(p.wide))
      expect(c.querySelector('.project-period').textContent).toBe(p.period)
      const pico = c.querySelector('.pico')
      expect(pico.style.background).toBe(norm('background', p.bg))
      expect(pico.style.border).toBe(norm('border', `1px solid ${p.border}`))
      expect(pico.querySelector('span').textContent).toBe(p.icon)
      expect(c.querySelector('.project-num').textContent).toBe(p.num)
      expect(c.style.getPropertyValue('--pc')).toBe(p.color) // US-211: colour via --pc token, not inline
      expect(c.querySelector('.project-domain').textContent).toBe(p.domain)
      expect(c.querySelector('.project-title').textContent).toBe(p.title)
      if (p.caseStudy) {
        // US-211 / FR-UX-005: case-study rows replace the plain description; omitted rows are absent
        expect(c.querySelector('.project-desc')).toBeNull()
        const rows = [...c.querySelectorAll('.cs-row')]
        expect(rows.length).toBeGreaterThan(0)
        rows.forEach((r) => {
          const key = [...r.classList].find((k) => k.startsWith('cs-') && k !== 'cs-row').slice(3)
          expect(r.querySelector('dd').textContent).toBe(p.caseStudy[key])
        })
      } else {
        expect(c.querySelector('.project-desc').textContent).toBe(p.desc)
      }
      const tags = [...c.querySelectorAll('.ptag2')]
      expect(tags.map((t) => t.textContent)).toEqual([...p.tags])
      tags.forEach((t) => {
        expect(t.style.background).toBe(norm('background', p.bg))
        expect(t.style.borderColor).toBe(norm('borderColor', p.border))
      })
    })
  })

  it('UT-PROJECTS-003 cards have reveal d<i mod 2> ("wide" before the stagger class)', () => {
    const { container } = render(<Projects />)
    ;[...container.querySelectorAll('.project-card')].forEach((c, i) => {
      expect(c).toHaveClass('reveal', `d${i % 2}`)
      const expected = `project-card reveal${PROJECTS[i].wide ? ' wide' : ''} d${i % 2}`
      expect(c.className).toBe(expected)
    })
  })

  it('UT-PROJECTS-004 hover sets inline border-color ${color}99 and activates the top line; leave restores border', () => {
    const { container } = render(<Projects />)
    const card = container.querySelector('.project-card')
    const p = PROJECTS[0]
    expect(card.style.borderColor).toBe(norm('borderColor', p.border))
    fireEvent.mouseOver(card)
    expect(card.style.borderColor).toBe(norm('borderColor', `${p.color}99`))
    // top line (.project-card-line) is present with its gradient; its hover state is CSS-driven
    const line = card.querySelector('.project-card-line')
    expect(line).not.toBeNull()
    expect(line.style.background).toBe(norm('background', p.line))
    fireEvent.mouseOut(card)
    expect(card.style.borderColor).toBe(norm('borderColor', p.border))
  })
})
