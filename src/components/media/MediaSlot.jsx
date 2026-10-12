import { useEffect, useRef, useState } from "react";
import { checkMediaItem, LONG_CLIP_SECONDS } from "../../models/mediaSchema.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { useMediaPlayback } from "../../hooks/useMediaPlayback.js";
import Icon from "../ui/Icon.jsx";

const PLACEHOLDER_LABEL = "PLACEHOLDER - OWNER MEDIA";

/** Placeholders are for development and preview only (FR-MEDIA-013). */
function placeholdersEnabled() {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get("placeholders") === "1";
  } catch {
    return false;
  }
}

const DEV_PLACEHOLDERS = ["", "src", "assets", "placeholders", "urls.js"]; // joined at runtime: not resolvable by the bundler

function Placeholder({ kind }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let live = true;
    // Dead-code-eliminated in production builds, so no placeholder file is emitted or referenced.
    if (import.meta.env.DEV) {
      // Root-relative + @vite-ignore: served by the dev server, never part of the build graph.
      import(/* @vite-ignore */ DEV_PLACEHOLDERS.join("/"))
        .then((m) => { if (live) setUrl(m.default[kind]); })
        .catch(() => {});
    }
    return () => { live = false; };
  }, [kind]);
  return (
    <div className="media-slot__placeholder" data-testid="media-placeholder">
      {url && <img src={url} alt="" width="1280" height="720" loading="lazy" decoding="async" />}
      <span className="media-slot__label">{PLACEHOLDER_LABEL}</span>
    </div>
  );
}

function VideoSlot({ item, reduced }) {
  const slotRef = useRef(null);
  const videoRef = useRef(null);
  const ambient = item.ambient === true && item.narrated !== true;
  const { near, playing, toggle, onPlay, onPause } = useMediaPlayback(slotRef, videoRef, { ambient, reduced });
  const long = (item.durationSec ?? Infinity) > LONG_CLIP_SECONDS;
  const showButton = long || reduced || !ambient; // short ambient loops need no control
  const label = item.alt || item.description;
  return (
    <div ref={slotRef} className="media-slot__frame" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
      <video
        key={near ? "loaded" : "idle"}
        ref={videoRef}
        className="media-slot__media"
        poster={item.poster}
        width={item.width}
        height={item.height}
        playsInline
        muted={ambient}
        loop={ambient}
        preload="none"
        aria-label={label}
        onPlay={onPlay}
        onPause={onPause}
      >
        {near && item.sources.webm && <source src={item.sources.webm} type="video/webm" />}
        {near && item.sources.mp4 && <source src={item.sources.mp4} type="video/mp4" />}
        {near && item.captions && (
          <track kind="captions" src={item.captions.src} srcLang={item.captions.srclang} label={item.captions.label} default={item.narrated === true} />
        )}
      </video>
      {showButton && (
        <button type="button" className="media-slot__toggle" onClick={toggle} aria-pressed={playing}
          aria-label={`${playing ? "Pause" : "Play"} video: ${label}`}>
          <Icon name={playing ? "pause" : "play_arrow"} size={22} />
        </button>
      )}
      {item.description && <p className="media-slot__caption">{item.description}</p>}
    </div>
  );
}

/**
 * Owner-supplied image/video slot (US-212, FR-MEDIA-012/013).
 * - Valid manifest `item` (rights confirmed, local URLs, captions if narrated): renders it lazily.
 * - Otherwise (no item, invalid item, narrated video without captions): empty state. Production
 *   renders `fallback` (the existing SVG/icon art); dev/preview (`import.meta.env.DEV` or
 *   `?placeholders=1`) renders the labelled placeholder instead, never for `nda` slots.
 * @param {{item?: object, fallback?: import("react").ReactNode, kind?: "screenshot"|"video", nda?: boolean, className?: string}} props
 */
export default function MediaSlot({ item, fallback = null, kind = "screenshot", nda = false, className = "" }) {
  const reduced = usePrefersReducedMotion();
  const valid = item !== undefined && item !== null && checkMediaItem(item) === null && !nda;
  const cls = `media-slot${className ? ` ${className}` : ""}`;
  if (valid && item.kind === "image") {
    return (
      <figure className={cls} data-state="image">
        <img className="media-slot__media" src={item.src} width={item.width} height={item.height}
          alt={item.alt || item.description} loading="lazy" decoding="async" />
        {item.description && <figcaption className="media-slot__caption">{item.description}</figcaption>}
      </figure>
    );
  }
  if (valid) {
    return (
      <figure className={cls} data-state="video">
        <VideoSlot item={item} reduced={reduced} />
      </figure>
    );
  }
  if (!nda && placeholdersEnabled()) {
    return (
      <div className={cls} data-state="placeholder"><Placeholder kind={kind} /></div>
    );
  }
  return (
    <div className={cls} data-state="empty" aria-hidden="true">{fallback}</div>
  );
}
