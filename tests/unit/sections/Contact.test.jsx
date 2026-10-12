import { render } from '@testing-library/react'
import Contact from '../../../src/sections/Contact.jsx'
import { EMAIL, PHONE, PHONE_HREF, URLS } from '../../../src/config/site.js'
import { CONTACT_INTRO } from '../../../src/data/contact.js'
import { sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-CONTACT', () => {
  it('UT-CONTACT-001 section id "contact", centred; label "09 — Contact" (mail); title; intro text', () => {
    const { container } = render(<Contact />)
    const root = sectionFrame(container, {
      id: 'contact', tag: 'section', labelIcon: 'mail', labelText: '09 — Contact', title: "Let's Work Together",
    })
    expect(root).toHaveClass('contact-wrap')
    expect(container.querySelector('.contact-sub').textContent).toBe(CONTACT_INTRO)
  })

  it('UT-CONTACT-002 primary row: .c-email mailto and .c-phone tel with texts and icons', () => {
    const { container } = render(<Contact />)
    const email = container.querySelector('a.c-email')
    expect(email).toHaveAttribute('href', `mailto:${EMAIL}`)
    expect(email.textContent).toBe(`mail${EMAIL}`)
    const phone = container.querySelector('a.c-phone')
    expect(phone).toHaveAttribute('href', PHONE_HREF)
    expect(phone.textContent).toBe(`phone${PHONE}`)
    expect(email.parentElement).toBe(phone.parentElement)
  })

  it('UT-CONTACT-003 social row: .c-li, .c-bh, .c-gh with hrefs, target and rel', () => {
    const { container } = render(<Contact />)
    const want = { 'c-li': URLS.linkedin, 'c-bh': URLS.behance, 'c-gh': URLS.github }
    for (const [cls, href] of Object.entries(want)) {
      const a = container.querySelector(`a.${cls}`)
      expect(a).toHaveAttribute('href', href)
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('UT-CONTACT-004 .contact-loc "Chennai, Tamil Nadu, India" with location_on', () => {
    const { container } = render(<Contact />)
    const loc = container.querySelector('.contact-loc')
    expect(loc.textContent).toBe('location_onChennai, Tamil Nadu, India')
    expect(loc.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
  })
})
