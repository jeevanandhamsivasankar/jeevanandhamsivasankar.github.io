import { CONTACT_LINKS, CONTACT_INTRO } from '../../../src/data/contact.js'

describe('UNIT-DATA_CONTACT', () => {
  it('UT-DATA_CONTACT-001 5 links in order with exact hrefs and labels', () => {
    expect(CONTACT_LINKS.map((l) => [l.kind, l.label, l.href])).toEqual([
      ['email', 'jeevanandhamsivashankaran@gmail.com', 'mailto:jeevanandhamsivashankaran@gmail.com'],
      ['phone', '+91 8111010315', 'tel:+918111010315'],
      ['linkedin', 'LinkedIn', 'https://linkedin.com/in/jeevanandhamsivashankaran/'],
      ['behance', 'Behance Portfolio', 'https://behance.net/s_jeevanandham'],
      ['github', 'GitHub', 'https://github.com/jeevanandhamsivasankar'],
    ])
  })

  it('UT-DATA_CONTACT-002 email and phone are primary; the other 3 are social', () => {
    expect(CONTACT_LINKS.map((l) => l.group)).toEqual(['primary', 'primary', 'social', 'social', 'social'])
  })

  it('UT-DATA_CONTACT-003 external is true exactly for the 3 social links', () => {
    expect(CONTACT_LINKS.map((l) => l.external)).toEqual([false, false, true, true, true])
  })

  it('UT-DATA_CONTACT-004 icons are mail, phone, open_in_new, brush, terminal', () => {
    expect(CONTACT_LINKS.map((l) => l.icon)).toEqual(['mail', 'phone', 'open_in_new', 'brush', 'terminal'])
  })

  it('UT-DATA_CONTACT-005 CONTACT_INTRO is byte-identical to the baseline', () => {
    expect(CONTACT_INTRO).toBe(
      'Open to senior HMI engineering roles, embedded UI consulting, and collaborative automotive or medical device projects. Based in Chennai, India.',
    )
  })
})
