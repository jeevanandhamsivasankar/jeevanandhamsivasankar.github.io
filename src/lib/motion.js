/**
 * Motion duration tokens in milliseconds; mirror of src/styles/motion.css.
 * @type {Readonly<Record<string, number>>}
 */
export const MOTION_MS = Object.freeze({
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
  deliberate: 600,
  theme: 360,
  "intro-max": 1200,
});

/**
 * Resolve a motion token to milliseconds.
 * @param {string} token Token name, with or without the `--dur-` prefix.
 * @param {boolean} reduced True when the user prefers reduced motion.
 * @returns {number} 0 when reduced (or token unknown), otherwise the token value.
 */
export function motionMs(token, reduced = false) {
  if (reduced) return 0;
  const key = String(token).replace(/^--dur-/, "");
  return Object.prototype.hasOwnProperty.call(MOTION_MS, key) ? MOTION_MS[key] : 0;
}
