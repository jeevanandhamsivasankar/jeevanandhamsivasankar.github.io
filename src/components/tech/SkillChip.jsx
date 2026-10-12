import { useState } from "react";
import TechIcon from "./TechIcon.jsx";

export default function SkillChip({ skill, catColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="skill-chip"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderColor: hov ? catColor + "66" : "",
        boxShadow: hov ? `0 6px 24px ${catColor}18, inset 0 1px 0 var(--glass-shine)` : "",
      }}
    >
      <div className="chip-icon-wrap">
        <TechIcon icon={skill.icon} color={skill.color || catColor} size={22} />
      </div>
      <span className="chip-label" style={{ color: hov ? (skill.color || catColor) : "" }}>
        {skill.name}
      </span>
    </div>
  );
}
