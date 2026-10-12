import { useState, useCallback } from "react";
import { resolveIntroMode } from "../lib/intro.js";

/** Intro visibility for this page load (US-208). `enabled` is SITE.intro. @returns {[boolean, () => void]} */
export function useIntro(enabled) {
  const [on, setOn] = useState(() => resolveIntroMode(enabled) === "full");
  const end = useCallback(() => setOn(false), []);
  return [on, end];
}
