import { ABOUT_PARAGRAPHS, STATS } from "../data/profile.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";
import RichText from "../components/ui/RichText.jsx";

export default function About() {
  return (
    <Section id="about" className="section-wrap" label={{ icon: "person", text: "01 — About" }} title="Who I Am">
      <div className="about-grid">
        <div className="about-text reveal">
          {ABOUT_PARAGRAPHS.map((segments, i) => (
            <p key={i} style={i === 0 ? undefined : { marginTop: 14 }}><RichText segments={segments} /></p>
          ))}
        </div>
        <div className="stats">
          {STATS.map(({ icon, num, label, color }, i) => (
            <div key={label} className={`stat-card reveal d${i}`}
              onMouseOver={e => { e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.boxShadow = `0 16px 48px ${color}22, inset 0 1px 0 var(--glass-shine)`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <Icon name={icon} size={27} fill={0} wght={200} style={{ color }} />
              <div className="stat-num" style={{ color }}>{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
