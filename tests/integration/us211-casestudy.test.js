import { PROJECTS } from '../../src/data/projects.js'

const SRC = (p) => `${p.desc} ${p.domain} ${p.tags.join(' ')} ${p.period} ${p.title}`.toLowerCase()
const tokens = (t) => t.match(/[A-Za-z0-9][A-Za-z0-9./+_-]*/g) ?? []

describe('IT-059/060 case-study sourcing', () => {
  it('IT-059 every caseStudy statement: no digit and no capitalised word absent from that project text', () => {
    for (const p of PROJECTS) {
      const src = SRC(p)
      for (const [row, text] of Object.entries(p.caseStudy)) {
        text.split(/(?<=[.!?])\s+/).forEach((sentence) => {
          tokens(sentence).forEach((tok, i) => {
            const hasDigit = /\d/.test(tok)
            const proper = /^[A-Z]/.test(tok) && i > 0
            if (hasDigit || proper) {
              expect(src, `${p.num}.${row}: "${tok}"`).toContain(tok.toLowerCase().replace(/[.,]$/, ''))
            }
          })
        })
      }
    }
  })

  it('IT-060 NDA project 5 has no OEM name, logo or screenshot in data', () => {
    const p = PROJECTS.find((x) => x.num === 'PROJECT_05')
    expect(p.nda).toBe(true)
    const all = JSON.stringify(p)
    expect(all).not.toMatch(/\.(png|jpe?g|webp|avif|svg)/i)
    expect(all).toContain('leading two-wheeler OEM')
    expect(PROJECTS.filter((x) => x.nda).map((x) => x.num)).toEqual(['PROJECT_05'])
  })
})
