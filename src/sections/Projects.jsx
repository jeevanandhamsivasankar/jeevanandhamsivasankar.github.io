import { PROJECTS } from "../data/projects.js";
import { getMedia } from "../data/media.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";
import MediaSlot from "../components/media/MediaSlot.jsx";

const DEFAULT_META = { id: "projects", icon: "rocket_launch", labelText: "04 — Engineering Projects", title: "Selected Work" };
const ROWS = [["problem", "Problem"], ["role", "Role"], ["solution", "Solution"], ["impact", "Impact"]];

/** Existing icon art shown when the owner has not supplied media (decorative). */
function CardArt({ p }) {
  return (
    <div className="project-art" style={{ background: p.bg, borderColor: p.border }}>
      <Icon name={p.icon} size={40} fill={0} wght={200} style={{ color: "var(--pc-ink)" }} />
    </div>
  );
}

/**
 * Case-study project cards (US-211): Problem, Role, Solution, Impact rows built only from the
 * project's own data; rows without a supporting fact are omitted.
 */
export default function Projects({ meta = DEFAULT_META }) {
  return (
    <Section id={meta.id} className="section-wrap" style={{ background: "var(--bg2)" }} label={{ icon: meta.icon, text: meta.labelText }} title={meta.title}>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.num} className={`project-card reveal${p.wide ? " wide" : ""} d${i % 2}`}
            style={{ borderColor: p.border, "--pc": p.color }}
            onMouseOver={e => { e.currentTarget.style.borderColor = p.color + "99"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = p.border; }}>
            <div className="project-card-line" style={{ background: p.line }} />
            <div className="project-period">{p.period}</div>
            <div className="project-top">
              <div className="pico" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <Icon name={p.icon} size={26} fill={0} wght={200} style={{ color: "var(--pc-ink)" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="project-num">{p.num}</div>
                <div className="project-domain">{p.domain}</div>
              </div>
            </div>
            <div className="project-title">{p.title}</div>
            <MediaSlot className="project-media" item={getMedia(`project-${p.num}`)} nda={p.nda === true}
              fallback={<CardArt p={p} />} />
            {p.caseStudy ? (
              <dl className="cs-rows">
                {ROWS.filter(([k]) => p.caseStudy[k]).map(([k, label]) => (
                  <div key={k} className={`cs-row cs-${k}`}>
                    <dt>{label}</dt>
                    <dd>{p.caseStudy[k]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="project-desc">{p.desc}</p>
            )}
            <div className="project-tags">
              {p.tags.map(t => (
                <span key={t} className="ptag2" style={{ background: p.bg, borderColor: p.border }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
