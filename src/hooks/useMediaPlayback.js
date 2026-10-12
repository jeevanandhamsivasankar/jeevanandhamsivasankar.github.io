import { useCallback, useEffect, useRef, useState } from "react";

const hasIO = () => typeof IntersectionObserver === "function";

/** Observe `ref`; calls onChange(isIntersecting). Returns nothing; cleans up itself. */
function useObserve(ref, options, onChange) {
  const { rootMargin, threshold } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasIO()) return undefined;
    const obs = new IntersectionObserver(
      (entries) => onChange(entries[entries.length - 1].isIntersecting),
      { rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin, threshold, onChange]);
}

/**
 * Lazy-load and playback policy for a MediaSlot video (FR-MEDIA-012, AC1/AC3/AC4).
 * - `near`: true (sticky) once the slot is within one viewport, or the user pressed play.
 * - ambient clips autoplay muted only while >= 50 % visible, the tab is visible, motion is
 *   allowed and the user has not paused them; they pause as soon as any condition fails.
 * @param {{current: HTMLElement|null}} slotRef element observed for visibility
 * @param {{current: HTMLVideoElement|null}} videoRef the video element
 * @param {{ambient: boolean, reduced: boolean}} opts
 * @returns {{near: boolean, playing: boolean, toggle: () => void, onPlay: () => void, onPause: () => void}}
 */
export function useMediaPlayback(slotRef, videoRef, { ambient, reduced }) {
  // Without IntersectionObserver, load eagerly-on-mount rather than never.
  const [near, setNear] = useState(() => !hasIO());
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const wantPlay = useRef(false); // user pressed play before the sources were attached

  const onNear = useCallback((v) => { if (v) setNear(true); }, []);
  useObserve(slotRef, { rootMargin: "100% 0px 100% 0px", threshold: 0 }, onNear);
  useObserve(slotRef, { rootMargin: "0px", threshold: 0.5 }, setVisible);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVis = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const shouldAutoplay = ambient && !reduced && near && visible && pageVisible && !userPaused;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !near) return;
    if (shouldAutoplay || wantPlay.current) {
      wantPlay.current = false;
      if (shouldAutoplay) v.muted = true;
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else if (!userPaused && !v.paused) {
      v.pause?.();
    }
  }, [shouldAutoplay, near, userPaused, videoRef]);

  // Any clip stops when scrolled away or the tab is hidden (AC3), user-started or not.
  useEffect(() => {
    const v = videoRef.current;
    if (v && near && (!visible || !pageVisible) && !v.paused) v.pause?.();
  }, [visible, pageVisible, near, videoRef]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!near) {
      wantPlay.current = true;
      setUserPaused(false);
      setNear(true);
      return;
    }
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      setUserPaused(true);
      v.pause?.();
    }
  }, [videoRef, near]);

  const onPlay = useCallback(() => setPlaying(true), []);
  const onPause = useCallback(() => setPlaying(false), []);

  return { near, playing, toggle, onPlay, onPause };
}
