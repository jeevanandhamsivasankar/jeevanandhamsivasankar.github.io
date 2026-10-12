// Regenerates tests/fixtures/baseline-css-s2.txt: the Sprint 2 approved CSS baseline (NFR-MAINT-009),
// i.e. src/styles/*.css concatenated in index.css @import order. Re-run only for a PO-approved style change.
// Usage: node tests/utils/gen-css-baseline.mjs
import fs from 'node:fs'

const index = fs.readFileSync('src/styles/index.css', 'utf8')
const files = [...index.matchAll(/@import\s+["']\.\/([^"']+)["']/g)].map((m) => m[1])
fs.writeFileSync('tests/fixtures/baseline-css-s2.txt', files.map((f) => fs.readFileSync(`src/styles/${f}`, 'utf8')).join('\n'))
console.log(files.join(', '))
