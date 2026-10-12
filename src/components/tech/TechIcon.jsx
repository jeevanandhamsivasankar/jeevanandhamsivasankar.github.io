import { useState } from "react";
import { ICON_STRATEGIES, fallbackIcon, parseIconRef } from "./iconStrategies.js";

export default function TechIcon({ icon, color, size = 22 }) {
  const [failed, setFailed] = useState(false);
  const { kind, value } = parseIconRef(icon);
  const strategy = (kind && ICON_STRATEGIES[kind]) || fallbackIcon;
  return strategy({ value, color, size, failed, onError: () => setFailed(true) });
}
