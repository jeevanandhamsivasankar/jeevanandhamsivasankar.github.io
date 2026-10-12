/**
 * IT-040 DOM class/text parity against the pre-refactor monolith (commit dd9a86d).
 *
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
      fs.writeFileSync(BASELINE_FILE, JSON.stringify(serialise(baselineView.container), null, 1))
      return
    }
    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))
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
