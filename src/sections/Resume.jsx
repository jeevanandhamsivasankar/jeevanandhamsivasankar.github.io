import { RESUME } from "../config/site.js";
import { RESUME_PREVIEW } from "../data/profile.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";
import Button from "../components/ui/Button.jsx";

export default function Resume() {
  return (
    <Section as="div" id="resume" className="full-band" inner label={{ icon: "description", text: "08 — Resume" }}>
      <div className="resume-inner">
        <div className="resume-info reveal">
          <h3>{RESUME_PREVIEW.heading}</h3>
          <p>{RESUME_PREVIEW.intro}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="green" href={RESUME.href} download={RESUME.downloadName} icon="download">Download PDF</Button>
            <Button variant="outline" href={RESUME.href} external icon="open_in_new">View Online</Button>
          </div>
        </div>
        <div className="resume-preview reveal d1">
          <div className="resume-preview-header"><Icon name="picture_as_pdf" size={14} />{RESUME_PREVIEW.fileLabel} &nbsp;·&nbsp; {RESUME.pages} PAGES</div>
          <div className="rdp-name">{RESUME_PREVIEW.name}</div>
          <div className="rdp-role">{RESUME_PREVIEW.roleLine}</div>
          <div className="rdp-line" />
          {RESUME_PREVIEW.contactRows.map(({ icon, text }) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--muted)", marginBottom:5 }}>
              <Icon name={icon} size={11} style={{ color:"var(--amber)" }} />{text}
            </div>
          ))}
          <div className="rdp-line" />
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9.5, color:"var(--text2)", marginBottom:10, letterSpacing:"0.12em" }}>{RESUME_PREVIEW.skillsHeading}</div>
          {RESUME_PREVIEW.bars.map(({ label, w, g }) => (
            <div key={label} className="rdp-skill-row">
              <span className="rdp-label">{label}</span>
              <div className="rdp-bar"><div className="rdp-bar-fill" style={{ width: w, background: g }} /></div>
            </div>
          ))}
          <div className="rdp-line" />
          <div style={{ display:"flex", gap:10 }}>
            <a href={RESUME.href} download={RESUME.downloadName} style={{ display:"inline-flex", alignItems:"center", gap:4, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--green)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:3, padding:"5px 10px", transition:"all 0.2s", textDecoration:"none" }}
              onMouseOver={e => e.currentTarget.style.background="rgba(52,211,153,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
              <Icon name="download" size={12} />Download
            </a>
            <a href={RESUME.href} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--amber)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:3, padding:"5px 10px", transition:"all 0.2s", textDecoration:"none" }}
              onMouseOver={e => e.currentTarget.style.background="rgba(245,158,11,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
              <Icon name="open_in_new" size={12} />View
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
