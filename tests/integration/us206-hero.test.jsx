import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { render } from '@testing-library/react'
import Hero from '../../src/sections/Hero.jsx'
import { PROFILE } from '../../src/data/profile.js'

describe('US-206 hero v2', () => {
  it('IT-053 profile.js text is unchanged (sha256 of v1.1 source)', () => {
    // US-205 (FR-MEDIA-001) intentionally moved photo.src to /img/profile-600.webp; normalise only that value.
    const raw = fs.readFileSync(path.resolve('src/data/profile.js'), 'utf8')
    expect(raw).toContain('src: "/img/profile-600.webp"')
    const src = Buffer.from(raw.replace('src: "/img/profile-600.webp"', 'src: "profile.webp"'))
    expect(crypto.createHash('sha256').update(src).digest('hex')).toBe(
      '244e2ec44741f011c81d3ebc4754905c2ef6a8b60483e8f89ce7a9775eaf7e1f',
    )
  })

  it('IT-053 hero DOM order is name, role, summary, CTAs, status; CTA labels unchanged', () => {
    const { container } = render(<Hero />)
    const order = ['.hero-name', '.hero-typewriter', '.hero-bio', '.hero-cta', '.hero-status']
    const els = order.map((s) => container.querySelector(s))
    els.forEach((e, i) => {
      expect(e, order[i]).not.toBeNull()
      if (i) expect(els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
    const ctas = [...container.querySelectorAll('.hero-cta a')]
    const labels = ctas.map((a) => [...a.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim())
    expect(labels).toEqual(['View Projects', 'Get In Touch', 'Resume'])
    expect(ctas[0].getAttribute('href')).toBe('#projects')
    expect(ctas[1].getAttribute('href')).toBe('#contact')
    expect(container.querySelectorAll('.hero-cta .btn-primary')).toHaveLength(1)
    expect(container.querySelectorAll('.hero-cta .btn-secondary')).toHaveLength(1)
    expect(container.querySelector('.hero-status').textContent).toBe(PROFILE.status)
  })
})
