import { beginThemeTransition, cancelThemeTransition, SWITCHING_CLASS } from '../../../src/lib/illumination.js'

/** Fake WAAPI on <html>: each animate() returns a handle whose finish() resolves .finished. */
function installAnimate(root) {
  const made = []
  root.animate = vi.fn((kf, opts) => {
    let resolve
    let reject
    const finished = new Promise((res, rej) => { resolve = res; reject = rej })
    const a = { opts, finished, finish: () => resolve(), cancel: vi.fn(() => reject(new Error('cancel'))) }
    made.push(a)
    return a
  })
  return made
}

describe('UNIT-ILLUMINATION class lifecycle', () => {
  const root = document.documentElement
  let made
  beforeEach(() => { cancelThemeTransition(root); made = installAnimate(root) })
  afterEach(() => { cancelThemeTransition(root); delete root.animate })

  it('UT-ILLUM-001 adds the transient class for --dur-theme and removes it on completion', async () => {
    expect(beginThemeTransition(root)).toBe(true)
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(true)
    expect(made[0].opts.duration).toBeGreaterThanOrEqual(360)
    made[0].finish()
    await Promise.resolve()
    await Promise.resolve()
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false)
  })
  it('UT-ILLUM-002 rapid double toggle restarts the lifecycle; stale completion cannot strip the new class; none stuck', async () => {
    beginThemeTransition(root)
    beginThemeTransition(root)
    expect(made[0].cancel).toHaveBeenCalled()
    await Promise.resolve()
    await Promise.resolve()
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(true)
    made[1].finish()
    await Promise.resolve()
    await Promise.resolve()
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false)
  })
  it('UT-ILLUM-003 reduced motion (or no WAAPI) never adds the class', () => {
    expect(beginThemeTransition(root, { reduced: true })).toBe(false)
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false)
    delete root.animate
    expect(beginThemeTransition(root)).toBe(false)
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false)
  })
})
