import { SKILL_CATEGORIES, SAFETY_HIGHLIGHT } from "../data/skills.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";
import SkillChip from "../components/tech/SkillChip.jsx";

export default function Skills() {
  return (
    <Section id="skills" className="section-wrap" label={{ icon: "build", text: "03 — Skills" }} title="Toolbox">
      <div className="skills-categories">
        {SKILL_CATEGORIES.map((cat, ci) => (
          <div key={cat.label} className={`skill-cat reveal d${ci % 3}`}>
            <div className="cat-header">
              <span className="cat-badge" style={{
                color: cat.headerColor,
                background: cat.headerBg,
                border: `1px solid ${cat.headerColor}44`,
              }}>
                {cat.label}
              </span>
              <div className="cat-line" style={{
                background: `linear-gradient(to right, ${cat.headerColor}55, transparent)`,
              }} />
            </div>
            <div className="skill-chips">
              {cat.skills.map(skill => (
                <SkillChip key={skill.name} skill={skill} catColor={cat.headerColor} />
              ))}
            </div>
          </div>
        ))}

        {/* ISO 26262 Feature Strip */}
        <div className="iso-strip reveal">
          <div className="iso-strip-icon">
            <Icon name={SAFETY_HIGHLIGHT.icon} size={26} fill={1} style={{ color: "#f59e0b" }} />
          </div>
          <div className="iso-strip-body">
            <div className="iso-strip-title">
              <Icon name={SAFETY_HIGHLIGHT.titleIcon} size={14} fill={1} style={{ color:"#f59e0b", marginRight:5 }} />
              {SAFETY_HIGHLIGHT.title}
            </div>
            <p className="iso-strip-desc">
              {SAFETY_HIGHLIGHT.desc}
            </p>
            <div className="iso-chips">
              {SAFETY_HIGHLIGHT.chips.map(t => (
                <span key={t} className="iso-chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
