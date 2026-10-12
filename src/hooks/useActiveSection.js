import { useState, useEffect } from "react";

export const ACTIVE_OFFSET_PX = 140;

/** "Last match wins" active-section picker. */
export function pickActiveSection(nodes, scrollY, offset = ACTIVE_OFFSET_PX, defaultId = "hero") {
  let cur = defaultId;
  for (const s of nodes) if (scrollY >= s.offsetTop - offset) cur = s.dataset.section;
  return cur;
}

export function useActiveSection(defaultId = "hero", offset = ACTIVE_OFFSET_PX) {
  const [active, setActive] = useState(defaultId);
  useEffect(() => {
    const onScroll = () =>
      setActive(
        pickActiveSection(document.querySelectorAll("[data-section]"), window.scrollY, offset, defaultId),
      );
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [defaultId, offset]);
  return active;
}

/** One-shot re-scroll to the URL hash once lazy placeholders ahead of it are replaced. */
export function useHashScroll(rootRef, { timeoutMs = 10000 } = {}) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver !== "function") return undefined;
    let disarm = () => {};

    const arm = () => {
      disarm();
      const root = rootRef.current;
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!id || !root || !root.querySelector("[data-section-placeholder]")) return;

      const isReady = () => {
        const t = document.getElementById(id);
        if (!t || t.hasAttribute("data-section-placeholder")) return null;
        for (const p of root.querySelectorAll("[data-section-placeholder]")) {
          if (p.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) return null;
        }
        return t;
      };

      const mo = new MutationObserver(() => {
        const t = isReady();
        if (!t) return;
        if (t.hasAttribute("data-section")) t.scrollIntoView({ block: "start" });
        disarm();
      });
      mo.observe(root, { childList: true, subtree: true });
      const timer = setTimeout(() => disarm(), timeoutMs);
      const events = ["wheel", "touchstart", "keydown"];
      const stop = () => disarm();
      events.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
      disarm = () => {
        mo.disconnect();
        clearTimeout(timer);
        events.forEach((ev) => window.removeEventListener(ev, stop));
        disarm = () => {};
      };
    };

    arm();
    window.addEventListener("hashchange", arm);
    return () => {
      window.removeEventListener("hashchange", arm);
      disarm();
    };
  }, [rootRef, timeoutMs]);
}
