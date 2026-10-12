import { Fragment, useMemo, useRef } from "react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import GradientOrbs from "./components/effects/GradientOrbs.jsx";
import CursorGlow from "./components/effects/CursorGlow.jsx";
import Nav from "./components/layout/Nav.jsx";
import Footer from "./components/layout/Footer.jsx";
import Divider from "./components/layout/Divider.jsx";
import SectionSlot from "./components/layout/SectionSlot.jsx";
import { SECTIONS } from "./config/sections.js";
import { useHashScroll } from "./hooks/useActiveSection.js";
import Overlays from "./components/effects/Overlays.jsx";
import { SITE } from "./config/site.js";

export default function App({ sections = SECTIONS }) {
  const navItems = useMemo(() => sections.filter((s) => s.showInNav), [sections]);
  const mainRef = useRef(null);
  useHashScroll(mainRef);

  return (
    <ThemeProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Overlays introEnabled={SITE.intro} />
      <GradientOrbs />
      <CursorGlow />
      <Nav items={navItems} />
      <main id="main" tabIndex={-1} ref={mainRef}>
        {sections.map((entry, i) => (
          <Fragment key={entry.id}>
            {i > 0 && <Divider />}
            <SectionSlot entry={entry} />
          </Fragment>
        ))}
      </main>
      <Footer />
    </ThemeProvider>
  );
}
