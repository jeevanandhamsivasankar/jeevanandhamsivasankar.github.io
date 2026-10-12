import { useState, useRef, useEffect } from "react";
import { useThemeContext } from "../../context/ThemeContext.jsx";
import { useActiveSection } from "../../hooks/useActiveSection.js";
import { useScrolled } from "../../hooks/useScrolled.js";
import Icon from "../ui/Icon.jsx";
import { BRAND_TEXT } from "../../config/site.js";

export default function Nav({ items: allItems }) {
  const items = allItems.filter((i) => i.showInNav !== false);
  const { isDay, toggle, now } = useThemeContext();
  const active = useActiveSection();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Primary">
        <div className="nav-logo">
          <Icon name="developer_board" size={17} />
          {BRAND_TEXT}
        </div>
        <ul className="nav-links" style={{ listStyle: "none", display: "flex", gap: 2, margin: 0, padding: 0 }}>
          {items.map(({ id, icon, label }) => (
            <li key={id}>
              <a href={`#${id}`} className={`nav-link${active === id ? " active" : ""}`}>
                <Icon name={icon} size={13} />
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <div className="theme-badge">
            <Icon name={isDay ? "wb_sunny" : "nights_stay"} size={12} />
            {isDay ? "DAY" : "NIGHT"} · {timeStr}
          </div>
          <button className="theme-btn" onClick={toggle} title="Toggle day/night theme">
            <Icon name={isDay ? "dark_mode" : "light_mode"} size={14} />
            {isDay ? "Night" : "Day"}
          </button>
          <button
            ref={hamburgerRef}
            className="hamburger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
      <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`}>
        {items.map(({ id, icon, label }) => (
          <a key={id} href={`#${id}`} className={`nav-link${active === id ? " active" : ""}`} onClick={() => setOpen(false)}>
            <Icon name={icon} size={15} />
            {label}
          </a>
        ))}
        <button
          className="theme-btn"
          onClick={() => {
            toggle();
            setOpen(false);
          }}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          <Icon name={isDay ? "dark_mode" : "light_mode"} size={14} />
          Switch to {isDay ? "Night" : "Day"} Mode
        </button>
      </div>
    </>
  );
}
