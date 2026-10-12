// Regenerates tests/stp-ids.json from docs/STP.md (IT-043 orphan guard).
// Usage: node tests/utils/gen-stp-ids.mjs
import fs from 'node:fs'

const stp = fs.readFileSync('docs/STP.md', 'utf8')
const ids = new Set()
for (const m of stp.matchAll(/^### ((?:IT|QT)-\d{3})\b/gm)) ids.add(m[1])
for (const m of stp.matchAll(/^\| (UT-[A-Z0-9_]+-\d{3}) \|/gm)) ids.add(m[1])

const prev = JSON.parse(fs.readFileSync('tests/stp-ids.json', 'utf8'))
const out = {
  _comment: prev._comment,
  ids: [...ids].sort(),
  manual: prev.manual,
  infrastructure: prev.infrastructure,
}
fs.writeFileSync('tests/stp-ids.json', `${JSON.stringify(out, null, 1)}\n`)
console.log(`${out.ids.length} ids`)
