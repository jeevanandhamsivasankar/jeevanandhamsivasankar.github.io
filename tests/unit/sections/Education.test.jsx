import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import Education from '../../../src/sections/Education.jsx'
import { EDUCATION } from '../../../src/data/education.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

const h = vi.hoisted(() => ({ override: null }))
vi.mock('../../../src/data/education.js', async (importActual) => {
  const actual = await importActual()
  return {
    get EDUCATION() {
      return h.override ?? actual.EDUCATION
    },
  }
})
afterEach(() => {
  h.override = null
})

describe('UNIT-EDUCATION', () => {
  it('UT-EDUCATION-001 section id "education"; label "06 — Education" (school); title "Academic Background"', () => {
    const { container } = render(<Education />)
    sectionFrame(container, {
      id: 'education', tag: 'section', labelIcon: 'school', labelText: '06 — Education', title: 'Academic Background',
    })
  })

  it('UT-EDUCATION-002 degree card renders .edu-tag chips for tagVariant "edu"', () => {
    const { container } = render(<Education />)
    const card = container.querySelectorAll('.edu-card')[0]
    expect(card.querySelector('.edu-degree').textContent).toBe(EDUCATION[0].title)
    expect(card.querySelector('.edu-school').textContent).toBe(EDUCATION[0].subtitle)
    const tags = [...card.querySelectorAll('.edu-tag')]
    expect(tags.map((t) => t.textContent)).toEqual([...EDUCATION[0].tags])
  })

  it('UT-EDUCATION-003 domain card renders amber inline-styled chips; icon colour #f59e0b', () => {
    const { container } = render(<Education />)
    const card = container.querySelectorAll('.edu-card')[1]
    expect(card.querySelectorAll('.edu-tag')).toHaveLength(0)
    const chips = [...card.querySelectorAll('.edu-row span')]
    expect(chips).toHaveLength(5)
    chips.forEach((c) => {
      expect(c.style.color).toBe('var(--amber)')
      expect(c.style.background).toBe(norm('background', 'rgba(245,158,11,0.08)'))
    })
    expect(card.querySelector('.edu-icon span').style.color).toBe(norm('color', '#f59e0b'))
  })

  it('UT-EDUCATION-004 renders from mocked data; source has no degree/school literals', () => {
    h.override = [
      { title: 'ZZ Degree Title', subtitle: 'ZZ School', icon: 'school', iconColor: '#112233', tags: ['T1', 'T2'], tagVariant: 'edu' },
      { title: 'ZZ Domain', subtitle: 'ZZ Sub', icon: 'military_tech', iconColor: '#f59e0b', tags: ['D1'], tagVariant: 'domain' },
    ]
    const { container } = render(<Education />)
    expect(container.textContent).toContain('ZZ Degree Title')
    expect(container.textContent).toContain('ZZ School')
    expect(container.textContent).toContain('T2')
    expect(container.textContent).toContain('D1')
    expect(container.querySelectorAll('.edu-card')).toHaveLength(2)
    const src = readFileSync(resolve(process.cwd(), 'src/sections/Education.jsx'), 'utf8')
    for (const lit of ['Adhiparasakthi', 'Anna University', 'Electronics', 'CGPA', 'B.E.', 'Key Domain Expertise', '2015']) {
      expect(src).not.toContain(lit)
    }
  })
})
