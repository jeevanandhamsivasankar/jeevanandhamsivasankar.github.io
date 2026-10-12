import { act, render } from '@testing-library/react'
import About from '../../src/sections/About.jsx'
import Certifications from '../../src/sections/Certifications.jsx'
import Contact from '../../src/sections/Contact.jsx'
import Design from '../../src/sections/Design.jsx'
import Experience from '../../src/sections/Experience.jsx'
import Projects from '../../src/sections/Projects.jsx'
import Footer from '../../src/components/layout/Footer.jsx'
import { EMAIL, FOOTER_TEXT, PHONE_HREF, URLS } from '../../src/config/site.js'
import { CERTIFICATIONS } from '../../src/data/certifications.js'
import { DESIGN_CARDS } from '../../src/data/design.js'
import { EXPERIENCE } from '../../src/data/experience.js'
import { STATS } from '../../src/data/profile.js'
import { PROJECTS } from '../../src/data/projects.js'
import { normColor } from '../utils/appHelpers.jsx'

describe('education is data-driven (ARC-016, ARC-006)', () => {
  afterEach(() => {
    vi.doUnmock('../../src/data/education.js')
    vi.resetModules()
  })

  it('IT-033 education renders substituted data (data-driven)', async () => {
    vi.doMock('../../src/data/education.js', () => ({
      EDUCATION: [
        { title: 'Test Degree', subtitle: 'Test School One', icon: 'school', iconColor: '#22d3ee', tags: ['X'], tagVariant: 'edu' },
        { title: 'Test Expertise', subtitle: 'Test School Two', icon: 'military_tech', iconColor: '#f59e0b', tags: ['Y', 'Z'], tagVariant: 'domain' },
      ],
    }))
    vi.resetModules()
    const { default: Education } = await import('../../src/sections/Education.jsx')
    const { container } = render(<Education />)
    const cards = container.querySelectorAll('.edu-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].querySelector('.edu-degree')).toHaveTextContent('Test Degree')
    expect(cards[1].querySelector('.edu-degree')).toHaveTextContent('Test Expertise')
    expect(cards[0].querySelector('.edu-tag')).toHaveTextContent('X')
    const text = container.textContent
    for (const literal of ['Adhiparasakthi', 'Key Domain Expertise', 'CGPA', 'Automotive HMI', 'B.E.']) {
      expect(text).not.toContain(literal)
    }
  })
})

describe('container sections render data modules in data order (ARC-016, ARC-006, ARC-010)', () => {
  it('IT-034 container sections render their data modules in data order', async () => {
    const exp = render(<Experience />)
    expect([...exp.container.querySelectorAll('.exp-item')].map((e) => e.querySelector('.exp-role').textContent))
      .toEqual(EXPERIENCE.map((e) => e.role))
    expect([...exp.container.querySelectorAll('.exp-item')].map((e) => e.querySelector('.exp-period').textContent))
      .toEqual(EXPERIENCE.map((e) => e.period))
    exp.unmount()

    const proj = render(<Projects />)
    const cards = [...proj.container.querySelectorAll('.project-card')]
    expect(cards.map((c) => c.querySelector('.project-title').textContent)).toEqual(PROJECTS.map((p) => p.title))
    expect(cards.map((c) => c.classList.contains('wide'))).toEqual(PROJECTS.map((p) => p.wide))
    expect(cards).toHaveLength(6)
    proj.unmount()

    const des = render(<Design />)
    const dcards = [...des.container.querySelectorAll('.behance-card')]
    expect(dcards.map((c) => c.querySelector('.bc-title').textContent)).toEqual(DESIGN_CARDS.map((c) => c.title))
    expect(dcards).toHaveLength(5)
    for (const c of dcards) expect(c.querySelector('.behance-card-bg svg'), c.textContent).not.toBeNull()
    des.unmount()

    const cert = render(<Certifications />)
    expect([...cert.container.querySelectorAll('.cert-name')].map((e) => e.textContent)).toEqual(CERTIFICATIONS.map((c) => c.name))
    cert.unmount()

    const contact = render(<Contact />)
    const groups = contact.container.querySelectorAll('.contact-links')
    expect(groups).toHaveLength(2)
    expect(groups[0].querySelectorAll('a')).toHaveLength(2)
    expect(groups[1].querySelectorAll('a')).toHaveLength(3)
    contact.unmount()

    const about = render(<About />)
    const stats = [...about.container.querySelectorAll('.stat-card')]
    expect(stats).toHaveLength(4)
    stats.forEach((card, i) => {
      expect(card.querySelector('.stat-num')).toHaveTextContent(STATS[i].num)
      expect(card.querySelector('.stat-num').style.color).toBe(normColor(STATS[i].color))
      expect(card.querySelector('.stat-label')).toHaveTextContent(STATS[i].label)
    })
    await act(async () => {})
  })

  it('IT-035 site configuration consumed by Footer and Contact', () => {
    const footer = render(<Footer />)
    const clone = footer.container.querySelector('footer').cloneNode(true)
    clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
    expect(clone.textContent.trim()).toBe(FOOTER_TEXT)
    footer.unmount()

    const { container } = render(<Contact />)
    const hrefs = [...container.querySelectorAll('.contact-item')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual([`mailto:${EMAIL}`, PHONE_HREF, URLS.linkedin, URLS.behance, URLS.github])
  })
})
