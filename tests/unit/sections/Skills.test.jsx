import { render } from '@testing-library/react'
import Skills from '../../../src/sections/Skills.jsx'
import { SKILL_CATEGORIES, SAFETY_HIGHLIGHT } from '../../../src/data/skills.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

vi.mock('../../../src/components/tech/SkillChip.jsx', () => ({
  default: ({ skill, catColor }) => <div data-testid="chip" data-cat={catColor} data-name={skill.name} />,
}))

describe('UNIT-SKILLS', () => {
  it('UT-SKILLS-001 section id "skills"; label "03 — Skills" (build); title "Toolbox"', () => {
    const { container } = render(<Skills />)
    sectionFrame(container, {
      id: 'skills', tag: 'section', labelIcon: 'build', labelText: '03 — Skills', title: 'Toolbox',
    })
  })

  it('UT-SKILLS-002 9 .skill-cat; pill colour/border = headerColor, background = headerBg; gradient rule line', () => {
    const { container } = render(<Skills />)
    const cats = container.querySelectorAll('.skill-cat')
    expect(cats).toHaveLength(9)
    cats.forEach((c, i) => {
      const cat = SKILL_CATEGORIES[i]
      const pill = c.querySelector('.cat-badge')
      expect(pill.textContent).toBe(cat.label)
      expect(pill.style.color).toBe(norm('color', cat.headerColor))
      expect(pill.style.borderColor).toBe(norm('borderColor', `${cat.headerColor}44`))
      expect(pill.style.background).toBe(norm('background', cat.headerBg))
      const line = c.querySelector('.cat-line')
      expect(line.style.background).toBe(
        norm('background', `linear-gradient(to right, ${cat.headerColor}55, transparent)`),
      )
      expect(line.style.background).toContain('linear-gradient')
    })
  })

  it('UT-SKILLS-003 SkillChip per skill with catColor = headerColor', () => {
    const { container } = render(<Skills />)
    const cats = container.querySelectorAll('.skill-cat')
    let total = 0
    cats.forEach((c, i) => {
      const chips = c.querySelectorAll('[data-testid="chip"]')
      expect(chips).toHaveLength(SKILL_CATEGORIES[i].skills.length)
      chips.forEach((chip, j) => {
        expect(chip.dataset.cat).toBe(SKILL_CATEGORIES[i].headerColor)
        expect(chip.dataset.name).toBe(SKILL_CATEGORIES[i].skills[j].name)
      })
      total += chips.length
    })
    expect(total).toBe(58)
  })

  it('UT-SKILLS-004 categories have reveal d<i mod 3>', () => {
    const { container } = render(<Skills />)
    ;[...container.querySelectorAll('.skill-cat')].forEach((c, i) => {
      expect(c).toHaveClass('reveal', `d${i % 3}`)
    })
  })

  it('UT-SKILLS-005 ISO strip: title, verified_user icon, description, 5 .iso-chip', () => {
    const { container } = render(<Skills />)
    const strip = container.querySelector('.iso-strip')
    expect(strip).not.toBeNull()
    expect(strip.querySelector('.iso-strip-title').textContent).toContain(SAFETY_HIGHLIGHT.title)
    const icons = [...strip.querySelectorAll('span[aria-hidden="true"]')].map((s) => s.textContent)
    expect(icons).toContain('verified_user')
    expect(strip.querySelector('.iso-strip-desc').textContent).toBe(SAFETY_HIGHLIGHT.desc)
    expect(strip.querySelectorAll('.iso-chip')).toHaveLength(5)
  })
})
