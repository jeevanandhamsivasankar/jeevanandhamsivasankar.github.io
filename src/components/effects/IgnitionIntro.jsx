import { useEffect, useRef } from "react";
import { INTRO_EVENTS, INTRO_MAX_MS, markPlayed } from "../../lib/intro.js";

const LAMPS = 6;
const cancelAll = (anims) =>
  anims.forEach((a) => {
    try {
      a.cancel();
    } catch {
      /* ignore */
    }
  });

/**
 * Ignition intro overlay (US-208). Decorative (aria-hidden) with a labelled skip button.
 * Animates transform/opacity only via WAAPI; ends within INTRO_MAX_MS or on any input.
 * @param {{ onDone: () => void }} props
 */
export default function IgnitionIntro({ onDone }) {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    markPlayed();
    const anims = [];
    const add = (el, kf, o) => {
      if (el && typeof el.animate === "function") anims.push(el.animate(kf, { fill: "both", ...o }));
    };
    const q = (s) => root.querySelector(s);
    add(q(".intro-needle"), [{ transform: "rotate(-215deg)" }, { transform: "rotate(35deg)", offset: 0.45 }, { transform: "rotate(-215deg)" }], { duration: 900, delay: 100, easing: "cubic-bezier(0.83, 0, 0.17, 1)" });
    add(q(".intro-ring"), [{ transform: "scale(0.9)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 400, easing: "cubic-bezier(0.05, 0.7, 0.1, 1)" });
    add(q(".intro-scan"), [{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: "translateY(100vh)", opacity: 0 }], { duration: 600, easing: "cubic-bezier(0.2, 0, 0, 1)" });
    root.querySelectorAll(".intro-lamp").forEach((l, i) =>
      add(l, [{ opacity: 0.1 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 0.1 }], { duration: 560 + i * 30, delay: 120, easing: "linear" }),
    );
    add(root, [{ opacity: 1 }, { opacity: 1, offset: 0.83 }, { opacity: 0 }], { duration: INTRO_MAX_MS - 100, easing: "linear" });
    const finish = () => onDone();
    const timer = setTimeout(finish, INTRO_MAX_MS - 100);
    INTRO_EVENTS.forEach((ev) => window.addEventListener(ev, finish, { passive: true, capture: true }));
    return () => {
      clearTimeout(timer);
      INTRO_EVENTS.forEach((ev) => window.removeEventListener(ev, finish, { capture: true }));
      cancelAll(anims);
    };
  }, [onDone]);

  return (
    <div ref={rootRef} className="intro-root" data-testid="ignition-intro">
      <div className="intro-art" aria-hidden="true">
        <div className="intro-scan" />
        <div className="intro-dial">
          <div className="intro-ring" />
          <div className="intro-needle" />
        </div>
        <div className="intro-lamps">
          {Array.from({ length: LAMPS }, (_, i) => (
            <span key={i} className="intro-lamp" />
          ))}
        </div>
      </div>
      <button type="button" className="intro-skip" onClick={onDone}>
        Skip intro
      </button>
    </div>
  );
}
