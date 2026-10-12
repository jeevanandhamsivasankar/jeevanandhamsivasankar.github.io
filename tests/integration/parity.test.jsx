/**
 * IT-040 DOM class/text parity.
 *
 * Sprint 2 (NFR-MAINT-009 replaces NFR-MAINT-008): the structural snapshot is compared with the
 * Sprint 2 baseline dom.json (generated from the integrated build, pending PO sign-off):
 *   UPDATE_S2_DOM_BASELINE=1 npx vitest run tests/integration/parity.test.jsx
 * In addition every v1.1 text node (dom.v1.1.json, from the pre-refactor monolith dd9a86d) must
 * still exist, except the nodes listed in the PO-approved diff (project descriptions replaced by
 * case-study rows, US-211; sample patient name, US-213).
 *
 * v1.1 baseline generation (historic):
 * The baseline snapshot tests/integration/__baseline__/dom.json is generated once from the
 * baseline App rendered in jsdom (fixed clock, Math.random stubbed, all IO callbacks fired):
 *
 *   git show dd9a86d:src/App.jsx > tests/integration/__baseline__/BaselineApp.jsx
 *   UPDATE_DOM_BASELINE=1 npx vitest run tests/integration/parity.test.jsx
 *   rm tests/integration/__baseline__/BaselineApp.jsx
 */
import fs from 'node:fs'
import path from 'node:path'
import { act, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { triggerAllIntersections } from '../utils/browserMocks.js'
import { installManualRaf, settle, installFakeTime } from '../utils/appHelpers.jsx'

const BASELINE_FILE = path.resolve('tests/integration/__baseline__/dom.json')
const V11_FILE = path.resolve('tests/integration/__baseline__/dom.v1.1.json')
const baselineApps = import.meta.glob('./__baseline__/BaselineApp.jsx')

/** Nodes whose text is time/animation dependent (typewriter, gauge numbers). */
function isDynamic(el) {
  return (
    (el.tagName === 'SPAN' && el.parentElement?.classList.contains('hero-typewriter') && !el.classList.contains('cursor')) ||
    (el.tagName.toLowerCase() === 'text' && !!el.closest('.gauge-widget'))
  )
}

function serialise(root) {
  const out = []
  for (const el of root.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase()
    if (['style', 'script', 'noscript'].includes(tag)) continue
    if (el.closest('style')) continue
    // dev-only placeholder <img> is attached after an async dynamic import (race); the label is what is asserted
    if (tag === 'img' && el.closest('.media-slot__placeholder')) continue
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim()
    out.push({
      tag,
      className: typeof el.className === 'string' ? el.className : (el.getAttribute('class') ?? ''),
      text: isDynamic(el) ? '<dynamic>' : own,
    })
  }
  return out
}

async function prepare() {
  installFakeTime('2026-06-21T06:30:00Z')
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  installManualRaf()
  localStorage.clear()
}

afterEach(() => vi.useRealTimers())

describe('DOM parity (ARC-002, ARC-016, ARC-014)', () => {
  it('IT-040 DOM class/text snapshot vs baseline App', async () => {
    if (process.env.UPDATE_DOM_BASELINE) {
      // generator mode: snapshot the baseline App instead of comparing
      const loaders = Object.values(baselineApps)
      expect(loaders, 'BaselineApp.jsx must be extracted from dd9a86d').toHaveLength(1)
      const { default: Baseline } = await loaders[0]()
      await prepare()
      let baselineView
      await act(async () => {
        baselineView = render(<Baseline />)
      })
      act(() => triggerAllIntersections(true))
      fs.writeFileSync(V11_FILE, JSON.stringify(serialise(baselineView.container), null, 1))
      return
    }
    await prepare()
    let view
    await act(async () => {
      view = render(<App />)
    })
    await settle()
    act(() => triggerAllIntersections(true))

    // allow-listed deltas: skip link (ADR-020); all other additions are attributes, which are not serialised
    const candidateNodes = serialise(view.container)
    const skipIdx = candidateNodes.findIndex((n) => n.tag === 'a' && n.className === 'skip-link')
    expect(skipIdx).toBeGreaterThanOrEqual(0)
    const candidate = candidateNodes.filter((_, i) => i !== skipIdx)

    if (process.env.UPDATE_S2_DOM_BASELINE) {
      fs.writeFileSync(BASELINE_FILE, JSON.stringify(candidate, null, 1))
      return
    }
    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))

    // v1.1 text parity (NFR-MAINT-009): only the PO-approved removals may be missing
    const v11 = JSON.parse(fs.readFileSync(V11_FILE, 'utf8'))
    const texts = new Set(candidate.map((n) => n.text))
    const missing = v11.filter((n) => n.text && !texts.has(n.text) && n.className !== 'project-desc' && n.text !== 'Rajesh Kumar')
    expect(missing, 'v1.1 text nodes missing from Sprint 2 DOM').toEqual([])
    expect(v11.filter((n) => n.className === 'project-desc')).toHaveLength(6)

    const firstDiff = baseline.findIndex((b, i) => JSON.stringify(b) !== JSON.stringify(candidate[i]))
    const context = firstDiff === -1 ? null : {
      index: firstDiff,
      baseline: baseline.slice(firstDiff, firstDiff + 3),
      candidate: candidate.slice(firstDiff, firstDiff + 3),
    }
    expect(context).toBeNull()
    expect(candidate).toHaveLength(baseline.length)
  })
})
