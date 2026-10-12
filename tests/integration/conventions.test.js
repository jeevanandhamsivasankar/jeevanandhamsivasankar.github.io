import fs from 'node:fs'
import path from 'node:path'

const TESTS = path.resolve('tests')
const catalogue = JSON.parse(fs.readFileSync(path.join(TESTS, 'stp-ids.json'), 'utf8'))

const infraRe = new RegExp(`^(?:${catalogue.infrastructure.join('|')})\\b`)
const LEVELS = [
  { dir: 'unit', re: /^UT-[A-Z0-9_]+-\d{3}\b/ },
  { dir: 'integration', re: /^IT-\d{3}\b/ },
  { dir: 'qualification', re: /^QT-\d{3}\b/ },
]

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '__baseline__' || e.name === '__screenshots__' || e.name === 'node_modules') continue
      walk(p, out)
    } else if (/\.(test|spec)\.(js|jsx)$/.test(e.name)) out.push(p)
  }
  return out
}

/** Static title scan: it/test (optionally .only/.skip/.each/.runIf(...)/.skipIf(...)) with a string literal title. */
const TITLE_RE = /(?<![\w.])(?:it|test|staticTest)(?:\.(?:only|skip|todo|concurrent))?\s*\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g
const GUARDED_RE = /(?<![\w.])(?:it|test)\.(?:runIf|skipIf)\([^)]*\)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g

/** Parametrised titles (each-tables followed by a literal title). */
const EACH_RE = /(?<![\w.])(?:it|test)\.each\([\s\S]*?\)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g

function titlesOf(file) {
  const src = fs.readFileSync(file, 'utf8')
  const out = []
  for (const re of [TITLE_RE, GUARDED_RE, EACH_RE]) for (const m of src.matchAll(re)) out.push(m[2])
  return out
}

describe('test conventions (ARC-019)', () => {
  it('IT-043 test ID conventions and orphan guard', () => {
    const found = [] // { id, title, file, level }
    const badTitles = []
    for (const file of walk(TESTS)) {
      const rel = path.relative(TESTS, file).split(path.sep)
      const level = LEVELS.find((l) => l.dir === rel[0])
      if (!level) continue
      for (const title of titlesOf(file)) {
        const m = title.match(level.re) ?? title.match(infraRe)
        if (!m) {
          badTitles.push(`${rel.join('/')}: "${title}"`)
          continue
        }
        found.push({ id: m[0], file: rel.join('/') })
      }
    }
    expect(found.length).toBeGreaterThan(40)
    expect(badTitles, 'titles must start with an ID matching the folder level').toEqual([])

    // Sprint 2: a story-level ID may label several cases inside ONE file; the same ID in two files is still a duplicate.
    const duplicates = []
    const seen = new Map()
    for (const { id, file } of found) {
      if (seen.has(id) && seen.get(id) !== file) duplicates.push(`${id} (${seen.get(id)} and ${file})`)
      else seen.set(id, file)
    }
    expect(duplicates, 'duplicate IDs').toEqual([])

    const known = new Set([...catalogue.ids, ...catalogue.infrastructure])
    const unknown = [...seen.keys()].filter((id) => !known.has(id))
    expect(unknown, 'implemented IDs missing from the STP catalogue').toEqual([])

    const manual = new Set(catalogue.manual)
    const missing = catalogue.ids.filter((id) => !seen.has(id) && !manual.has(id))
    expect(missing, 'STP IDs without an implemented test').toEqual([])
  })
})
