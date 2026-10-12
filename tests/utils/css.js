import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'

/** Cascade order of src/styles/index.css (Sprint 2: 11 files; v1.1 had tokens, base, components, sections). */
export const STYLE_FILES = ['tokens', 'motion', 'base', 'components', 'sections', 'hero', 'cluster', 'intro', 'theme-transition', 'projects', 'media']
export const V11_STYLE_FILES = ['tokens', 'base', 'components', 'sections']

export const readStyle = (name) => readFileSync(resolve(process.cwd(), `src/styles/${name}.css`), 'utf8')
export const readFixture = (name) => readFileSync(resolve(process.cwd(), `tests/fixtures/${name}`), 'utf8')
export const parse = (css) => postcss.parse(css)
export const parseStyle = (name) => parse(readStyle(name))

/** All style files concatenated in cascade (index.css) order. */
export const cascadeCss = () => STYLE_FILES.map(readStyle).join('\n')

const selectorsOf = (rule) => rule.selectors.map((s) => s.replace(/\s+/g, ' ').trim())

/** Declarations of every rule whose selector list contains `selector`, merged in source order. */
export function declsFor(root, selector, { media = null } = {}) {
  const out = {}
  root.walkRules((rule) => {
    if (!selectorsOf(rule).includes(selector)) return
    const parent = rule.parent
    const inMedia = parent && parent.type === 'atrule' && parent.name === 'media' ? parent.params : null
    if (inMedia !== media) return
    rule.walkDecls((d) => {
      out[d.prop] = d.important ? `${d.value} !important` : d.value
    })
  })
  return out
}

/** Every rule (any nesting) whose selector list contains `selector`. */
export function rulesFor(root, selector) {
  const found = []
  root.walkRules((rule) => {
    if (selectorsOf(rule).includes(selector)) found.push(rule)
  })
  return found
}

export const compact = (v) => String(v).replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim()
