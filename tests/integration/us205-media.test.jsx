import fs from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import Hero from '../../src/sections/Hero.jsx'

const html = fs.readFileSync(path.resolve('index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')

describe('US-205 markup contract', () => {
  it('IT-051 hero profile is <picture> with AVIF+WebP 300/450/600/900 and WebP img fallback', () => {
    const { container } = render(<Hero />)
    const pic = container.querySelector('picture')
    expect(pic).not.toBeNull()
    const [avif, webp] = [...pic.querySelectorAll('source')]
    for (const [s, ext, type] of [[avif, 'avif', 'image/avif'], [webp, 'webp', 'image/webp']]) {
      expect(s.getAttribute('type')).toBe(type)
      for (const w of [300, 450, 600, 900]) expect(s.getAttribute('srcset')).toContain(`/img/profile-${w}.${ext} ${w}w`)
      expect(s.getAttribute('sizes')).toBe('(max-width: 900px) 1px, 220px')
    }
    const img = pic.querySelector('img')
    expect(img.getAttribute('alt')).toBe('S. Jeevanandham')
    expect(img.getAttribute('width')).toBe('600')
    expect(img.getAttribute('height')).toBe('900')
    expect(img.getAttribute('decoding')).toBe('async')
    expect(img.getAttribute('src')).toBe('/img/profile-600.webp')
  })

  it('IT-051 index.html declares OG card, twitter large card, icons and manifest', () => {
    const m = (k, v) => doc.querySelector(`meta[${k}="${v}"]`)?.getAttribute('content')
    expect(m('property', 'og:image')).toMatch(/\/og-card\.jpg$/)
    expect(m('property', 'og:image:width')).toBe('1200')
    expect(m('property', 'og:image:height')).toBe('630')
    expect(m('property', 'og:image:type')).toBe('image/jpeg')
    expect(m('property', 'og:image:alt')).toBeTruthy()
    expect(m('name', 'twitter:card')).toBe('summary_large_image')
    expect(m('name', 'twitter:image')).toMatch(/\/og-card\.jpg$/)
    const link = (sel) => doc.querySelector(`link${sel}`)
    expect(link('[rel="icon"][href="/favicon.svg"]')).not.toBeNull()
    expect(link('[rel="icon"][href="/favicon.ico"]')).not.toBeNull()
    expect(link('[rel="icon"][sizes="32x32"]')).not.toBeNull()
    expect(link('[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')).not.toBeNull()
    expect(link('[rel="manifest"][href="/site.webmanifest"]')).not.toBeNull()
    expect(link('[rel="preload"][as="image"]')?.getAttribute('media')).toBe('(min-width: 901px)')
  })

  it('IT-051 every referenced public file exists and manifest icons are declared', () => {
    const files = ['og-card.jpg', 'favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'site.webmanifest']
    for (const f of files) expect(fs.existsSync(path.resolve('public', f)), f).toBe(true)
    for (const w of [300, 450, 600, 900]) for (const e of ['avif', 'webp']) expect(fs.existsSync(path.resolve(`public/img/profile-${w}.${e}`))).toBe(true)
    const man = JSON.parse(fs.readFileSync(path.resolve('public/site.webmanifest'), 'utf8'))
    expect(man.icons.map((i) => i.sizes)).toEqual(['192x192', '512x512', '512x512'])
  })

  it('IT-052 favicon.svg has no <text> and no font reference', () => {
    const svg = fs.readFileSync(path.resolve('public/favicon.svg'), 'utf8')
    expect(svg).not.toMatch(/<text/i)
    expect(svg).not.toMatch(/font-family/i)
  })
})
