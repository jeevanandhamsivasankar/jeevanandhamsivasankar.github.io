// UNIT-ILLUMINATION: transient <html> class lifecycle for the theme switch (FR-MOTION-006).
// The class lives exactly as long as a no-op Web Animation of --dur-theme on <html> (no timers).
import { motionMs } from "./motion.js";

export const SWITCHING_CLASS = "theme-switching";
let current = null;

const stop = (root) => {
  const prev = current;
  current = null;
  if (prev) {
    try {
      prev.cancel();
    } catch {
      /* ignore */
    }
  }
  root?.classList.remove(SWITCHING_CLASS);
};

/**
 * Add the transient class and remove it when the theme duration elapses. A second call restarts the
 * lifecycle so a rapid double toggle never leaves a stuck class. Does nothing (class never added) when
 * reduced motion is set or the Web Animations API is unavailable.
 * @param {HTMLElement} root
 * @param {{ reduced?: boolean, ms?: number }} [o]
 * @returns {boolean} true if a transition was started
 */
export function beginThemeTransition(root, { reduced = false, ms } = {}) {
  if (!root) return false;
  stop(root);
  const dur = ms ?? motionMs("theme", reduced);
  if (reduced || dur <= 0 || typeof root.animate !== "function") return false;
  root.classList.add(SWITCHING_CLASS);
  const anim = root.animate([{ opacity: 1 }, { opacity: 1 }], { duration: dur + 40 });
  current = anim;
  const done = () => {
    if (current === anim) stop(root);
  };
  anim.finished.then(done, () => {});
  return true;
}

/** Cancel any running lifecycle and clear the class (tests, unmount). */
export function cancelThemeTransition(root) {
  stop(root);
}
