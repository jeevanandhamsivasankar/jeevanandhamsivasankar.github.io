// UNIT-INTRO: ignition intro state machine (FR-MOTION-005). Pure; never throws.
export const INTRO_KEY = "jsv-intro-played";
export const INTRO_MAX_MS = 1200;
export const INTRO_EVENTS = Object.freeze(["keydown", "pointerdown", "wheel", "touchstart"]);

/** @param {Storage} [storage] sessionStorage by default @returns {boolean|null} null if unavailable */
export function hasPlayed(storage) {
  try {
    const s = storage === undefined ? globalThis.sessionStorage : storage;
    if (s === null || s === undefined) return null;
    return s.getItem(INTRO_KEY) === "1";
  } catch {
    return null;
  }
}

/** @param {Storage} [storage] @returns {boolean} true if written */
export function markPlayed(storage) {
  try {
    const s = storage === undefined ? globalThis.sessionStorage : storage;
    if (s === null || s === undefined) return false;
    s.setItem(INTRO_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Decide whether the intro runs. "full" only when enabled, motion allowed, storage usable and not yet played.
 * @param {{ enabled: boolean, reduced: boolean, storage?: Storage }} o
 * @returns {"full"|"none"}
 */
export function decideIntro({ enabled, reduced, storage }) {
  if (!enabled || reduced) return "none";
  return hasPlayed(storage) === false ? "full" : "none";
}

/** Reads the flag, the `?intro=1` QA override and reduced motion from the environment. */
export function resolveIntroMode(flag, win = globalThis.window) {
  let enabled = flag === true;
  try {
    if (win?.location?.search && new URLSearchParams(win.location.search).get("intro") === "1") enabled = true;
  } catch {
    /* ignore */
  }
  const reduced = typeof win?.matchMedia === "function" && win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return decideIntro({ enabled, reduced });
}
