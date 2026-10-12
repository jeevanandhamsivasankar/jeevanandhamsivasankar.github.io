import { useEffect } from "react";

export const REVEAL_THRESHOLD = 0.06;

/** Adds `visible` to `.reveal` descendants of rootRef when they intersect. */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".reveal");
    const showAll = () => els.forEach((el) => el.classList.add("visible"));
    if (typeof IntersectionObserver !== "function") {
      showAll();
      return undefined;
    }
    let obs;
    try {
      obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          }),
        { threshold: REVEAL_THRESHOLD },
      );
    } catch {
      showAll();
      return undefined;
    }
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [rootRef]);
}
