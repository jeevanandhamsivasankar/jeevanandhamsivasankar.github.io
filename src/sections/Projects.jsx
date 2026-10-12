import { PROJECTS } from "../data/projects.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";

const DEFAULT_META = { id: "projects", icon: "rocket_launch", labelText: "04 — Engineering Projects", title: "Selected Work" };

export default function Projects({ meta = DEFAULT_META }) {
  return (
    <Section id={meta.id} className="section-wrap" style={{ background: "var(--bg2)" }} label={{ icon: meta.icon, text: meta.labelText }} title={meta.title}>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.num} className={`project-card reveal${p.wide ? " wide" : ""} d${i % 2}`}
            style={{ borderColor: p.border }}
            onMouseOver={e => { e.currentTarget.style.borderColor = p.color + "99"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = p.border; }}>
            <div className="project-card-line" style={{ background: p.line }} />
            <div className="project-period">{p.period}</div>
            <div className="project-top">
              <div className="pico" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <Icon name={p.icon} size={26} fill={0} wght={200} style={{ color: p.color }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="project-num" style={{ color: p.color }}>{p.num}</div>
                <div className="project-domain">{p.domain}</div>
              </div>
            </div>
            <div className="project-title">{p.title}</div>
            <p className="project-desc">{p.desc}</p>
            <div className="project-tags">
              {p.tags.map(t => (
                <span key={t} className="ptag2" style={{ color: p.color, background: p.bg, borderColor: p.border }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
