/**
 * Controllable browser API polyfills for jsdom.
 *
 * jsdom lacks IntersectionObserver, ResizeObserver, matchMedia and a real
 * scrollTo. tests/setup.js installs these mocks before each test; tests use
 * the exported helpers to drive them, e.g.
 *
 *   import { triggerIntersection, setMatchMedia } from '../utils/browserMocks'
 *   triggerIntersection(element, true)
 *   setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
 */

/* ---------------- IntersectionObserver ---------------- */

const intersectionObservers = new Set()

export class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback
    this.options = options
    this.root = options.root ?? null
    this.rootMargin = options.rootMargin ?? '0px'
    this.thresholds = [].concat(options.threshold ?? 0)
    this.elements = new Set()
    intersectionObservers.add(this)
  }
  observe(el) {
    this.elements.add(el)
  }
  unobserve(el) {
    this.elements.delete(el)
  }
  disconnect() {
    this.elements.clear()
    intersectionObservers.delete(this)
  }
  takeRecords() {
    return []
  }
}

function makeEntry(target, isIntersecting, extra = {}) {
  const rect = target.getBoundingClientRect()
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: rect,
    intersectionRect: isIntersecting ? rect : new DOMRectReadOnly(),
    rootBounds: null,
    time: Date.now(),
    ...extra,
  }
}

/** All live (not disconnected) observers. */
export function getIntersectionObservers() {
  return [...intersectionObservers]
}

/** Fire an intersection change for `target` on every observer watching it. */
export function triggerIntersection(target, isIntersecting = true, extra = {}) {
  for (const obs of [...intersectionObservers]) {
    if (obs.elements.has(target)) {
      obs.callback([makeEntry(target, isIntersecting, extra)], obs)
    }
  }
}

/** Fire an intersection change for every observed element. */
export function triggerAllIntersections(isIntersecting = true, extra = {}) {
  for (const obs of [...intersectionObservers]) {
    const entries = [...obs.elements].map((el) => makeEntry(el, isIntersecting, extra))
    if (entries.length) obs.callback(entries, obs)
  }
}

/* ---------------- ResizeObserver ---------------- */

const resizeObservers = new Set()

export class MockResizeObserver {
  constructor(callback) {
    this.callback = callback
    this.elements = new Set()
    resizeObservers.add(this)
  }
  observe(el) {
    this.elements.add(el)
  }
  unobserve(el) {
    this.elements.delete(el)
  }
  disconnect() {
    this.elements.clear()
    resizeObservers.delete(this)
  }
}

/** Fire a resize for `target` (or all observed elements when omitted). */
export function triggerResize(target, contentRect = {}) {
  for (const obs of [...resizeObservers]) {
    const targets = target ? [target].filter((t) => obs.elements.has(t)) : [...obs.elements]
    if (targets.length) {
      obs.callback(
        targets.map((t) => ({ target: t, contentRect: { width: 0, height: 0, ...contentRect } })),
        obs,
      )
    }
  }
}

/* ---------------- matchMedia ---------------- */

let mediaMatches = {}
const mediaQueryLists = new Set()

function createMediaQueryList(query) {
  const listeners = new Set()
  const mql = {
    media: query,
    get matches() {
      return Boolean(mediaMatches[query])
    },
    onchange: null,
    addEventListener: (type, fn) => type === 'change' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'change' && listeners.delete(fn),
    addListener: (fn) => listeners.add(fn), // deprecated API
    removeListener: (fn) => listeners.delete(fn),
    dispatchEvent: () => true,
    _notify() {
      const event = { matches: mql.matches, media: query }
      listeners.forEach((fn) => fn(event))
      if (typeof mql.onchange === 'function') mql.onchange(event)
    },
  }
  mediaQueryLists.add(mql)
  return mql
}

export function mockMatchMedia(query) {
  return createMediaQueryList(query)
}

/**
 * Set which media queries match, e.g. { '(prefers-reduced-motion: reduce)': true }.
 * Existing MediaQueryLists whose result changes get a 'change' event.
 */
export function setMatchMedia(matches = {}) {
  const before = new Map([...mediaQueryLists].map((m) => [m, m.matches]))
  mediaMatches = { ...matches }
  for (const [mql, was] of before) if (mql.matches !== was) mql._notify()
}

/* ---------------- install / reset ---------------- */

export function installBrowserMocks() {
  window.IntersectionObserver = MockIntersectionObserver
  globalThis.IntersectionObserver = MockIntersectionObserver
  window.ResizeObserver = MockResizeObserver
  globalThis.ResizeObserver = MockResizeObserver
  window.matchMedia = mockMatchMedia
  window.scrollTo = () => {}
  Element.prototype.scrollTo = function () {}
  Element.prototype.scrollIntoView = function () {}
  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)
    window.cancelAnimationFrame = (id) => clearTimeout(id)
  }
  globalThis.requestAnimationFrame = window.requestAnimationFrame
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame
}

export function resetBrowserMocks() {
  intersectionObservers.clear()
  resizeObservers.clear()
  mediaQueryLists.clear()
  mediaMatches = {}
}
