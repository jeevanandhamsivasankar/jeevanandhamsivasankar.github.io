import { readFileSync } from 'node:fs'
import postcss from 'postcss'

describe('IT-057 theme-transition.css property whitelist', () => {
  const root = postcss.parse(readFileSync('src/styles/theme-transition.css', 'utf8'))
  const ALLOWED = /^(color|background-color|border-color|fill|stroke|outline-color|text-decoration-color|opacity|transform)$/
  it('IT-057 transitions only list colour, opacity and transform properties; keyframes animate opacity/transform only', () => {
    let seen = 0
    root.walkDecls('transition-property', (d) => {
      seen += 1
      d.value.split(',').map((v) => v.trim()).forEach((p) => expect(p).toMatch(ALLOWED))
    })
    expect(seen).toBeGreaterThan(0)
    root.walkAtRules('keyframes', (k) => k.walkDecls((d) => expect(['opacity', 'transform']).toContain(d.prop)))
  })
  it('IT-057 effects are scoped to html.theme-switching and use only var(--dur-*) timing', () => {
    root.walkRules((r) => {
      if (r.parent?.type === 'atrule') return
      if (r.selector.includes('theme-illum') && !r.selector.includes('theme-switching')) return
    })
    root.walkDecls(/^(transition|animation)(-duration)?$/, (d) => {
      if (d.parent.parent?.name === 'keyframes') return
      expect(d.value.replace(/var\([^)]*\)/g, '')).not.toMatch(/\d+m?s\b/)
    })
    const txt = readFileSync('src/styles/theme-transition.css', 'utf8')
    expect(txt).not.toMatch(/(width|height|top|left)\s*:[^;]*;[^}]*transition/)
  })
})
