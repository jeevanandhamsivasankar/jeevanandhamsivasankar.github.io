import { CERTIFICATIONS } from "../data/certifications.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function Certifications() {
  return (
    <Section as="div" id="certifications" className="full-band" style={{ background: "var(--surf)", borderTop: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }} inner label={{ icon: "verified", text: "07 — Certifications" }} title="Credentials">
      <div className="certs-grid">
        {CERTIFICATIONS.map((cert, i) => (
          <div key={cert.name} className={`cert-card reveal d${i}`}>
            <div className="cert-ico"><Icon name={cert.icon} size={24} style={{ color: "#f59e0b" }} /></div>
            <div className="cert-name">{cert.name}</div>
            <div className="cert-org">{cert.org}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
