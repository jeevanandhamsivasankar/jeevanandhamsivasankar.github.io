import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const read = (n) => readFileSync(`src/styles/${n}.css`, 'utf8')

/** Collect custom properties: night = :root blocks, day = night + [data-theme="day"] overrides. */
function tokens() {
  const night = {}
  const day = {}
  postcss.parse(read('tokens')).walkRules((r) => {
    const sel = r.selector.replace(/\s+/g, ' ')
    r.walkDecls(/^--/, (d) => {
      if (sel === ':root' || sel === ':root, [data-theme="day"]') {
        if (sel === ':root') night[d.prop] = d.value
      }
      if (sel === '[data-theme="day"]') day[d.prop] = d.value
    })
  })
  return { night, day: { ...night, ...day } }
}

const parseColor = (v) => {
  v = v.trim()
  let m = v.match(/^#([0-9a-f]{6})$/i)
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(1)
  m = v.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const p = m[1].split(',').map(Number)
    return [p[0], p[1], p[2], p[3] ?? 1]
  }
  throw new Error(`bad colour ${v}`)
}
const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1)
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('IT-044 token set and aliases', () => {
  const { night, day } = tokens()
  const required = [
    '--color-bg', '--color-bg-raised', '--color-surface', '--color-surface-2', '--color-text', '--color-text-2',
    '--color-text-3', '--color-accent', '--color-accent-text', '--color-on-accent', '--color-border-control',
    '--color-focus', '--color-focus-halo', '--color-success', '--sig-amber', '--sig-cyan', '--sig-green',
    '--sig-violet', '--sig-rose', '--fs-display', '--fs-body', '--fs-meta', '--space-4', '--radius-md', '--target-min',
  ]
  it('IT-044 defines the v2 semantic tokens for night and day', () => {
    for (const k of required) {
      expect(night[k], k).toBeTruthy()
      expect(day[k], k).toBeTruthy()
    }
    expect(night['--target-min']).toBe('44px')
  })
  it('IT-044 keeps every v1 name as an alias', () => {
    const css = read('tokens')
    for (const k of ['bg', 'bg2', 'surf', 'surf2', 'bdr', 'bdr2', 'text', 'text2', 'muted', 'amber', 'cyan', 'green', 'rose', 'violet', 'mono', 'sans', 'disp', 'glass-bg', 'glass-bdr', 'glass-shine']) {
      expect(css, k).toMatch(new RegExp(`--${k}:\\s*var\\(--`))
    }
  })
  it('IT-044 brand accents are unchanged at night; no raw hex in base/components', () => {
    expect([night['--sig-amber'], night['--sig-cyan'], night['--sig-green'], night['--sig-rose'], night['--sig-violet']])
      .toEqual(['#f59e0b', '#22d3ee', '#34d399', '#fb7185', '#a78bfa'])
    for (const f of ['base', 'components']) expect(read(f).replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('IT-045 contrast matrix both themes', () => {
  const t = tokens()
  const TEXT = [
    ['--color-text', ['--color-bg', '--color-surface', '--color-surface-2']],
    ['--color-text-2', ['--color-bg', '--color-surface', '--color-surface-2']],
    ['--color-text-3', ['--color-bg', '--color-surface', '--color-surface-2']],
    ['--color-accent-text', ['--color-bg']],
    ['--color-success', ['--color-bg']],
    ['--sig-amber', ['--color-bg', '--color-surface-2']],
    ['--sig-cyan', ['--color-bg', '--color-surface-2']],
    ['--sig-green', ['--color-bg', '--color-surface-2']],
    ['--sig-violet', ['--color-bg', '--color-surface-2']],
    ['--sig-rose', ['--color-bg', '--color-surface-2']],
  ]
  const NONTEXT = [['--color-border-control', '--color-bg'], ['--color-focus', '--color-bg']]
  for (const theme of ['night', 'day']) {
    it(`IT-045 text pairs >= 4.5:1 (${theme})`, () => {
      const v = t[theme]
      const page = parseColor(v['--color-bg'])
      for (const [fg, bgs] of TEXT) {
        for (const bg of bgs) {
          const b = over(parseColor(v[bg]), page)
          expect(ratio(over(parseColor(v[fg]), b), b), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      }
      const accent = over(parseColor(v['--color-accent']), page)
      expect(ratio(parseColor(v['--color-on-accent']), accent), 'on-accent').toBeGreaterThanOrEqual(4.5)
    })
    it(`IT-045 control borders and focus ring >= 3:1 (${theme})`, () => {
      const v = t[theme]
      const page = parseColor(v['--color-bg'])
      for (const [fg, bg] of NONTEXT) {
        expect(ratio(over(parseColor(v[fg]), page), parseColor(v[bg])), fg).toBeGreaterThanOrEqual(3)
      }
    })
  }
})

describe('IT-046 motion token definitions', () => {
  it('IT-046 motion.css defines the duration and easing tokens', () => {
    const css = read('motion')
    for (const [k, v] of Object.entries({ instant: '80ms', fast: '140ms', base: '220ms', slow: '360ms', deliberate: '600ms', theme: '360ms', 'intro-max': '1200ms' })) {
      expect(css).toMatch(new RegExp(`--dur-${k}:\\s*${v}`))
    }
    for (const k of ['standard', 'decel', 'accel']) expect(css).toMatch(new RegExp(`--ease-${k}:\\s*cubic-bezier`))
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*--dur-fast:\s*0\.01ms/)
  })
})

describe('IT-047 no raw ms values in transitions/animations', () => {
  // sections.css holds legacy Release 1 rules; Dev-3 removes them in US-210 (BACKLOG R6).
  const FILES = ['base', 'components', 'hero', 'cluster', 'intro', 'theme-transition', 'projects', 'media']
  it('IT-047 only var(--dur-*) is used (infinite keyframe loops exempt)', () => {
    const bad = []
    for (const f of FILES) {
      postcss.parse(read(f)).walkDecls(/^(transition|animation)(-duration|-delay)?$/, (d) => {
        if (d.parent?.parent?.name === 'keyframes') return
        if (/\binfinite\b/.test(d.value)) return
        const stripped = d.value.replace(/var\([^)]*\)/g, '')
        if (/(^|[\s,])\d*\.?\d+m?s\b/.test(stripped)) bad.push(`${f}: ${d.prop}: ${d.value}`)
      })
    }
    expect(bad).toEqual([])
  })
})

describe('IT-048 focus-visible rule', () => {
  it('IT-048 a :focus-visible rule uses --color-focus and outline:none is only on :focus:not(:focus-visible)', () => {
    const root = postcss.parse(read('base'))
    let found = false
    root.walkRules((r) => {
      if (r.selector.includes(':focus-visible') && !r.selector.includes(':not')) {
        r.walkDecls('outline', (d) => { if (d.value.includes('var(--color-focus)')) found = true })
      }
    })
    expect(found).toBe(true)
    for (const f of ['base', 'components']) {
      postcss.parse(read(f)).walkDecls('outline', (d) => {
        if (/^none$|^0$/.test(d.value)) expect(d.parent.selector, f).toMatch(/:focus:not\(:focus-visible\)/)
      })
    }
  })
})
