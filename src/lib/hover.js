// UNIT-HOVER: false only when the primary input cannot hover (avoids sticky hover on touch). Defaults to true.
export function canHover(win = globalThis.window) {
  try {
    return typeof win?.matchMedia !== "function" || !win.matchMedia("(hover: none)").matches;
  } catch {
    return true;
  }
}
