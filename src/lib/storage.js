// UNIT-STORAGE: guarded accessor for the persisted manual theme override. Never throws, never logs.
import { THEME_STORAGE_KEY } from "../config/site.js";

/** @param {Storage} [storage] @returns {"day"|"night"|null} */
export function readThemeOverride(storage) {
  try {
    const s = storage === undefined ? globalThis.localStorage : storage;
    if (s === null || s === undefined) return null;
    const v = s.getItem(THEME_STORAGE_KEY);
    return v === "day" || v === "night" ? v : null;
  } catch {
    return null;
  }
}

/** @param {"day"|"night"} theme @param {Storage} [storage] @returns {boolean} true if written */
export function writeThemeOverride(theme, storage) {
  if (theme !== "day" && theme !== "night") return false;
  try {
    const s = storage === undefined ? globalThis.localStorage : storage;
    if (s === null || s === undefined) return false;
    s.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
