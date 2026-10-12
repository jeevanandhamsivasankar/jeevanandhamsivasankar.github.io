import { DESIGN_CARDS } from "../data/design.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";
import DesignArt from "../components/widgets/DesignArt.jsx";

const DEFAULT_META = { id: "design", icon: "brush", labelText: "05 — Design Portfolio", title: "Creative Work" };

export default function Design({ meta = DEFAULT_META }) {
  return (
    <Section as="div" id={meta.id} className="full-band" style={{ background: "var(--bg2)", borderTop: "1px solid var(--bdr)" }} inner label={{ icon: meta.icon, text: meta.labelText }} title={meta.title}>
      <div className="behance-grid">
        {DESIGN_CARDS.map((card, i) => (
          <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer"
            className={`behance-card reveal d${i % 2}${card.wide ? " wide" : ""}`}>
            <div className="behance-card-bg"><DesignArt artKey={card.artKey} /></div>
            <div className="behance-overlay" />
            <div className="behance-card-content">
              <div className="bc-tag" style={{ color: card.color }}><Icon name={card.icon} size={13} />{card.tag}</div>
              <div className="bc-title">{card.title}</div>
              <div className="bc-desc">{card.desc}</div>
              <div className="bc-cta" style={{ color: card.color }}><Icon name="open_in_new" size={14} />View on Behance</div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
