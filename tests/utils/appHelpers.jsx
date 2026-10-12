/* Shared helpers for integration tests (not a test file). */
import { act, render } from '@testing-library/react'
import { vi } from 'vitest'

// Captured at import time so settle() keeps working while fake timers are installed.
const realSetTimeout = globalThis.setTimeout.bind(globalThis)

export const sleepReal = (ms) => new Promise((resolve) => realSetTimeout(resolve, ms))

/** Number of `[data-section]` nodes that are placeholders. */
export const placeholderCount = (root = document) =>
  root.querySelectorAll('[data-section-placeholder]').length

/**
 * Flush React/Suspense until every lazy section has resolved (no placeholder left).
 * Uses only real timers + microtasks, so it works with fake timers installed.
 */
export async function settle({ expected = 10, tries = 400 } = {}) {
  for (let i = 0; i < tries; i += 1) {
    await act(async () => {
      await sleepReal(5)
    })
    if (placeholderCount() === 0 && document.querySelectorAll('[data-section]').length >= expected) return
  }
  throw new Error('settle(): lazy sections did not resolve in time')
}

/** Render a React element and wait for all lazy sections. */
export async function renderAndSettle(element, options) {
  let result
  await act(async () => {
    result = render(element)
  })
  await settle(options)
  return result
}

/** Fake only the timer APIs the app uses; rAF is driven by installManualRaf(). */
export function installFakeTime(iso) {
  vi.useFakeTimers({
    now: new Date(iso),
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  })
}

/**
 * Replace requestAnimationFrame/cancelAnimationFrame with a controllable queue.
 * Returns { flush(n), pending(), requested, cancelled, executed }.
 */
export function installManualRaf() {
  let nextId = 1
  const queue = new Map()
  const state = { requested: 0, cancelled: 0, executed: 0 }
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextId++
    state.requested += 1
    queue.set(id, cb)
    return id
  })
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
    state.cancelled += 1
    queue.delete(id)
  })
  return {
    state,
    pending: () => queue.size,
    flush(n = 1) {
      for (let i = 0; i < n; i += 1) {
        const entries = [...queue.entries()]
        queue.clear()
        if (entries.length === 0) return
        act(() => {
          for (const [, cb] of entries) {
            state.executed += 1
            cb(performance.now())
          }
        })
      }
    },
  }
}

/** Stub offsetTop for elements by their data-section id. Returns a restore fn. */
export function stubOffsetTops(map) {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop')
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get() {
      return Object.hasOwn(map, this.dataset?.section) ? map[this.dataset.section] : 0
    },
  })
  return () => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'offsetTop', original)
    else delete HTMLElement.prototype.offsetTop
  }
}

/** Make window.scrollY writable and set it. */
export function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value })
}

/** Normalise a CSS colour through the DOM so hex and rgb() compare equal. */
export function normColor(c) {
  const el = document.createElement('i')
  el.style.color = c
  return el.style.color
}
