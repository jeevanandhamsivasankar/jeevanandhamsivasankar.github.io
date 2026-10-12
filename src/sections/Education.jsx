import { EDUCATION } from "../data/education.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";

const DOMAIN_TAG_STYLE = { fontFamily:"'Share Tech Mono',monospace", fontSize:9.5, color:"var(--amber)", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:3, padding:"3px 8px" };

export default function Education() {
  return (
    <Section id="education" className="section-wrap" label={{ icon: "school", text: "06 — Education" }} title="Academic Background">
      <div className="edu-grid">
        {EDUCATION.map((edu, i) => (
          <div key={edu.title} className={i === 0 ? "edu-card reveal" : `edu-card reveal d${i}`}>
            <div className="edu-icon"><Icon name={edu.icon} size={26} fill={0} wght={200} style={{ color: edu.iconColor }} /></div>
            <div className="edu-degree">{edu.title}</div>
            <div className="edu-school">{edu.subtitle}</div>
            <div className="edu-row">
              {edu.tags.map(t => (
                edu.tagVariant === "edu"
                  ? <span key={t} className="edu-tag">{t}</span>
                  : <span key={t} style={DOMAIN_TAG_STYLE}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
