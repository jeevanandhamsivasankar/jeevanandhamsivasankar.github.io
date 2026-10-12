// Owner-media manifest schema (US-212, FR-MEDIA-011/012). No React.
// An item is only publishable when rights are confirmed, it has alt/description text and every
// URL is local (no third-party origin). `checkMediaItem` never throws (used by the slot to fall
// back to its empty state); `createMediaItem` throws ModelValidationError for the manifest.
import { deepFreeze, fail } from "./validate.js";

const M = "MediaItem";
const KEYS = [
  "id", "kind", "src", "sources", "poster", "width", "height", "alt", "description", "narrated",
  "captions", "durationSec", "ambient", "rightsConfirmed",
];
/** Clips longer than this need a visible pause/play control (AC4). */
export const LONG_CLIP_SECONDS = 5;

const nonEmpty = (v) => typeof v === "string" && v.trim() !== "";
const posNum = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;

/** True for same-origin paths only: "/a/b.webm" or "a/b.webm"; false for schemes and "//host". */
export function isLocalUrl(v) {
  return nonEmpty(v) && !v.startsWith("//") && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v) && !v.includes("\\");
}

/**
 * Validate a raw media item.
 * @param {unknown} raw
 * @returns {{field: string, reason: string} | null} first problem, or null when valid
 */
export function checkMediaItem(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { field: "value", reason: "must be an object" };
  }
  for (const k of Object.keys(raw)) {
    if (!KEYS.includes(k)) return { field: k, reason: "is not a known field" };
  }
  if (!nonEmpty(raw.id)) return { field: "id", reason: "must be a non-empty string" };
  if (raw.kind !== "image" && raw.kind !== "video") return { field: "kind", reason: 'must be "image" or "video"' };
  if (raw.rightsConfirmed !== true) return { field: "rightsConfirmed", reason: "must be true" };
  if (!nonEmpty(raw.alt) && !nonEmpty(raw.description)) {
    return { field: "alt", reason: "or description is required" };
  }
  if (!posNum(raw.width)) return { field: "width", reason: "must be a positive number" };
  if (!posNum(raw.height)) return { field: "height", reason: "must be a positive number" };
  if (raw.kind === "image") {
    if (!isLocalUrl(raw.src)) return { field: "src", reason: "must be a local URL" };
    return null;
  }
  const s = raw.sources;
  if (!s || typeof s !== "object" || (!s.webm && !s.mp4)) {
    return { field: "sources", reason: "needs a webm or mp4 URL" };
  }
  for (const [fmt, url] of Object.entries(s)) {
    if (fmt !== "webm" && fmt !== "mp4") return { field: "sources", reason: `unknown format ${fmt}` };
    if (!isLocalUrl(url)) return { field: `sources.${fmt}`, reason: "must be a local URL" };
  }
  if (!isLocalUrl(raw.poster)) return { field: "poster", reason: "must be a local URL" };
  if (raw.captions !== undefined) {
    const c = raw.captions;
    if (!c || !isLocalUrl(c.src) || !nonEmpty(c.srclang) || !nonEmpty(c.label)) {
      return { field: "captions", reason: "needs local src, srclang and label" };
    }
  }
  if (raw.narrated === true && raw.captions === undefined) {
    return { field: "captions", reason: "is required for a narrated video" };
  }
  if (raw.durationSec !== undefined && !posNum(raw.durationSec)) {
    return { field: "durationSec", reason: "must be a positive number" };
  }
  return null;
}

/**
 * Build a frozen manifest item.
 * @throws ModelValidationError `Invalid MediaItem: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<object>} frozen item
 */
export function createMediaItem(raw) {
  const bad = checkMediaItem(raw);
  if (bad) fail(M, bad.field, bad.reason);
  return deepFreeze(structuredClone(raw));
}
