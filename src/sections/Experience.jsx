import { EXPERIENCE } from "../data/experience.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function Experience() {
  return (
    <Section as="div" id="experience" className="exp-band full-band" inner label={{ icon: "work", text: "02 — Experience" }} title="Career">
      <div className="exp-timeline">
        {EXPERIENCE.map((exp, i) => (
          <div key={i} className={`exp-item reveal d${Math.min(i, 3)}`}>
            <div className="exp-dot" />
            <div className="exp-header">
              <div className="exp-left">
                <div className="exp-icon"><Icon name={exp.icon} size={22} fill={0} wght={300} style={{ color: "#f59e0b" }} /></div>
                <div>
                  <div className="exp-role">{exp.role}</div>
                  <div className="exp-company-name">{exp.company}</div>
                </div>
              </div>
              <div className="exp-right">
                <div className="exp-period">{exp.period}</div>
                <div className="exp-company-loc">{exp.location}</div>
              </div>
            </div>
            <p className="exp-desc">{exp.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
