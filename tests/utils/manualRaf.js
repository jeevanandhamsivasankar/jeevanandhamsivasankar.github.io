/**
 * Deterministic requestAnimationFrame / cancelAnimationFrame for unit tests.
 *   const raf = installManualRaf()
 *   raf.flush()        // run the callbacks queued so far (one frame)
 *   raf.restore()
 * `raf.request` / `raf.cancel` are vi spies, `raf.pending()` the queued ids.
 */
export function installManualRaf() {
  const orig = {
    gReq: globalThis.requestAnimationFrame,
    gCan: globalThis.cancelAnimationFrame,
    wReq: window.requestAnimationFrame,
    wCan: window.cancelAnimationFrame,
  }
  let nextId = 1
  const queue = new Map()
  const request = vi.fn((cb) => {
    const id = nextId++
    queue.set(id, cb)
    return id
  })
  const cancel = vi.fn((id) => {
    queue.delete(id)
  })
  globalThis.requestAnimationFrame = request
  globalThis.cancelAnimationFrame = cancel
  window.requestAnimationFrame = request
  window.cancelAnimationFrame = cancel
  return {
    request,
    cancel,
    pending: () => [...queue.keys()],
    flush(frames = 1) {
      for (let i = 0; i < frames; i += 1) {
        const batch = [...queue.entries()]
        queue.clear()
        batch.forEach(([, cb]) => cb(performance.now()))
      }
    },
    restore() {
      globalThis.requestAnimationFrame = orig.gReq
      globalThis.cancelAnimationFrame = orig.gCan
      window.requestAnimationFrame = orig.wReq
      window.cancelAnimationFrame = orig.wCan
    },
  }
}
