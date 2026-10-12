import { createElement } from "react";
import Icon from "../ui/Icon.jsx";
import { CUSTOM_SVGS } from "./customSvgs.jsx";

export const SIMPLE_ICONS_BASE = "https://cdn.simpleicons.org/";

const KINDS = ["si", "ms", "svg"];

/** @returns {{ kind: "si"|"ms"|"svg"|null, value: string }} */
export function parseIconRef(ref) {
  if (typeof ref !== "string") return { kind: null, value: "" };
  const i = ref.indexOf(":");
  if (i <= 0) return { kind: null, value: ref };
  const kind = ref.slice(0, i);
  const value = ref.slice(i + 1);
  return KINDS.includes(kind) ? { kind, value } : { kind: null, value };
}

/** Fallback strategy: the generic "code" glyph. */
export const fallbackIcon = ({ color, size }) =>
  createElement(Icon, { name: "code", size, style: { color } });

const si = ({ value, color, size, failed, onError }) => {
  if (failed) return fallbackIcon({ color, size });
  return createElement("img", {
    src: SIMPLE_ICONS_BASE + value,
    width: size,
    height: size,
    style: { display: "block", objectFit: "contain", borderRadius: 2 },
    onError,
    alt: value,
  });
};

const ms = ({ value, color, size }) =>
  createElement(Icon, { name: value, size, style: { color } });

const svg = ({ value, color, size }) => {
  const render = Object.hasOwn(CUSTOM_SVGS, value) ? CUSTOM_SVGS[value] : null;
  return render ? render(color, size) : fallbackIcon({ color, size });
};

export const ICON_STRATEGIES = Object.freeze({ si, ms, svg });
